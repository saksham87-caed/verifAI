import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('gsi-client-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

const signInWithGsiToken = async (): Promise<{ user: User; accessToken: string | null }> => {
  await loadGsiScript();
  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        throw new Error('Google Identity Services SDK failed to load.');
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          if (tokenResponse.access_token) {
            try {
              cachedAccessToken = tokenResponse.access_token;
              const credential = GoogleAuthProvider.credential(null, tokenResponse.access_token);
              const userCredential = await signInWithCredential(auth, credential);
              resolve({ user: userCredential.user, accessToken: cachedAccessToken });
            } catch (fbErr) {
              console.warn('signInWithCredential notice, fetching Google profile directly:', fbErr);
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await userInfoRes.json();
              const profileUser = {
                uid: profile.sub || 'google-' + Date.now(),
                displayName: profile.name || 'Google User',
                email: profile.email,
                photoURL: profile.picture,
              } as User;
              resolve({ user: profileUser, accessToken: cachedAccessToken });
            }
          } else {
            reject(new Error('No access token received from Google.'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Google Sign-In popup error.'));
        },
      });

      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  if (isSigningIn) return null;
  isSigningIn = true;
  try {
    // Attempt standard Firebase popup
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.warn('Firebase popup sign-in notice:', error?.code, error?.message);
    const code = error?.code || '';

    // If iframe/internal-error or origin restrictions prevent Firebase popup, fallback to Google Identity Services
    if (code === 'auth/internal-error' || code === 'auth/popup-blocked' || code === 'auth/network-request-failed') {
      try {
        console.log('Attempting GIS token client fallback for Google Sign-In...');
        return await signInWithGsiToken();
      } catch (gsiErr: any) {
        console.error('GIS fallback error:', gsiErr);
        throw new Error('Google Sign-In popup restricted by browser iframe policies. Click "Open App in New Window" to authenticate directly.');
      }
    } else if (code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in window was closed before completing.');
    } else if (code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in request is already in progress.');
    }

    try {
      return await signInWithGsiToken();
    } catch (finalErr: any) {
      throw new Error(error?.message || 'Google Sign-In failed. Please try again.');
    }
  } finally {
    isSigningIn = false;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};
