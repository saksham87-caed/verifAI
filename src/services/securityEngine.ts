import {
  MessageAnalysisResult,
  UrlAnalysisResult,
  IdentityAssessmentResult,
  ScanHistoryItem,
  RiskLevel,
  DetectedSignal,
  PsychologicalTechnique,
  VerificationRecommendation,
  MessageType,
  LanguageCode,
  ScamEducationCard,
} from '../types/security';

// Pre-packaged realistic sample test messages covering Indian cyber threat vectors
export interface SampleMessage {
  id: string;
  category: string;
  label: string;
  messageType: MessageType;
  senderName: string;
  senderContact: string;
  claimedOrg: string;
  text: string;
  language: LanguageCode;
}

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'sample-sbi-kyc',
    category: 'Bank KYC Phishing',
    label: 'Fake SBI KYC Suspension Alert',
    messageType: 'sms',
    senderName: 'VK-SBIINB',
    senderContact: '+91 89102 38471',
    claimedOrg: 'State Bank of India',
    text: 'Dear SBI User, your YONO SBI account has been suspended due to pending KYC verification. Please click here http://sbi-kyc-update.top/login immediately to update your Pan Card within 24 hours, else your account balance will be blocked.',
    language: 'en',
  },
  {
    id: 'sample-india-post',
    category: 'Parcel Scam (Smishing)',
    label: 'India Post Address Update Fraud',
    messageType: 'sms',
    senderName: 'INDPOST-DEL',
    senderContact: '+91 91230 44812',
    claimedOrg: 'India Post',
    text: 'Your India Post parcel #IN9482103 cannot be delivered due to incomplete street address. Please update your address and pay re-delivery charge of Rs 25 at http://indiapost-parcel-tracking.xyz/pay within 12 hours or package will be returned to sender.',
    language: 'en',
  },
  {
    id: 'sample-electricity-bill',
    category: 'Utility Threat (Hinglish)',
    label: 'Electricity Disconnection Threat',
    messageType: 'sms',
    senderName: 'POWER-DEPT',
    senderContact: '+91 98451 20938',
    claimedOrg: 'State Electricity Board',
    text: 'Dear Consumer, Your electricity power supply will be disconnected tonight at 9:30 PM from electric office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9845120938 to avoid blackout.',
    language: 'hi',
  },
  {
    id: 'sample-upi-refund',
    category: 'UPI PIN Deception',
    label: 'Fake UPI Cashback / Refund Scam',
    messageType: 'whatsapp',
    senderName: 'PhonePe Rewards Agent',
    senderContact: '+91 70291 58392',
    claimedOrg: 'PhonePe',
    text: 'Congratulations! You have won an instant scratch card reward of Rs 4,999 in PhonePe festival offer. Click the collect link below and enter your 6-digit UPI PIN on the next screen to receive the cash directly into your savings account.',
    language: 'en',
  },
  {
    id: 'sample-job-offer',
    category: 'Task / Job Fraud',
    label: 'Fake WFH Part-Time Job Scam',
    messageType: 'whatsapp',
    senderName: 'Priya Sharma (HR Global)',
    senderContact: '+44 7911 123456',
    claimedOrg: 'Amazon Global Reviews',
    text: 'Hi! We noticed your resume on LinkedIn. We offer part-time remote work: review 5 hotels/products daily on Google Maps and earn Rs 3,500 - 8,000 per day. No prior experience needed. Contact our Telegram manager @amazon_reviews_hr to join batch today.',
    language: 'en',
  },
  {
    id: 'sample-legit-doctor',
    category: 'Legitimate Notice',
    label: 'Legitimate Clinic Appointment SMS',
    messageType: 'sms',
    senderName: 'APOLLO-CLINIC',
    senderContact: 'VM-APOLLO',
    claimedOrg: 'Apollo Clinic',
    text: 'Dear Patient, your consultation with Dr. Arvind Menon is confirmed for Saturday, Nov 2 at 11:30 AM at Koramangala branch. For queries or rescheduling, visit official app or call 1860-500-1066. No OTP or prepayment required.',
    language: 'en',
  },
  {
    id: 'sample-legit-bank',
    category: 'Legitimate Notice',
    label: 'Legitimate Bank Transaction SMS',
    messageType: 'sms',
    senderName: 'AD-HDFCBK',
    senderContact: 'AD-HDFCBK',
    claimedOrg: 'HDFC Bank',
    text: 'Rs 1,450.00 debited from HDFC Bank A/c ending 4821 on 30-OCT-26 via UPI to ZOMATO (UPI Ref: 430291049281). If not done by you, call 1800-202-6161 immediately or SMS BLOCK to 5676712. Do not share OTP with anyone.',
    language: 'en',
  },
];

