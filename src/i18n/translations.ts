export type SupportedLanguage = 'en' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  nav: {
    home: string;
    dashboard: string;
    messageScanner: string;
    urlChecker: string;
    identityChecker: string;
    scanHistory: string;
    awareness: string;
    about: string;
    quickScan: string;
  };
  hero: {
    headline: string;
    description: string;
    scanCta: string;
    exploreCta: string;
    protectingAgainst: string;
  };
  risk: {
    high: string;
    medium: string;
    low: string;
    unverified: string;
  };
  scanner: {
    title: string;
    description: string;
    inputPlaceholder: string;
    senderNamePlaceholder: string;
    senderContactPlaceholder: string;
    claimedOrgPlaceholder: string;
    languageLabel: string;
    messageTypeLabel: string;
    analyzeBtn: string;
    resetBtn: string;
    loadSample: string;
  };
  urlInspector: {
    title: string;
    description: string;
    inputPlaceholder: string;
    inspectBtn: string;
  };
  identityChecker: {
    title: string;
    description: string;
    claimedOrg: string;
    senderEmail: string;
    senderPhone: string;
    suppliedDomain: string;
    checkIdentityBtn: string;
  };
  disclaimer: {
    demoNotice: string;
    neverClicks: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'TRUSTLENS AI',
    tagline: "Don't Trust the Message. Verify the Identity.",
    subTagline: 'Your AI-powered shield against phishing, impersonation and digital deception.',
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      messageScanner: 'Message Scanner',
      urlChecker: 'Link Inspector',
      identityChecker: 'Identity Trust',
      scanHistory: 'Scan History',
      awareness: 'Awareness Centre',
      about: 'How It Works',
      quickScan: 'Analyse New Message',
    },
    hero: {
      headline: 'One Message Can Cost You Everything. Verify Before You Trust.',
      description: 'Detect phishing, identify impersonation and uncover social engineering attacks with an intelligent AI-powered security assistant.',
      scanCta: 'Scan a Suspicious Message',
      exploreCta: 'Explore Security Features',
      protectingAgainst: 'Protecting against UPI frauds, fake KYC, APK drop-links & credential theft',
    },
    risk: {
      high: 'HIGH RISK',
      medium: 'MEDIUM RISK',
      low: 'LOW RISK',
      unverified: 'UNVERIFIED',
    },
    scanner: {
      title: 'AI Message Security Scanner',
      description: 'Paste any suspicious message and let TrustLens investigate its security signals.',
      inputPlaceholder: 'Paste suspicious SMS, WhatsApp message, or email body here...',
      senderNamePlaceholder: 'Sender display name (optional, e.g. VK-HDFCBK, Power Corp)',
      senderContactPlaceholder: 'Sender phone or email (optional, e.g. +91 98765 43210)',
      claimedOrgPlaceholder: 'Claimed entity (optional, e.g. State Bank of India, India Post)',
      languageLabel: 'Message Language',
      messageTypeLabel: 'Message Platform',
      analyzeBtn: 'Analyse Message',
      resetBtn: 'Clear Content',
      loadSample: 'Try Real-World Test Messages',
    },
    urlInspector: {
      title: 'Suspicious Link Inspector',
      description: 'Investigate suspicious links before you visit them. Untrusted text analysis.',
      inputPlaceholder: 'Enter URL (e.g. http://sbi-kyc-update.top/login)...',
      inspectBtn: 'Inspect Link Safety',
    },
    identityChecker: {
      title: 'Identity Trust Checker',
      description: "Check whether a sender's claimed identity matches the information provided.",
      claimedOrg: 'Claimed Organisation (e.g. SBI, Airtel, HDFC)',
      senderEmail: 'Sender Email Address (e.g. kyc-dept@gmail.com)',
      senderPhone: 'Sender Phone Number (e.g. +91 93240 19284)',
      suppliedDomain: 'Supplied Website Domain (e.g. sbi-secure-portal.xyz)',
      checkIdentityBtn: 'Assess Sender Authenticity',
    },
    disclaimer: {
      demoNotice: 'Demonstration Mode: Security metrics and scores are computed through client forensic heuristics for testing.',
      neverClicks: 'Defensive Architecture: TrustLens never connects to, visits, or executes untrusted links.',
    },
  },
  hi: {
    appName: 'ट्रस्टलेंस AI (TRUSTLENS)',
    tagline: 'संदेश पर भरोसा न करें। पहचान सत्यापित करें।',
    subTagline: 'फ़िशिंग, प्रतिरूपण और डिजिटल धोखाधड़ी के ख़िलाफ़ आपका AI सुरक्षा कवच।',
    nav: {
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      messageScanner: 'संदेश स्कैनर',
      urlChecker: 'लिंक जांच',
      identityChecker: 'पहचान सत्यापन',
      scanHistory: 'स्कैन इतिहास',
      awareness: 'जागरूकता केंद्र',
      about: 'यह कैसे काम करता है',
      quickScan: 'नया संदेश जांचें',
    },
    hero: {
      headline: 'एक संदेश आपका सब कुछ छीन सकता है। भरोसा करने से पहले जांचें।',
      description: 'बुद्धिमान AI सुरक्षा सहायक के साथ फ़िशिंग का पता लगाएं, पहचान की पुष्टि करें और सोशल इंजीनियरिंग हमलों से बचें।',
      scanCta: 'संदिग्ध संदेश स्कैन करें',
      exploreCta: 'सुरक्षा सुविधाएं देखें',
      protectingAgainst: 'UPI धोखाधड़ी, नकली KYC, संदिग्ध APK और बैंक धोखाधड़ी से बचाव',
    },
    risk: {
      high: 'उच्च जोखिम (HIGH)',
      medium: 'मध्यम जोखिम (MEDIUM)',
      low: 'कम जोखिम (LOW)',
      unverified: 'असत्यापित (UNVERIFIED)',
    },
    scanner: {
      title: 'AI संदेश सुरक्षा स्कैनर',
      description: 'किसी भी संदिग्ध संदेश को पेस्ट करें और ट्रस्टलेंस को उसके सुरक्षा संकेतों की जांच करने दें।',
      inputPlaceholder: 'संदिग्ध SMS, व्हाट्सएप संदेश या ईमेल यहाँ पेस्ट करें...',
      senderNamePlaceholder: 'प्रेषक का नाम (वैकल्पिक, जैसे: VK-SBIINB, बिजली बोर्ड)',
      senderContactPlaceholder: 'प्रेषक का नंबर या ईमेल (वैकल्पिक)',
      claimedOrgPlaceholder: 'दावा किया गया संगठन (जैसे: State Bank, India Post)',
      languageLabel: 'संदेश की भाषा',
      messageTypeLabel: 'संदेश का माध्यम',
      analyzeBtn: 'संदेश का विश्लेषण करें',
      resetBtn: 'साफ़ करें',
      loadSample: 'परीक्षण संदेश आज़माएं',
    },
    urlInspector: {
      title: 'संदिग्ध लिंक विश्लेषक',
      description: 'किसी भी लिंक पर जाने से पहले उसकी गहन जांच करें।',
      inputPlaceholder: 'यहाँ URL दर्ज करें (जैसे: http://sbi-kyc-update.top/login)...',
      inspectBtn: 'लिंक की सुरक्षा जांचें',
    },
    identityChecker: {
      title: 'पहचान सत्यता परीक्षक',
      description: 'जांचें कि क्या प्रेषक की पहचान प्रदान की गई जानकारी से मेल खाती है।',
      claimedOrg: 'दावा किया गया संगठन (उदा: SBI, Airtel, HDFC)',
      senderEmail: 'प्रेषक का ईमेल (उदा: kyc-dept@gmail.com)',
      senderPhone: 'प्रेषक का फ़ोन नंबर',
      suppliedDomain: 'प्रदान की गई वेबसाइट डोमेन',
      checkIdentityBtn: 'पहचान की सत्यता जांचें',
    },
    disclaimer: {
      demoNotice: 'प्रदर्शन मोड: सुरक्षा स्कोर और विश्लेषण परीक्षण के लिए उपलब्ध हैं।',
      neverClicks: 'सुरक्षा मानक: ट्रस्टलेंस कभी भी संदिग्ध लिंक पर क्लिक या निष्पादित नहीं करता।',
    },
  },
};
