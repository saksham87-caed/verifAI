import { Signal, RiskTier, Confidence, DetectedLanguage, Channel, Severity } from './types';
import { normalizeText } from './redaction';
import { computeScoreAndTier } from './scoring';

export interface RuleMatch {
  id: string;
  label: string;
  severity: Severity;
  weight: number;
  evidence: string;
  start: number;
  end: number;
  explanation: string;
}

export interface RuleEngineResult {
  risk_tier: RiskTier;
  risk_score: number;
  confidence: Confidence;
  detected_language: DetectedLanguage;
  channel: Channel;
  signals: Signal[];
  safe_signals: string[];
  summary: string;
  verification_steps: string[];
}

// Known legitimate official domains in India / global
const OFFICIAL_DOMAINS: Record<string, string[]> = {
  sbi: ['onlinesbi.sbi', 'sbi.co.in', 'statebankofindia.com', 'sbicard.com'],
  hdfc: ['hdfcbank.com', 'hdfc.com', 'hdfcbank.net'],
  icici: ['icicibank.com', 'icicidirect.com'],
  axis: ['axisbank.com'],
  pnb: ['pnbindia.in'],
  bob: ['bankofbaroda.in', 'bankofbaroda.com'],
  airtel: ['airtel.in', 'airtel.com'],
  jio: ['jio.com', 'reliancedigital.in'],
  indiapost: ['indiapost.gov.in'],
  amazon: ['amazon.in', 'amazon.com'],
  google: ['google.com', 'google.co.in'],
  phonepe: ['phonepe.com'],
  paytm: ['paytm.com'],
  bescom: ['bescom.karnataka.gov.in', 'bescom.org'],
};

// High-risk disposable / spam TLDs
const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.click', '.icu', '.buzz', '.online', '.site',
  '.vip', '.work', '.cfd', '.quest', '.gq', '.tk', '.ml', '.cf',
  '.cc', '.to', '.pw', '.club', '.stream', '.rest',
];

// Shortener domains
const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'cutt.ly', 'is.gd',
  'shorturl.at', 'goo.gl', 'ow.ly', 'buff.ly', 'rebrand.ly',
];

/**
 * Extracts and returns matching substrings with their start/end indices in the original text.
 */
function findMatchInText(
  originalText: string,
  regex: RegExp
): { evidence: string; start: number; end: number } | null {
  const match = regex.exec(originalText);
  if (!match) return null;
  const evidence = match[0];
  const start = match.index;
  const end = start + evidence.length;
  return { evidence, start, end };
}

/**
 * Detects language: en, hi, or mixed
 */
export function detectLanguage(text: string): DetectedLanguage {
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;

  if (devanagariCount > 10 && latinCount < devanagariCount / 2) {
    return 'hi';
  }
  if (devanagariCount > 5 && latinCount > 10) {
    return 'mixed';
  }
  // Check for Hinglish / Romanized Hindi indicators
  const hinglishKeywords = /\b(aapka|apka|hai|karein|kare|band|ho|jayega|turant|sampark|bhejein|khata|paisa|milega)\b/i;

  if (hinglishKeywords.test(text)) {
    return 'mixed';
  }

  return 'en';
}

/**
 * Detects channel: email or sms
 */
export function detectChannel(text: string, declaredChannel?: Channel | 'auto'): Channel {
  if (declaredChannel && declaredChannel !== 'auto') {
    return declaredChannel;
  }
  // If text contains headers, subject lines, HTML anchors, or salutation/sign-off blocks, it's email
  if (
    /^(subject:|from:|to:|dear team|regards,|sincerely,|best regards)/im.test(text) ||
    /<a\s+[^>]*href/i.test(text) ||
    text.length > 400
  ) {
    return 'email';
  }
  return 'sms';
}

/**
 * Extract URLs statically from string without ever fetching or visiting
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+|[a-zA-Z0-9-]+\.(?:top|xyz|online|site|icu|click|work|vip|cfd)[^\s<>"'{}|\\^`[\]]*/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

/**
 * Static URL analyzer (NEVER fetches or opens the URL)
 */
export interface StaticUrlCheck {
  url: string;
  hostname: string;
  isShortener: boolean;
  isIpHost: boolean;
  isPunycode: boolean;
  hasAtSign: boolean;
  excessiveSubdomains: boolean;
  suspiciousTld: boolean;
  isNoHttps: boolean;
  isLookalike: boolean;
  lookalikeBrand?: string;
}