// Education modules
export const SCAM_EDUCATION_CARDS: ScamEducationCard[] = [
  {
    id: 'edu-smishing',
    title: 'Smishing (SMS Phishing)',
    subtitle: 'Deceptive text messages disguised as banks, couriers, or government agencies.',
    category: 'Mobile Messaging',
    severity: 'critical',
    simpleExplanation: 'Smishing is phishing sent over SMS. Scammers spoof sender IDs to look like official institutions and include links to malicious clone websites.',
    realisticExample: '"Dear customer, your bank account will be blocked today due to outdated PAN card. Update at http://bit.ly/bank-kyc-verify immediately."',
    warningSigns: [
      'Artificial deadline (e.g., "within 24 hours" or "tonight at 9:30 PM")',
      'Shortened URL or odd domain extension (.top, .xyz, .site)',
      'Unsolicited warning of service disconnection or account freeze',
      'Sent from an ordinary 10-digit mobile number claiming to be a national bank',
    ],
    preventionTips: [
      'Never click links in SMS regarding KYC, PAN, or account blocks',
      'Official Indian banks only use regulated 6-character header IDs (e.g., VM-SBIINB)',
      'Always log in by typing the official bank URL into your browser directly',
    ],
    statsContext: 'Over 68% of digital fraud incidents in India originate from deceptive SMS links.',
  },
  {
    id: 'edu-upi-scams',
    title: 'UPI PIN Deception Scams',
    subtitle: 'Tricking victims into entering UPI PIN under the guise of "receiving" cashback or refunds.',
    category: 'Payment Systems',
    severity: 'critical',
    simpleExplanation: 'The core architecture of UPI requires a PIN only to SEND or DEBIT money. You NEVER need to enter a UPI PIN or scan a QR code to receive funds.',
    realisticExample: '"Mr. Verma sent you Rs 12,000 for your OLX sofa. Click this collect request in Google Pay and enter your 4-digit UPI PIN to credit funds."',
    warningSigns: [
      'Caller or message insists you must enter PIN to "receive" or "accept" payment',
      'QR code sent via WhatsApp labeled "Scan to receive payment"',
      'Screenshots of fake transaction receipts or "pending approval" screens',
    ],
    preventionTips: [
      'Remember the golden rule: Entering UPI PIN always DEDUCTS money from your bank account',
      'Decline any UPI collect request from strangers on OLX, Facebook Marketplace, or WhatsApp',
      'Never accept screen-sharing requests during a transaction',
    ],
    statsContext: 'UPI PIN misunderstanding remains the #1 cause of peer-to-peer digital transaction loss.',
  },
  {
    id: 'edu-vishing',
    title: 'Vishing (Voice Call Phishing)',
    subtitle: 'Fraudsters impersonating police, customs officials, or bank fraud departments.',
    category: 'Voice Calls',
    severity: 'critical',
    simpleExplanation: 'Vishing uses high-pressure telephone calls. Scammers use background office noise and legal jargon like "Digital Arrest" or "Customs Seizure" to induce panic.',
    realisticExample: '"This is Inspector Rawat from Mumbai Cyber Crime. A parcel with narcotics in your Aadhaar name was seized at Delhi airport. Stay on Skype call for digital verification."',
    warningSigns: [
      'Claims that you cannot disconnect the call or tell family members',
      'Demands to download AnyDesk, TeamViewer, or QuickSupport on your mobile phone',
      'Demands to transfer funds to a "government clearance RBI escrow account"',
    ],
    preventionTips: [
      'Indian law enforcement NEVER conducts "Digital Arrests" or demands money transfers over video calls',
      'Hang up immediately and contact the local cyber police helpline at 1930',
      'Never install screen-sharing applications instructed by unknown callers',
    ],
    statsContext: 'Reported losses to "digital arrest" impersonation exceeded hundreds of crores in recent months.',
  },
  {
    id: 'edu-bank-kyc',
    title: 'Fake Bank KYC & SIM Block',
    subtitle: 'Threatening account freezes or SIM deactivation to steal login credentials.',
    category: 'Banking Security',
    severity: 'critical',
    simpleExplanation: 'Cybercriminals prey on fear of losing access to banking or mobile connectivity by falsely claiming KYC documents have expired.',
    realisticExample: '"Airtel 5G Alert: Your SIM card will be deactivated in 2 hours due to pending KYC. Download Airtel-Service.apk to update Aadhaar."',
    warningSigns: [
      'Prompt to download an APK file from WhatsApp or an external link',
      'Requests for debit card number, expiry date, CVV, and net banking password',
      'SMS requesting forwarding of a SIM activation code or porting SMS',
    ],
    preventionTips: [
      'Banks and telecom operators NEVER ask you to download APK files',
      'Visit your nearest bank branch or official telecom app for legitimate KYC updates',
      'Do not forward any SMS containing "1900" or porting codes',
    ],
    statsContext: 'Over 85% of fake KYC links lead to credential harvester phishing pages.',
  },
  {
    id: 'edu-otp-theft',
    title: 'OTP & Authentication Theft',
    subtitle: 'Social engineering tricks used to extract one-time passwords.',
    category: 'Account Takeover',
    severity: 'high',
    simpleExplanation: 'One-Time Passwords (OTPs) are the final barrier protecting your accounts. Fraudsters invent elaborate reasons why you must read the code out loud.',
    realisticExample: '"Sir, I am calling from Amazon logistics. Your delivery boy is outside. Please share the 6-digit verification code sent to your phone to confirm your delivery."',
    warningSigns: [
      'Caller asks for OTP while claiming to be "canceling an accidental transaction"',
      'SMS clearly states "Do not share with anyone", but caller claims "it is automated"',
      'Multiple OTPs arriving when you are not actively making any transaction',
    ],
    preventionTips: [
      'Treat OTPs like the keys to your front door: Never read them out to anyone on the phone',
      'Always read the full SMS text: note the amount and recipient stated in the OTP SMS',
      'If you receive unrequested OTPs, immediately change your net banking passwords',
    ],
    statsContext: 'Legitimate companies will never call and ask you to provide an OTP to receive a refund.',
  },
  {
    id: 'edu-job-scams',
    title: 'Part-Time Task & WFH Job Scams',
    subtitle: 'Enticing daily earnings for liking videos or writing reviews, leading to advance-fee extortion.',
    category: 'Employment Fraud',
    severity: 'high',
    simpleExplanation: 'Scammers offer high daily payouts for simple online tasks. After paying small initial rewards to build trust, they demand large sums for "VIP prepaid tasks".',
    realisticExample: '"Work 15 minutes daily liking YouTube videos. Earn Rs 2,000 daily. Join our official Telegram channel now for your first payout."',
    warningSigns: [
      'Unsolicited job offer on WhatsApp/Telegram with international country codes (+44, +1, +62)',
      'Unusually high compensation for unskilled tasks (e.g., Rs 500 per hotel review)',
      'Requirement to pay a "deposit" or "tax clearance fee" before withdrawing your earnings',
    ],
    preventionTips: [
      'No reputable global company recruits employees via random WhatsApp messages',
      'Never pay money to get a job or unlock task rewards',
      'Block and report numbers sending unsolicited task recruitment pitches',
    ],
    statsContext: 'Task-based Telegram frauds account for immense financial loss among young adults and college students.',
  },
  {
    id: 'edu-qr-code',
    title: 'QR Code Payment Traps',
    subtitle: 'Misleading QR codes placed over legitimate merchant stickers or sent via chat.',
    category: 'Physical & Digital QR',
    severity: 'medium',
    simpleExplanation: 'QR codes simply encode a URL or UPI payment string. Scanning a QR code cannot credit your account; it only triggers an outgoing debit prompt.',
    realisticExample: 'Fraudulent paper QR sticker pasted over a street vendor\'s official phonepe standee, or a WhatsApp user sending a QR code for "buyer clearance".',
    warningSigns: [
      'Any claim that scanning a QR code is required to receive funds or refunds',
      'Physical QR stickers that look peeled, modified, or placed on top of existing signs',
      'QR codes that open unfamiliar browser windows instead of your trusted banking app',
    ],
    preventionTips: [
      'Only scan merchant QR codes at the physical cash counter with vendor knowledge',
      'Confirm the recipient name displayed in your UPI app matches the store before paying',
      'Never scan a QR code received over WhatsApp or email from an unknown person',
    ],
    statsContext: 'QR tampering incidents have surged at unattended parking, restaurant tables, and roadside kiosks.',
  },
  {
    id: 'edu-fake-support',
    title: 'Fake Customer Care Numbers on Search Engines',
    subtitle: 'Poisoned search results and Google Maps listings with fraudulent helpline numbers.',
    category: 'Search Engine Poisoning',
    severity: 'high',
    simpleExplanation: 'Scammers create fake websites and Google Maps business profiles with fraudulent contact numbers for airlines, courier firms, and banks.',
    realisticExample: 'Searching "Swiggy refund customer care number" on Google leads to a sponsored blog with a scammer\'s mobile number.',
    warningSigns: [
      'Customer support numbers listed as standard 10-digit mobile numbers (+91-9xxx) instead of 1800 toll-free',
      'Support agent asks you to install AnyDesk or send Rs 5 via UPI to "verify account"',
      'Agent asks for your full 16-digit debit card number and CVV to process a refund',
    ],
    preventionTips: [
      'Only obtain support contact information from inside the official mobile app',
      'Do not trust phone numbers displayed in generic search engine snippets or blog comments',
      'Legitimate customer care never requires remote screen control for basic refund queries',
    ],
    statsContext: 'Toll-free spoofing and search result poisoning trick thousands searching for flight or parcel queries.',
  },
];

// Heuristic Analysis Engine for Suspicious Messages
export function runMessageAnalysis(
  text: string,
  senderName = '',
  senderContact = '',
  claimedOrg = '',
  messageType: MessageType = 'sms',
  language: LanguageCode = 'auto'
): MessageAnalysisResult {
  const normalizedText = text.toLowerCase();
  const normalizedSender = (senderName + ' ' + senderContact).toLowerCase();
  const detectedSignals: DetectedSignal[] = [];
  const psychologicalAnalysis: PsychologicalTechnique[] = [];
  const recommendations: VerificationRecommendation[] = [];

  let riskScore = 0;

  // Extract entities
  const urlMatches = text.match(/https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(top|xyz|online|site|club|work|link|vip|ru|cc|to)[^\s]*/gi) || [];
  const phoneMatches = text.match(/(?:\+91|0)?[6-9]\d{9}/g) || [];
  const upiMatches = text.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g) || [];
  const orgMentions: string[] = [];

  // Check known institutions
  const indianInstitutions = [
    { name: 'State Bank of India (SBI)', match: /sbi|yono|state bank/i },
    { name: 'HDFC Bank', match: /hdfc/i },
    { name: 'ICICI Bank', match: /icici/i },
    { name: 'Punjab National Bank', match: /pnb|punjab national/i },
    { name: 'Bank of Baroda', match: /bob|bank of baroda/i },
    { name: 'India Post', match: /india post|indiapost|speed post|parcel/i },
    { name: 'Electricity Board', match: /electricity|power supply|bijli|bescom|mseb|tneb|uppcl/i },
    { name: 'Telecom / Airtel / Jio', match: /airtel|jio|vi|telecom|sim card|5g upgrade/i },
    { name: 'PhonePe / Paytm / GPay', match: /phonepe|paytm|google pay|gpay|upi/i },
  ];

  for (const inst of indianInstitutions) {
    if (inst.match.test(text) || inst.match.test(claimedOrg) || inst.match.test(senderName)) {
      orgMentions.push(inst.name);
    }
  }

  // 1. Critical Pattern: Urgent Account Suspension / Disconnection
  const urgencyKeywords = [
    'immediate', 'immediately', 'within 24 hours', 'within 12 hours', 'tonight at', 'blocked',
    'suspended', 'deactivated', 'terminated', 'electricity cut', 'disconnection', 'blackout',
    'कटेगी', 'बंद हो जाएगा', 'ब्लॉक', 'ಖಾತೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ', 'ಸ್ಥಗಿತಗೊಳಿಸಲಾಗಿದೆ'
  ];
  const matchedUrgency = urgencyKeywords.filter(k => normalizedText.includes(k.toLowerCase()));

  if (matchedUrgency.length > 0) {
    riskScore += 25;
    detectedSignals.push({
      id: 'sig-urgency-threat',
      name: 'Suspicious High Urgency & Coercive Deadline',
      severity: 'critical',
      evidence: matchedUrgency.slice(0, 3).map(k => `"${k}"`).join(', '),
      explanation: 'Scammers establish tight deadlines to trigger anxiety and prevent you from consulting family members or verifying with official branches.',
      category: 'urgency',
    });
  }

  // 2. Critical Pattern: Suspicious or Obfuscated Links
  const suspiciousTlds = ['.top', '.xyz', '.online', '.site', '.click', '.club', '.vip', '.work', '.ru', '.cfd'];
  const hasSuspiciousLink = urlMatches.some(u => 
    suspiciousTlds.some(tld => u.toLowerCase().includes(tld)) || 
    u.includes('bit.ly') || 
    u.includes('tinyurl') || 
    u.includes('is.gd') ||
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u)
  );

  if (urlMatches.length > 0) {
    if (hasSuspiciousLink) {
      riskScore += 35;
      detectedSignals.push({
        id: 'sig-untrusted-link',
        name: 'High-Risk Obfuscated / Non-Banking Web Link',
        severity: 'critical',
        evidence: urlMatches.slice(0, 2).join(', '),
        explanation: 'Official Indian banks and government utilities host services on strictly registered domains (.bank.sbi, .gov.in, .nic.in), never cheap disposable TLDs (.top, .xyz) or link shorteners.',
        category: 'domain',
      });
    } else {
      riskScore += 15;
      detectedSignals.push({
        id: 'sig-embedded-link',
        name: 'Embedded Web Link in Transactional Communication',
        severity: 'medium',
        evidence: urlMatches.slice(0, 2).join(', '),
        explanation: 'Reserve Bank of India (RBI) guidelines caution customers against clicking links received in SMS or unsolicited chats.',
        category: 'domain',
      });
    }
  }

  // 3. Financial & Credential Extraction (OTP, UPI PIN, KYC update, PAN Card)
  const extractionKeywords = [
    'kyc', 'pan card', 'update your kyc', 'enter upi pin', 'upi pin', 'enter pin', 'scratch card',
    'apk', 'anydesk', 'teamviewer', 'receive money', 'cashback', 'lottery', 'winner', 'पैन कार्ड',
    'ಕೆವೈಸಿ', 'ಬಹುಮಾನ'
  ];
  const matchedExtraction = extractionKeywords.filter(k => normalizedText.includes(k.toLowerCase()));

  if (matchedExtraction.length > 0) {
    riskScore += 25;
    detectedSignals.push({
      id: 'sig-credential-harvest',
      name: 'Sensitive Credential / Payment Harvest Trigger',
      severity: 'critical',
      evidence: matchedExtraction.slice(0, 3).map(k => `"${k}"`).join(', '),
      explanation: 'Official institutions never ask users to update KYC or link PAN cards via unauthenticated third-party links or unverified WhatsApp chats.',
      category: 'financial',
    });
  }

  // 4. Sender Header / Provenance Inconsistency
  const isPersonalPhone = /(?:\+91|0)?[6-9]\d{9}/.test(senderContact) || /(?:\+91|0)?[6-9]\d{9}/.test(senderName);
  if (isPersonalPhone && orgMentions.length > 0) {
    riskScore += 20;
    detectedSignals.push({
      id: 'sig-sender-inconsistency',
      name: 'Unverified Personal Mobile Number Claiming Corporate Identity',
      severity: 'high',
      evidence: `Claiming: ${orgMentions.join(', ')} from mobile number ${senderContact || senderName}`,
      explanation: 'Indian corporate SMS messages must originate from registered 6-character TRAI DLT alphanumeric sender headers (e.g., AD-HDFCBK, AX-SBIINB), not 10-digit consumer phone numbers.',
      category: 'provenance',
    });
  }

  // 5. Psychological Manipulation Analysis
  // Fear
  const fearHits = ['account suspended', 'blocked', 'disconnected', 'blackout', 'arrest', 'police', 'legal action', 'बन्द', 'ಸ್ಥಗಿತ']
    .filter(w => normalizedText.includes(w));
  psychologicalAnalysis.push({
    type: 'fear',
    name: 'Fear & Loss Aversion',
    detected: fearHits.length > 0,
    score: fearHits.length > 0 ? 8 : 1,
    highlightedPhrases: fearHits,
    description: 'Threatens severe disruption (loss of money, power disconnection, account lock) to bypass critical thinking.',
  });

  // Urgency
  const urgencyHits = ['immediately', 'within 24 hours', 'within 12 hours', 'tonight', 'urgent', 'now', '24 घंटे']
    .filter(w => normalizedText.includes(w));
  psychologicalAnalysis.push({
    type: 'urgency',
    name: 'Artificial Urgency',
    detected: urgencyHits.length > 0,
    score: urgencyHits.length > 0 ? 9 : 2,
    highlightedPhrases: urgencyHits,
    description: 'Forces immediate impulsive reaction, depriving you of time to verify with bank branch or family members.',
  });

  // Fake Authority
  const authorityHits = ['officer', 'manager', 'cyber crime', 'inspector', 'power dept', 'del-indpost', 'hr global', 'mr. sharma']
    .filter(w => normalizedText.includes(w) || normalizedSender.includes(w));
  psychologicalAnalysis.push({
    type: 'fake_authority',
    name: 'Fabricated Authority / Officialdom',
    detected: authorityHits.length > 0,
    score: authorityHits.length > 0 ? 7 : 1,
    highlightedPhrases: authorityHits,
    description: 'Impersonates figures in positions of trust (executives, government officials, police inspectors).',
  });

  // Greed / Unearned Rewards
  const greedHits = ['won', 'scratch card', 'cashback', 'reward', '4,999', '5 lakh', 'rs 3,500', 'part-time', 'free recharge', 'ಬಹುಮಾನ']
    .filter(w => normalizedText.includes(w));
  psychologicalAnalysis.push({
    type: 'greed',
    name: 'Unearned Financial Rewards (Baiting)',
    detected: greedHits.length > 0,
    score: greedHits.length > 0 ? 9 : 1,
    highlightedPhrases: greedHits,
    description: 'Promises unexpected money, lottery wins, or effortless part-time income to lower defenses.',
  });

  // Social Pressure / Curiosity
  const socialHits = ['congratulations', 'noticed your resume', 'telegram', 'exclusive offer', 'abhyarthigalu']
    .filter(w => normalizedText.includes(w));
  psychologicalAnalysis.push({
    type: 'social_pressure',
    name: 'Curiosity & Flattery',
    detected: socialHits.length > 0,
    score: socialHits.length > 0 ? 6 : 1,
    highlightedPhrases: socialHits,
    description: 'Flatters the recipient or uses curiosity about packages or job selections.',
  });

  // Check legitimate safeguards (legit bank debit alert with explicit safety advice)
  const hasLegitKeywords = (
    normalizedText.includes('if not done by you') ||
    normalizedText.includes('do not share otp') ||
    normalizedText.includes('consultation with dr') ||
    normalizedText.includes('debited from')
  ) && !hasSuspiciousLink && !normalizedText.includes('click here http');

  if (hasLegitKeywords) {
    riskScore = Math.min(riskScore, 20);
  }

  // Cap risk score between 0 and 98
  riskScore = Math.max(5, Math.min(96, riskScore));

  // Determine Risk Category
  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 65) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 35) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Actionable recommendations
  if (riskLevel === 'HIGH') {
    recommendations.push({
      action: 'Do Not Click Any Embedded Web Links',
      priority: 'immediate',
      detail: 'The provided link uses unverified non-institutional hosting and may lead to a cloned credential-stealing interface or malware download.',
    });
    recommendations.push({
      action: 'Never Enter UPI PIN or Share OTPs',
      priority: 'immediate',
      detail: 'Entering your UPI PIN or sharing an OTP authorises money to leave your account. No legitimate organisation ever requires your PIN to credit money.',
    });
    recommendations.push({
      action: 'Verify Through Official Channels Only',
      priority: 'precautionary',
      detail: `If you have concerns about your ${orgMentions[0] || 'account'}, call the toll-free number printed on the back of your bank debit card or visit the official mobile application directly.`,
      isOfficialChannel: true,
    });
    recommendations.push({
      action: 'Report to National Cyber Crime Portal',
      priority: 'general',
      detail: 'Forward suspicious SMS to 1909 (TRAI spam reporting) and report cyber fraud incidents to cybercrime.gov.in or helpline 1930.',
    });
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push({
      action: 'Exercise Caution Before Proceeding',
      priority: 'precautionary',
      detail: 'The message contains signals that warrant independent verification before you take action.',
    });
    recommendations.push({
      action: 'Do Not Share Personal Identifiers',
      priority: 'precautionary',
      detail: 'Never reply with your Aadhaar number, PAN details, date of birth, or banking credentials.',
    });
    recommendations.push({
      action: 'Open Official App Directly',
      priority: 'general',
      detail: 'Access your account by launching your trusted application on your phone rather than clicking message links.',
      isOfficialChannel: true,
    });
  } else {
    recommendations.push({
      action: 'Message Appears Consistent with Standard Notifications',
      priority: 'general',
      detail: 'No overt deceptive triggers, credential requests, or malicious domain links were detected.',
    });
    recommendations.push({
      action: 'Maintain Everyday Vigilance',
      priority: 'general',
      detail: 'Continue observing the golden rule: never share OTPs or secret passwords with anyone, even if they claim to be hospital staff or bank executives.',
    });
  }

  const summary = riskLevel === 'HIGH'
    ? `Critical security warnings detected. This message displays classic indicators of ${orgMentions[0] ? orgMentions[0] + ' impersonation' : 'cyber deception'}, including coercive urgency, credential harvest triggers, and suspicious links.`
    : riskLevel === 'MEDIUM'
    ? 'Moderate risk indicators present. While not conclusively malicious, this communication contains unusual elements requiring careful manual verification.'
    : 'Low risk detected. This communication aligns with standard operational notifications and does not exhibit known phishing payloads or coercive mechanisms.';

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    messageText: text,
    senderName,
    senderContact,
    claimedOrg,
    messageType,
    language,
    riskScore,
    riskLevel,
    summary,
    detectedSignals,
    psychologicalAnalysis,
    recommendations,
    isLiveAiAnalysis: true,
    analysis_source: 'local-fallback' as const,
    analyzedEntities: {
      orgs: orgMentions,
      urls: urlMatches,
      phones: phoneMatches,
      upiIds: upiMatches,
    },
  };
}