export function analyzeUrlStatically(urlStr: string): StaticUrlCheck {
  let hostname = '';
  let isNoHttps = urlStr.startsWith('http://');

  try {
    const formatted = urlStr.startsWith('http://') || urlStr.startsWith('https://')
      ? urlStr
      : `http://${urlStr}`;
    const parsed = new URL(formatted);
    hostname = parsed.hostname.toLowerCase();
    isNoHttps = parsed.protocol === 'http:';
  } catch {
    hostname = urlStr.split('/')[0].toLowerCase();
  }

  const isShortener = SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`));
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
  const hasAtSign = urlStr.includes('@');
  const domainSegments = hostname.split('.');
  const excessiveSubdomains = domainSegments.length > 3;
  const suspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));

  // Check lookalike / typosquatting
  let isLookalike = false;
  let lookalikeBrand: string | undefined;

  const brands = ['sbi', 'hdfc', 'icici', 'axis', 'pnb', 'bob', 'airtel', 'jio', 'paytm', 'phonepe', 'amazon', 'paypal'];
  for (const b of brands) {
    const brandRegex = new RegExp(`(^|\\.|-)${b}(\\.|-|$|\\d)`, 'i');
    const matchedBrand = brandRegex.test(hostname) || hostname.includes(b);
    if (matchedBrand) {
      // Check if it's on the official domains list
      const officialList = OFFICIAL_DOMAINS[b] || [];
      const isOfficial = officialList.some((off) => hostname === off || hostname.endsWith(`.${off}`));
      if (!isOfficial) {
        isLookalike = true;
        lookalikeBrand = b.toUpperCase();
        break;
      }
    }
  }

  // Also check character substitutions (e.g. paypa1, sbii, hdfcc)
  if (!isLookalike) {
    if (/(paypa[l1]|sb[i1]{2,}|hdfc[ck]|ic[i1]c[i1]|am[a4]z[o0]n)/i.test(hostname)) {
      isLookalike = true;
      lookalikeBrand = 'Brand Substitution';
    }
  }

  return {
    url: urlStr,
    hostname,
    isShortener,
    isIpHost,
    isPunycode,
    hasAtSign,
    excessiveSubdomains,
    suspiciousTld,
    isNoHttps,
    isLookalike,
    lookalikeBrand,
  };
}

/**
 * Deterministic Rule Engine
 */
export function runRuleEngine(
  rawText: string,
  channelParam?: Channel | 'auto',
  langParam?: DetectedLanguage | 'auto',
  sender?: string,
  claimedIdentity?: string
): RuleEngineResult {
  const norm = normalizeText(rawText);
  const detected_language = langParam && langParam !== 'auto' ? langParam : detectLanguage(rawText);
  const channel = detectChannel(rawText, channelParam);

  const signals: Signal[] = [];
  const safe_signals: string[] = [];

  const addSignal = (
    id: string,
    label: string,
    severity: Severity,
    weight: number,
    evidence: string,
    start: number,
    end: number,
    explanation: string
  ) => {
    // Verification: ensure evidence really exists in rawText
    if (!evidence || start < 0 || end > rawText.length || rawText.substring(start, end) !== evidence) {
      // Try to find the exact substring in rawText
      const idx = rawText.indexOf(evidence);
      if (idx !== -1) {
        start = idx;
        end = idx + evidence.length;
      } else {
        // Evidence not found in rawText; skip this signal to obey strict safety rule
        return;
      }
    }

    // Avoid duplicate signal ids
    if (!signals.some((s) => s.id === id)) {
      signals.push({
        id,
        label,
        severity,
        weight,
        evidence,
        start,
        end,
        explanation,
      });
    }
  };

  // Extract static URLs
  const urls = extractUrls(rawText);
  const urlChecks = urls.map(analyzeUrlStatically);

  // 1. URL Analysis Signals
  for (const check of urlChecks) {
    // Lookalike Domain
    if (check.isLookalike) {
      const match = findMatchInText(rawText, new RegExp(check.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      if (match) {
        addSignal(
          'LOOKALIKE_DOMAIN',
          'Lookalike Brand Domain / Typosquatting',
          'HIGH',
          40,
          match.evidence,
          match.start,
          match.end,
          `The URL hostname "${check.hostname}" contains a brand reference (${check.lookalikeBrand || 'Institution'}) but is not hosted on an official domain.`
        );
      }
    }

    // URL Shortener
    if (check.isShortener) {
      const match = findMatchInText(rawText, new RegExp(check.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      if (match) {
        addSignal(
          'URL_SHORTENER',
          'Masked URL Shortener',
          'MEDIUM',
          25,
          match.evidence,
          match.start,
          match.end,
          `The link uses a URL shortener (${check.hostname}) that conceals the true destination server from the recipient.`
        );
      }
    }

    // URL Obfuscation: IP address, punycode, suspicious TLD, stacked subdomains
    if (check.isIpHost || check.isPunycode || check.suspiciousTld || check.excessiveSubdomains || check.hasAtSign) {
      const reasons: string[] = [];
      if (check.isIpHost) reasons.push('raw numeric IP address');
      if (check.isPunycode) reasons.push('punycode / non-standard charset');
      if (check.suspiciousTld) reasons.push('disposable high-abuse TLD');
      if (check.excessiveSubdomains) reasons.push('nested subdomain stacking');
      if (check.hasAtSign) reasons.push('embedded userinfo @ symbol');

      const match = findMatchInText(rawText, new RegExp(check.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      if (match) {
        addSignal(
          'URL_OBFUSCATION',
          'Deceptive / Obfuscated URL Structure',
          'HIGH',
          35,
          match.evidence,
          match.start,
          match.end,
          `URL exhibits deceptive structural markers: ${reasons.join(', ')}.`
        );
      }
    }

    // URL No HTTPS
    if (check.isNoHttps && !check.isShortener) {
      const match = findMatchInText(rawText, new RegExp(check.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      if (match) {
        addSignal(
          'URL_NO_HTTPS',
          'Unencrypted HTTP Protocol',
          'LOW',
          15,
          match.evidence,
          match.start,
          match.end,
          `The link uses unencrypted "http://" instead of secure "https://", which is unacceptable for modern authentication or transactions.`
        );
      }
    }
  }

  // 2. Sender Domain / Identity Mismatch
  if (sender || claimedIdentity) {
    const senderStr = (sender || '').toLowerCase();
    const claimStr = (claimedIdentity || '').toLowerCase();

    // Check if free email provider is used for corporate/institutional identity
    const freeEmailRegex = /@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|rediffmail\.com|proton\.me)\b/i;
    const hasFreeEmail = freeEmailRegex.test(senderStr);
    const institutionalKeyword = /(sbi|hdfc|icici|axis|bank|rbi|police|cbi|income\s*tax|india\s*post|airtel|bescom|hr|finance|payroll|ceo|executive|management|company|director|admin)/i;

    if (hasFreeEmail && (institutionalKeyword.test(claimStr) || institutionalKeyword.test(norm) || (claimedIdentity && claimedIdentity.length > 2))) {
      // Find evidence in sender string or message
      const senderMatch = sender ? sender.match(freeEmailRegex) : null;
      const evidence: string = (senderMatch && sender) ? sender : (sender || claimedIdentity || 'unverified sender');
      const idx = rawText.indexOf(evidence);
      addSignal(
        'SENDER_DOMAIN_MISMATCH',
        'Sender Domain / Identity Mismatch',
        'HIGH',
        35,
        idx !== -1 ? evidence : (rawText.split('\n')[0] || rawText.substring(0, 30)),
        idx !== -1 ? idx : 0,
        idx !== -1 ? idx + evidence.length : Math.min(rawText.length, 30),
        `Official institutional communication claimed (${claimedIdentity || 'Institution'}), but originated from a personal public webmail domain.`
      );
    }
  }

  // 3. Urgency Pressure (English, Hindi)
  const urgencyRegex = new RegExp(
    [
      // English
      '\\b(immediately|within\\s+24\\s+hours|within\\s+12\\s+hours|account\\s+will\\s+be\\s+blocked|last\\s+warning|deactivated|suspended|action\\s+required\\s+urgently|tonight\\s+at)\\b',
      // Hindi (Devanagari & Romanized)
      '(तुरंत|अभी|24\\s*घंटे|ब्लॉक|बंद\\s*हो\\s*जाएगा|अंतिम\\s*चेतावनी|काट\\s*दी\\s*जाएगी|कटा\\s*जाएगा|turant|abhi|band\\s*ho\\s*jayega|blackout)',
    ].join('|'),
    'i'
  );

  // Exclude urgency if it is part of a standard consumer protection disclaimer ("if not done by you call ... immediately")
  const isBenignProtectionCall = /(?:if\s+not\s+done\s+by\s+you\s+(?:call|sms).*immediately|यदि\s+यह\s+लेनदेन\s+आपने\s+नहीं\s+किया)/i.test(rawText);

  const urgencyMatch = findMatchInText(rawText, urgencyRegex);
  if (urgencyMatch && !isBenignProtectionCall) {
    addSignal(
      'URGENCY_PRESSURE',
      'Artificial Urgency & Coercive Pressure',
      'MEDIUM',
      25,
      urgencyMatch.evidence,
      urgencyMatch.start,
      urgencyMatch.end,
      'Imposes artificial time limits or disruption threats to provoke emotional haste and bypass critical verification.'
    );
  }

  // 4. Credential Request (English, Hindi)
  // Check for negative context: "do not share OTP", "never share PIN", "साझा न करें"
  const isNegativeSecurityAdvice = /(?:do\s+not|never|don't)\s+share\s+(?:your\s+)?(?:otp|pin|password|cvv)|साझा\s*न\s*करें|शेयर\s*न\s*करें/i.test(rawText);

  const credentialRegex = new RegExp(
    [
      // English
      '\\b(enter\\s+(?:your\\s+)?(?:otp|pin|password|cvv)|(?:send|provide|input)\\s+otp|(?:^|[^a-z])share\\s+otp|update\\s+kyc|link\\s+aadhaar|pan\\s+card|net-banking\\s+login|login\\s+password|verify\\s+your\\s+identity\\s+at)\\b',
      // Hindi (Devanagari & Romanized)
      '(पैन\\s*कार्ड\\s*(?:और|व|दर्ज)|पासवर्ड\\s*दर्ज|केवाईसी\\s*अपडेट|otp\\s*bhejein|pin\\s*dalein|kyc\\s*update|(?:ओटीपी|पिन|पासवर्ड)\\s*(?:बताएं|भेजें|दर्ज))',
    ].join('|'),
    'i'
  );

  const credMatch = findMatchInText(rawText, credentialRegex);
  // Only trigger if not purely a "do not share otp" consumer disclaimer
  if (credMatch) {
    const credEvidence = credMatch.evidence;
    const isInsideNegativeAdvice = isNegativeSecurityAdvice && /share\s+otp|ओटीपी/i.test(credEvidence) && !/enter|update\s+kyc|pan\s+card|दर्ज/i.test(credEvidence);

    if (!isInsideNegativeAdvice) {
      addSignal(
        'CREDENTIAL_REQUEST',
        'Sensitive Credential / Authentication Request',
        'HIGH',
        40,
        credMatch.evidence,
        credMatch.start,
        credMatch.end,
        'Solicits private credentials, one-time passwords (OTP), PINs, or identity numbers through an unauthenticated channel.'
      );
    }
  }

  // 5. Financial Action Request (English, Hindi)
  const financialRegex = new RegExp(
    [
      // English
      '\\b(upi\\s*collect|enter\\s+upi\\s+pin\\s+to\\s+receive|receive\\s+(?:rs|cash|payment|money)|receive\\s+[0-9,]+\\s+in\\s+your\\s+account|credit\\s+(?:of\\s+)?rs|processing\\s+fee|kyc\\s+fee|pay\\s+rs|redelivery\\s+charge|cashback\\s+reward|scratch\\s+card|claim\\s+lottery|won\\s+rs|won\\s+cash|gift\\s*cards?|redemption\\s*codes?)\\b',
      // Hindi (Devanagari & Romanized)
      '(यूआईडी|पैसे\\s*पाने\\s*के\\s*लिए\\s*पिन|इनाम|लॉटरी|कैशबैक|रिफंड\\s*शुल्क|paisa\\s*paane\\s*ke\\s*liye|inam|lottery)',
    ].join('|'),
    'i'
  );

  const finMatch = findMatchInText(rawText, financialRegex);
  if (finMatch) {
    addSignal(
      'FINANCIAL_ACTION_REQUEST',
      'Unsolicited Financial Action / UPI Deception',
      'HIGH',
      40,
      finMatch.evidence,
      finMatch.start,
      finMatch.end,
      'Instructs the user to authorize a payment, enter a UPI PIN to "receive" funds, or pay advance release fees.'
    );
  }

  // 6. Impersonation of Authority
  const authorityRegex = new RegExp(
    '(?:\\b(?:state\\s+bank\\s+of\\s+india|sbi\\s+officer|hdfc\\s+bank|icici|income\\s+tax\\s+department|customs\\s+officer|cyber\\s+crime\\s+cell|mumbai\\s+police|electricity\\s+(?:office|bill|dept|power|supply)|mr\\.\\s+[a-z]+|bescom|india\\s+post|court\\s+order|digital\\s+arrest)\\b)',
    'i'
  );
  const authMatch = findMatchInText(rawText, authorityRegex);
  if (authMatch) {
    // If not verified official domain or standard DLT sender header
    const hasOfficialDomain = urlChecks.some((u) => {
      const brandKey = Object.keys(OFFICIAL_DOMAINS).find((k) =>
        authMatch.evidence.toLowerCase().includes(k)
      );
      if (!brandKey) return false;
      return (OFFICIAL_DOMAINS[brandKey] || []).some((off) => u.hostname === off || u.hostname.endsWith(`.${off}`));
    });

    if (!hasOfficialDomain) {
      addSignal(
        'IMPERSONATION_AUTHORITY',
        'Fabricated Institutional Authority',
        'MEDIUM',
        25,
        authMatch.evidence,
        authMatch.start,
        authMatch.end,
        `Invokes the name of a recognized authority ("${authMatch.evidence}") without matching institutional cryptographic provenance or official domain.`
      );
    }
  }

  // 7. Missing Provenance / Generic Salutation
  const genericGreetingRegex = /(?:\b(?:dear\s+customer|dear\s+user|dear\s+sir\/madam|valued\s+client)\b|(?:प्रिय\s+ग्राहक))/i;
  const genMatch = findMatchInText(rawText, genericGreetingRegex);
  if (genMatch) {
    addSignal(
      'MISSING_PROVENANCE',
      'Missing Provenance / Impersonal Greeting',
      'LOW',
      15,
      genMatch.evidence,
      genMatch.start,
      genMatch.end,
      'Employs an impersonal generic greeting rather than addressing the account holder by registered name.'
    );
  }

  // 8. Sensitive Channel Shift (Move to WhatsApp / Telegram or personal number)
  const channelShiftRegex = new RegExp(
    '(?:\\b(?:join\\s+(?:our\\s+)?telegram|contact\\s+(?:on\\s+)?whatsapp|telegram\\s+manager|call\\s+(?:mr\\.|officer)\\s+[a-z]+|contact\\s+our\\s+electricity\\s+officer|anydesk|teamviewer|quicksupport)\\b)',
    'i'
  );
  const shiftMatch = findMatchInText(rawText, channelShiftRegex);
  if (shiftMatch) {
    addSignal(
      'SENSITIVE_CHANNEL_SHIFT',
      'Redirection to Unmonitored Channel / Remote Access',
      'HIGH',
      30,
      shiftMatch.evidence,
      shiftMatch.start,
      shiftMatch.end,
      'Instructs recipient to leave official communication channels in favor of unmonitored apps (Telegram/WhatsApp) or install remote-access software.'
    );
  }

  // 9. QR Code payment trap
  const qrRegex = /\b(scan\s+(?:this\s+)?qr\s+code|qr\s+code\s+to\s+receive|scan\s+to\s+get\s+paid)\b/i;
  const qrMatch = findMatchInText(rawText, qrRegex);
  if (qrMatch) {
    addSignal(
      'QR_CONTENT',
      'Deceptive QR Code Payment Request',
      'HIGH',
      30,
      qrMatch.evidence,
      qrMatch.start,
      qrMatch.end,
      'Claims that scanning a QR code will credit your account. In UPI architecture, scanning a QR code can only DEBIT funds.'
    );
  }

  // 10. Grammar Anomaly (LOW weight only - never triggers high tier on its own)
  const grammarRegex = /\b(kindly\\s+do\\s+the\\s+needful\\s+immediately|your\\s+account\\s+is\\s+expire|update\\s+fastly|blocked\\s+soon|electricity\\s+will\\s+cut)\b/i;
  const gramMatch = findMatchInText(rawText, grammarRegex);
  if (gramMatch && signals.length < 2) {
    addSignal(
      'GRAMMAR_ANOMALY',
      'Peculiar Linguistic / Syntactic Construction',
      'LOW',
      10,
      gramMatch.evidence,
      gramMatch.start,
      gramMatch.end,
      'Contains awkward phrasing characteristic of automated template translation.'
    );
  }

  // Safe signals evaluation
  let safeDeduction = 0;
  // Check if all URLs in message are verified official domains
  if (urls.length > 0 && urlChecks.every((c) => {
    return Object.values(OFFICIAL_DOMAINS).flat().some((off) => c.hostname === off || c.hostname.endsWith(`.${off}`));
  })) {
    safe_signals.push('All links resolve to verified, officially registered institutional domains.');
    safeDeduction += 30;
  }

  // Check if message is a standard transactional receipt with explicit safety warning ("do not share otp")
  const hasSafetyAdvice = /\b(do\s+not\s+share\s+(?:your\s+)?otp|never\s+share\s+pin|if\s+not\s+done\s+by\s+you\s+call)\b/i.test(rawText);
  if (hasSafetyAdvice) {
    safe_signals.push('Includes explicit consumer security instructions cautioning against sharing OTPs or PINs.');
    safeDeduction += 20;
  }

  // Check if no external links exist and no credential/money extraction occurs
  const hasCredentialSignal = signals.some((s) => s.id === 'CREDENTIAL_REQUEST' || s.id === 'FINANCIAL_ACTION_REQUEST');
  if (urls.length === 0 && !hasCredentialSignal) {
    safe_signals.push('Message contains no embedded web links or requests for financial/credential disclosure.');
    safeDeduction += 15;
  }

  // Check standard DLT header in sender
  if (sender && /^[A-Za-z]{2}-[A-Za-z0-9]{6}$/.test(sender)) {
    safe_signals.push(`Sender header "${sender}" follows the Indian TRAI DLT 6-character registered format.`);
    safeDeduction += 10;
  }

  // Delegate to Unified Scoring Policy (Single Source of Truth)
  const scoring = computeScoreAndTier(signals, safe_signals);
  const computedScore = scoring.score;
  const risk_tier = scoring.tier;
  const confidence = scoring.confidence;

  // Human-readable summary based on language
  let summary = '';
  if (detected_language === 'hi') {
    summary = risk_tier === 'HIGH_RISK'
      ? 'इस संदेश में गंभीर सुरक्षा खतरे पाए गए हैं। इसमें संदिग्ध लिंक, कृत्रिम तात्कालिकता या क्रेडेंशियल चुराने के संकेत मिले हैं।'
      : risk_tier === 'SUSPICIOUS'
      ? 'संदेश में कुछ संदिग्ध विशेषताएं पाई गई हैं। किसी भी लिंक पर क्लिक करने से पहले आधिकारिक माध्यम से पुष्टि करें।'
      : 'इस संदेश में कोई सक्रिय फ़िशिंग या धोखाधड़ी के संकेत नहीं मिले। यह एक सामान्य सूचना प्रतीत होती है।';
  } else {
    summary = risk_tier === 'HIGH_RISK'
      ? 'Critical threat indicators detected. The message exhibits known phishing mechanisms, including coercive urgency, credential solicitation, or unverified link destinations.'
      : risk_tier === 'SUSPICIOUS'
      ? 'Caution advised. Moderate risk signals were observed that deviate from standard verified corporate communications.'
      : 'Low risk. The message matches standard informational patterns and exhibits no deceptive credential or payment vectors.';
  }

  // Verification Steps
  const verification_steps: string[] = [];
  if (risk_tier === 'HIGH_RISK' || risk_tier === 'SUSPICIOUS') {
    verification_steps.push('Do not click any embedded links, download APK attachments, or reply to the sender.');
    verification_steps.push('Never share OTPs, UPI PINs, CVVs, or internet banking passwords over phone, chat, or external web forms.');
    verification_steps.push('Contact the institution exclusively through the phone number printed on your physical card or the official app.');
    verification_steps.push('If this concerns your workplace, verify directly with your internal IT or HR colleague through your standard company channel.');
    verification_steps.push('In India, report phishing incidents to cybercrime.gov.in or national helpline 1930, and forward fraudulent SMS to 1909.');
  } else {
    verification_steps.push('Even for benign notifications, ensure you never disclose OTPs or passwords to anyone who calls claiming to be support.');
    verification_steps.push('If ever unsure about a transaction or appointment, check via the verified mobile application directly.');
  }

  return {
    risk_tier,
    risk_score: computedScore,
    confidence,
    detected_language,
    channel,
    signals,
    safe_signals,
    summary,
    verification_steps,
  };
}