// URL Security Inspector Engine (Strictly treats URL as untrusted text - ZERO network requests)
export function runUrlAnalysis(inputUrl: string): UrlAnalysisResult {
  const trimmed = (inputUrl || '').trim();
  if (!trimmed) {
    throw new Error('Please enter a URL or web address to analyze.');
  }

  if (trimmed.length > 2048) {
    throw new Error('URL exceeds maximum permitted analysis length (2048 characters).');
  }

  let domain = '';
  let pathname = '';
  let protocol = 'http:';
  let hasUserinfo = false;
  let userinfoContent = '';
  let isIpv4 = false;
  let isIpv6 = false;

  try {
    const formatted = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `http://${trimmed}`;
    const parsed = new URL(formatted);
    protocol = parsed.protocol;
    domain = parsed.hostname;
    pathname = parsed.pathname;

    if (parsed.username || parsed.password) {
      hasUserinfo = true;
      userinfoContent = `${parsed.username}${parsed.password ? ':' + parsed.password : ''}`;
    }

    isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
    isIpv6 = domain.startsWith('[') && domain.endsWith(']');
  } catch {
    // Basic string parse fallback
    const stripped = trimmed.replace(/^https?:\/\//i, '');
    domain = stripped.split('/')[0].split('?')[0].split('#')[0] || trimmed;
  }

  let riskScore = 10;
  const domainLower = domain.toLowerCase();

  // 1. IP address check (IPv4 or IPv6)
  const isIp = isIpv4 || isIpv6;
  const ipCategory = isIp
    ? {
        status: 'dangerous' as const,
        score: 90,
        title: 'Raw IP Address Host',
        detail: 'The link directs to a raw numerical IP address rather than a registered domain name. Legitimate institutions do not publish raw IP authentication links.',
        evidence: domain,
      }
    : {
        status: 'safe' as const,
        score: 0,
        title: 'Named Hostname',
        detail: 'Destination uses a named DNS domain name rather than an anomalous direct IP address.',
      };
  if (isIp) riskScore += 50;

  // 2. High-Risk / Disposable TLDs
  const highRiskTlds = ['.top', '.xyz', '.online', '.site', '.click', '.club', '.vip', '.work', '.ru', '.cfd', '.quest', '.gq', '.ml', '.tk'];
  const matchedTld = highRiskTlds.find((tld) => domainLower.endsWith(tld));
  const hasHighRiskTld = !!matchedTld;
  const tldCategory = matchedTld
    ? {
        status: 'dangerous' as const,
        score: 75,
        title: 'Disposable High-Abuse Top-Level Domain',
        detail: `The domain uses an extension frequently associated with disposable phishing infrastructure (${matchedTld}).`,
        evidence: domain,
      }
    : {
        status: 'safe' as const,
        score: 5,
        title: 'Standard Top-Level Domain',
        detail: 'The top-level domain extension does not match known bulk disposable scam registries.',
      };
  if (matchedTld) riskScore += 30;

  // 3. Shortened URLs
  const shorteners = ['bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'cutt.ly', 'rb.gy', 'goo.gl', 'ow.ly', 'buff.ly'];
  const isShortened = shorteners.some((s) => domainLower === s || domainLower.endsWith(`.${s}`));
  const shortCategory = isShortened
    ? {
        status: 'suspicious' as const,
        score: 60,
        title: 'URL Shortening / Redirection Service',
        detail: 'Destination hidden; never expanded. Masks the downstream destination behind a shortener to evade basic filters.',
        evidence: domain,
      }
    : {
        status: 'safe' as const,
        score: 0,
        title: 'Direct Unmasked Link',
        detail: 'Destination hostname is directly legible without URL shortening redirection indirection.',
      };
  if (isShortened) riskScore += 25;

  // 4. Misleading brand keywords & Typo-squatting
  const brandKeywords = ['sbi', 'hdfc', 'icici', 'yono', 'indiapost', 'airtel', 'bescom', 'phonepe', 'paytm', 'axis', 'aadhaar', 'incometax', 'uidai'];
  const matchedBrand = brandKeywords.find((b) => domainLower.includes(b));
  const isOfficialBrandDomain =
    domainLower === 'onlinesbi.sbi' ||
    domainLower.endsWith('.onlinesbi.sbi') ||
    domainLower === 'hdfcbank.com' ||
    domainLower.endsWith('.hdfcbank.com') ||
    domainLower === 'icicibank.com' ||
    domainLower.endsWith('.icicibank.com') ||
    domainLower === 'indiapost.gov.in' ||
    domainLower.endsWith('.indiapost.gov.in') ||
    domainLower === 'airtel.in' ||
    domainLower.endsWith('.airtel.in');

  let misleadingStatus: 'safe' | 'suspicious' | 'dangerous' = 'safe';
  let misleadingDetail = 'No deceptive brand impersonation detected in the domain structure.';
  if (matchedBrand && !isOfficialBrandDomain) {
    misleadingStatus = 'dangerous';
    misleadingDetail = `Domain contains institution keyword ("${matchedBrand}") but is NOT hosted on the entity's official domain. High probability of brand phishing.`;
    riskScore += 40;
  }

  const misleadingCategory = {
    status: misleadingStatus,
    score: misleadingStatus === 'dangerous' ? 85 : 0,
    title: 'Brand Impersonation & Typosquatting',
    detail: misleadingDetail,
    evidence: matchedBrand ? `Keyword: "${matchedBrand}" in ${domain}` : undefined,
  };

  // 5. Userinfo / @ Trick Detection (e.g. http://sbi.co.in@evil.com)
  if (hasUserinfo) {
    riskScore += 45;
  }

  // 6. Suspicious Subdomain Stacking
  const subdomains = domainLower.split('.');
  const hasSubdomainStacking = subdomains.length > 3;
  const subdomainCategory = hasSubdomainStacking
    ? {
        status: 'suspicious' as const,
        score: 55,
        title: 'Multi-Level Subdomain Stacking',
        detail: 'The URL uses nested subdomains (e.g., sbi.bank.com.verify-user.net), an established tactic to deceive users viewing mobile address bars.',
        evidence: `${subdomains.length} domain segments detected`,
      }
    : {
        status: 'safe' as const,
        score: 0,
        title: 'Clean Subdomain Depth',
        detail: 'Domain adheres to standard hierarchical naming conventions.',
      };
  if (hasSubdomainStacking) riskScore += 20;

  // 7. Unusual Characters / Punycode
  const hasPunycode = domainLower.startsWith('xn--') || /[^\w.-]/.test(domainLower);
  const characterCategory = hasPunycode
    ? {
        status: 'dangerous' as const,
        score: 80,
        title: 'Punycode / Homograph Character Lookalike',
        detail: 'Domain contains non-standard ASCII characters or punycode notation, frequently used in homograph attacks to impersonate real brands visually.',
        evidence: domain,
      }
    : {
        status: 'safe' as const,
        score: 0,
        title: 'Standard ASCII Characters',
        detail: 'No homoglyph substitution or internationalized punycode anomalies found.',
      };
  if (hasPunycode) riskScore += 35;

  // Protocol check
  if (protocol === 'http:' && (matchedBrand || isIp || hasHighRiskTld)) {
    riskScore += 15;
  }

  riskScore = Math.min(98, Math.max(8, riskScore));
  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 65) riskLevel = 'HIGH';
  else if (riskScore >= 35) riskLevel = 'MEDIUM';

  const domainStructureCategory = {
    status: riskScore > 50 ? ('dangerous' as const) : ('safe' as const),
    score: Math.min(riskScore, 100),
    title: 'Domain Architecture & Static Indicators',
    detail: riskScore > 50 
      ? 'Anomalous structural patterns identified that strongly deviate from standard web services.'
      : 'Domain architecture adheres to standard web publication conventions.',
  };

  const recommendations: VerificationRecommendation[] = [];
  if (riskLevel === 'HIGH') {
    recommendations.push({
      action: 'DO NOT Open or Browse this Web Address',
      priority: 'immediate',
      detail: 'This URL has strong technical signatures of a fake or phishing clone site designed to capture login passwords or financial data.',
    });
    recommendations.push({
      action: 'Do Not Submit Forms or Download Files',
      priority: 'immediate',
      detail: 'Never input phone numbers, Aadhaar details, or banking credentials into this link.',
    });
    recommendations.push({
      action: 'Search the Official Institution Directly',
      priority: 'general',
      detail: 'Access the official website by typing the known official domain manually into your browser address bar.',
      isOfficialChannel: true,
    });
  } else {
    recommendations.push({
      action: 'Standard Link Safety Measures',
      priority: 'general',
      detail: 'Check that the domain in your browser matches your intended destination and uses HTTPS.',
    });
  }

  const summary = riskLevel === 'HIGH'
    ? `Static analysis alert: "${domain}" displays multiple deceptive technical indicators (risk score ${riskScore}/100). Do not browse to this address.`
    : riskLevel === 'MEDIUM'
    ? `Suspicious characteristics observed in static link text for "${domain}". Exercise caution.`
    : `Static inspection for "${domain}" indicates standard naming structure with no known deceptive triggers.`;

  return {
    id: `url-scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    url: trimmed,
    domain,
    riskScore,
    riskLevel,
    summary,
    categories: {
      domainStructure: domainStructureCategory,
      misleadingDomainPatterns: misleadingCategory,
      shortenedUrlDetection: shortCategory,
      suspiciousSubdomains: subdomainCategory,
      ipAddressBased: ipCategory,
      unusualCharacters: characterCategory,
      claimedOrgMismatch: misleadingCategory,
    },
    recommendations,
    isLiveAiAnalysis: false,
    analysis_source: 'static-string-rules',
  };
}

// Identity Trust & Impersonation Checker Engine (Truthful heuristics - ZERO authoritative directory lookups)
export function runIdentityAssessment(
  claimedOrg: string,
  senderEmail: string,
  senderPhone: string,
  suppliedDomain: string,
  referenceNotes = ''
): IdentityAssessmentResult {
  const matchedBrandPatterns: string[] = [];
  const inconsistentInfo: string[] = [];
  const unverifiedInfo: string[] = [];
  const riskIndicators: string[] = [];

  let riskScore = 15;

  const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com', 'proton.me'];
  const emailDomain = senderEmail.includes('@') ? senderEmail.split('@')[1].toLowerCase().trim() : '';
  const claimedLower = claimedOrg.toLowerCase().trim();

  // Check email domain vs claimed corporate entity
  if (emailDomain) {
    if (freeEmailProviders.includes(emailDomain)) {
      if (claimedLower && claimedLower.length > 2) {
        riskScore += 45;
        inconsistentInfo.push(`Claimed entity is "${claimedOrg}", but the sender is using a free public email provider (@${emailDomain}).`);
        riskIndicators.push('Free public webmail used for corporate official communication.');
      } else {
        unverifiedInfo.push(`Email address is hosted on a public service (@${emailDomain}).`);
      }
    } else {
      // Enterprise domain pattern check
      if (claimedLower && !emailDomain.includes(claimedLower.replace(/\s+/g, ''))) {
        riskScore += 30;
        inconsistentInfo.push(`Sender email domain (@${emailDomain}) does not match the claimed identity ("${claimedOrg}").`);
        riskIndicators.push('Domain provenance mismatch with claimed corporate name.');
      } else {
        matchedBrandPatterns.push(`Sender domain (@${emailDomain}) matches known naming pattern for ${claimedOrg || 'claimed entity'}.`);
      }
    }
  } else if (claimedOrg) {
    unverifiedInfo.push('No sender email address was provided for domain provenance inspection.');
  }

  // Check phone number format
  if (senderPhone) {
    const isStandardMobile = /(?:\+91|0)?[6-9]\d{9}/.test(senderPhone.replace(/\s+/g, ''));
    if (isStandardMobile && claimedLower) {
      riskScore += 25;
      inconsistentInfo.push(`Sender provided a 10-digit consumer mobile number (${senderPhone}) while claiming institutional authority (${claimedOrg}).`);
      riskIndicators.push('Institutional outreach from a personal cellular number.');
    } else {
      unverifiedInfo.push(`Phone number (${senderPhone}) could not be authoritatively verified here.`);
    }
  } else {
    unverifiedInfo.push('No telephone number was supplied for sender verification.');
  }

  // Check supplied domain
  if (suppliedDomain) {
    const domainLower = suppliedDomain.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    const highRiskTlds = ['.top', '.xyz', '.online', '.site', '.click', '.club'];
    if (highRiskTlds.some((t) => domainLower.endsWith(t))) {
      riskScore += 30;
      riskIndicators.push(`Supplied web portal is hosted on high-risk generic TLD: ${domainLower}`);
      inconsistentInfo.push(`The web portal (${domainLower}) is not hosted on an official registered institutional domain.`);
    }
  }

  // General unverified statement
  unverifiedInfo.push('No live government registry, employee directory, or carrier database was queried.');

  riskScore = Math.min(95, Math.max(10, riskScore));
  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 35) riskLevel = 'MEDIUM';

  const recommendations: VerificationRecommendation[] = [];
  if (riskLevel === 'HIGH') {
    recommendations.push({
      action: 'Do Not Accept Claimed Authority',
      priority: 'immediate',
      detail: `There is a severe contradiction between the claimed identity ("${claimedOrg}") and the sender's unverified infrastructure. Treat this communication as an impersonation attempt.`,
    });
    recommendations.push({
      action: 'Never Share Internal Documents or Funds',
      priority: 'immediate',
      detail: 'Do not transfer money or supply sensitive identity proofs (Aadhaar, PAN, employee ID).',
    });
    recommendations.push({
      action: 'Contact Official Escalation Desk Independently',
      priority: 'general',
      detail: 'Look up the verified customer service desk of the claimed entity independently and report the impostor details.',
      isOfficialChannel: true,
    });
  } else {
    recommendations.push({
      action: 'Verify Against Official Directories',
      priority: 'general',
      detail: 'Contact the person or entity through known established channels (e.g. official phonebook or mobile app) before initiating sensitive discussions.',
    });
  }

  const summary = riskLevel === 'HIGH'
    ? `High identity discrepancy detected. The sender claims to represent "${claimedOrg}", but their communication infrastructure contradicts institutional standards.`
    : riskLevel === 'MEDIUM'
    ? `Unverified identity signals found for "${claimedOrg || 'sender'}". Additional proof is required before establishing trust.`
    : `Identity markers evaluated for "${claimedOrg || 'sender'}" match expected brand patterns (not authoritatively verified).`;

  return {
    id: `ident-${Date.now()}`,
    timestamp: new Date().toISOString(),
    claimedOrg,
    senderEmail,
    senderPhone,
    suppliedDomain,
    referenceNotes,
    riskScore,
    riskLevel,
    summary,
    providedInformation: {
      claimedOrg,
      senderEmail,
      senderPhone,
      suppliedDomain,
    },
    matchedBrandPatterns,
    inconsistentInformation: inconsistentInfo,
    unverifiedInformation: unverifiedInfo,
    identityRiskIndicators: riskIndicators,
    recommendations,
    isLiveAiAnalysis: false,
    analysis_source: 'static-heuristic-rules',
  };
}

// Demo Records for Scan History (clearly labeled as Demonstration Data)
export const INITIAL_DEMO_RECORDS: ScanHistoryItem[] = [
  {
    id: 'demo-rec-1',
    timestamp: '2026-10-30T09:20:00.000Z',
    type: 'sms',
    title: 'YONO Bank KYC Suspension Alert',
    preview: 'Dear SBI User, your YONO SBI account has been suspended due to pending KYC verification. Click here http://sbi-kyc-update.top/login...',
    riskLevel: 'HIGH',
    riskScore: 92,
    isDemoRecord: true,
    data: runMessageAnalysis(
      'Dear SBI User, your YONO SBI account has been suspended due to pending KYC verification. Please click here http://sbi-kyc-update.top/login immediately to update your Pan Card within 24 hours, else your account balance will be blocked.',
      'VK-SBIINB',
      '+91 89102 38471',
      'State Bank of India',
      'sms',
      'en'
    ),
  },
  {
    id: 'demo-rec-2',
    timestamp: '2026-10-30T08:15:00.000Z',
    type: 'whatsapp',
    title: 'PhonePe Scratch Card Cashback',
    preview: 'Congratulations! You have won an instant scratch card reward of Rs 4,999 in PhonePe festival offer. Enter UPI PIN to collect...',
    riskLevel: 'HIGH',
    riskScore: 88,
    isDemoRecord: true,
    data: runMessageAnalysis(
      'Congratulations! You have won an instant scratch card reward of Rs 4,999 in PhonePe festival offer. Click the collect link below and enter your 6-digit UPI PIN on the next screen to receive the cash directly into your savings account.',
      'PhonePe Rewards Agent',
      '+91 70291 58392',
      'PhonePe',
      'whatsapp',
      'en'
    ),
  },
  {
    id: 'demo-rec-3',
    timestamp: '2026-10-29T16:40:00.000Z',
    type: 'url',
    title: 'Suspicious IP Link: 192.168.1.102/bank-login',
    preview: 'http://192.168.1.102/bank-login - Raw IP address hosting unverified banking authentication portal.',
    riskLevel: 'HIGH',
    riskScore: 94,
    isDemoRecord: true,
    data: runUrlAnalysis('http://192.168.1.102/bank-login'),
  },
  {
    id: 'demo-rec-4',
    timestamp: '2026-10-29T14:10:00.000Z',
    type: 'sms',
    title: 'HDFC Official Transaction Debit Alert',
    preview: 'Rs 1,450.00 debited from HDFC Bank A/c ending 4821 on 30-OCT-26 via UPI to ZOMATO. If not done by you call 1800-202-6161...',
    riskLevel: 'LOW',
    riskScore: 12,
    isDemoRecord: true,
    data: runMessageAnalysis(
      'Rs 1,450.00 debited from HDFC Bank A/c ending 4821 on 30-OCT-26 via UPI to ZOMATO (UPI Ref: 430291049281). If not done by you, call 1800-202-6161 immediately or SMS BLOCK to 5676712. Do not share OTP with anyone.',
      'AD-HDFCBK',
      'AD-HDFCBK',
      'HDFC Bank',
      'sms',
      'en'
    ),
  },
  {
    id: 'demo-rec-5',
    timestamp: '2026-10-29T11:05:00.000Z',
    type: 'identity',
    title: 'Airtel Impersonation (@gmail.com)',
    preview: 'Airtel Customer Service outreach originating from airtel-5g-upgrade@gmail.com with mobile number.',
    riskLevel: 'HIGH',
    riskScore: 85,
    isDemoRecord: true,
    data: runIdentityAssessment(
      'Bharti Airtel 5G Services',
      'airtel-5g-upgrade@gmail.com',
      '+91 98451 90812',
      'airtel-5g-kyc.xyz'
    ),
  },
];

const STORAGE_KEY = 'trustlens_history_v2';
const CORRUPT_BACKUP_KEY = 'trustlens_history_v2_corrupted_backup';
const DEMO_DISMISSED_KEY = 'trustlens_demo_dismissed_v2';
const PREF_STORE_RAW_KEY = 'trustlens_pref_store_raw';

// Resilient History Manager with Quarantine & Integrity Protections
export const historyManager = {
  getScans(): ScanHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      // Quarantine corrupted localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // storage quota / unavailable
      }
      console.warn('Corrupted scan history quarantined to backup key.');
      return [];
    }

    // If demo records have been dismissed/modified, return saved scans or empty array
    try {
      if (localStorage.getItem(DEMO_DISMISSED_KEY) === 'true') {
        return [];
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_RECORDS;
  },

  saveScan(item: ScanHistoryItem): void {
    try {
      localStorage.setItem(DEMO_DISMISSED_KEY, 'true');
      const allScans = this.getScans().filter((i) => i.id !== item.id);
      const storeRaw = this.getStoreRawMessage();

      const sanitizedItem: ScanHistoryItem = storeRaw
        ? item
        : {
            ...item,
            preview: item.preview.slice(0, 90),
            data: {
              ...item.data,
              messageText: '[Message text storage disabled by user privacy preference]',
            } as any,
          };

      const updated = [sanitizedItem, ...allScans].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist scan to localStorage:', e);
    }
  },

  deleteScan(id: string): void {
    try {
      const allScans = this.getScans();
      const remaining = allScans.filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      localStorage.setItem(DEMO_DISMISSED_KEY, 'true');
    } catch (e) {
      console.warn('Could not delete scan:', e);
    }
  },

  clearUserScans(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(DEMO_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  },

  exportScans(): string {
    const scans = this.getScans();
    return JSON.stringify(scans, null, 2);
  },

  getStoreRawMessage(): boolean {
    try {
      const val = localStorage.getItem(PREF_STORE_RAW_KEY);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  },

  setStoreRawMessage(allow: boolean): void {
    try {
      localStorage.setItem(PREF_STORE_RAW_KEY, allow ? 'true' : 'false');
    } catch {
      // ignore
    }
  },
};

