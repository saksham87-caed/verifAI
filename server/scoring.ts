/**
 * TrustLens AI - Single Unified Scoring Policy
 *
 * Deterministic Rule Engine is the Source of Truth.
 * Final Score = f(validated signals), clamped to 0-100.
 *
 * Tier Thresholds:
 * - 0 - 29: SAFE
 * - 30 - 64: SUSPICIOUS
 * - 65 - 100: HIGH_RISK
 *
 * Mandatory Deterministic Floors:
 * 1. CREDENTIAL_REQUEST or FINANCIAL_ACTION_REQUEST forces at least SUSPICIOUS (score >= 35).
 * 2. Credential/Financial request combined with a URL / Lookalike / Obfuscation signal forces HIGH_RISK (score >= 75).
 * 3. Safe Signals Deductions: Legitimate DLT headers, absence of URLs, or explicit security disclaimers
 *    reduce raw score, but NEVER reduce to SAFE if a HIGH severity threat signal is present (floor of 35).
 */

import { RiskTier, Confidence, Signal, DetectedLanguage } from './types';

export interface ScoringResult {
  score: number;
  tier: RiskTier;
  confidence: Confidence;
}

export function computeScoreAndTier(
  signals: Signal[],
  safeSignals: string[] = []
): ScoringResult {
  // 1. Calculate raw weight
  let rawScore = 0;
  for (const sig of signals) {
    rawScore += sig.weight;
  }

  // 2. Diminishing returns curve: (1 - e^(-rawScore / 50)) * 100
  let computedScore = Math.round((1 - Math.exp(-rawScore / 50)) * 100);

  // 3. Calculate safe signal deductions
  let safeDeduction = 0;
  for (const safe of safeSignals) {
    if (safe.includes('TRAI DLT') || safe.includes('format')) {
      safeDeduction += 10;
    } else if (safe.includes('no embedded web links') || safe.includes('no external links')) {
      safeDeduction += 15;
    } else if (safe.includes('cautioning against sharing OTPs') || safe.includes('disclaimer')) {
      safeDeduction += 20;
    } else {
      safeDeduction += 5;
    }
  }

  // Apply safe deduction with high-severity floor
  const hasHighSeverity = signals.some((s) => s.severity === 'HIGH');
  if (safeDeduction > 0) {
    const floor = hasHighSeverity ? 35 : 0;
    computedScore = Math.max(floor, computedScore - safeDeduction);
  }

  // 4. Enforce Mandatory Deterministic Floors
  const hasCredentialSignal = signals.some(
    (s) => s.id === 'CREDENTIAL_REQUEST' || s.id === 'FINANCIAL_ACTION_REQUEST'
  );

  const hasUrlDeceptionSignal = signals.some(
    (s) =>
      s.id === 'LOOKALIKE_DOMAIN' ||
      s.id === 'URL_OBFUSCATION' ||
      s.id === 'URL_SHORTENER' ||
      s.id === 'SENDER_DOMAIN_MISMATCH'
  );

  // Floor 1: Any active credential or financial extraction forces at least SUSPICIOUS (min 35)
  if (hasCredentialSignal) {
    computedScore = Math.max(35, computedScore);
  }

  // Floor 2: Credential or financial request combined with link deception forces HIGH_RISK (min 75)
  if (hasCredentialSignal && hasUrlDeceptionSignal) {
    computedScore = Math.max(75, computedScore);
  }

  // 5. Clamp strictly to 0 - 100
  computedScore = Math.max(0, Math.min(100, computedScore));

  // 6. Map to Tier
  let tier: RiskTier = 'SAFE';
  if (computedScore >= 65) {
    tier = 'HIGH_RISK';
  } else if (computedScore >= 30) {
    tier = 'SUSPICIOUS';
  } else {
    tier = 'SAFE';
  }

  // 7. Calculate Confidence
  let confidence: Confidence = 'HIGH';
  if (signals.length === 1 && signals[0].severity === 'LOW') {
    confidence = 'MEDIUM';
  } else if (signals.length === 0 && safeSignals.length === 0) {
    confidence = 'MEDIUM';
  }

  return {
    score: computedScore,
    tier,
    confidence,
  };
}

/**
 * Validates that an LLM-generated summary does not contradict the final deterministic tier.
 * If contradiction is detected (e.g. LLM says "safe" for HIGH_RISK), replaces it with template.
 */
export function sanitizeSummaryForTier(
  summaryText: string,
  tier: RiskTier,
  language: DetectedLanguage = 'en'
): string {
  const lower = (summaryText || '').toLowerCase();

  const claimsSafe =
    lower.includes('safe') ||
    lower.includes('legitimate') ||
    lower.includes('no threat') ||
    lower.includes('सुरक्षित') ||
    lower.includes('ಸುರಕ್ಷಿತ');

  const claimsDangerous =
    lower.includes('dangerous') ||
    lower.includes('critical threat') ||
    lower.includes('phishing attack') ||
    lower.includes('गंभीर खतरा') ||
    lower.includes('ಬೆದರಿಕೆ');

  const contradictory =
    (tier === 'HIGH_RISK' && claimsSafe) ||
    (tier === 'SAFE' && claimsDangerous);

  if (!contradictory && summaryText && summaryText.trim().length > 10) {
    return summaryText.trim();
  }

  // Fallback to deterministic language template
  if (language === 'hi') {
    return tier === 'HIGH_RISK'
      ? 'इस संदेश में गंभीर सुरक्षा खतरे पाए गए हैं। इसमें संदिग्ध लिंक, कृत्रिम तात्कालिकता या क्रेडेंशियल चुराने के संकेत मिले हैं।'
      : tier === 'SUSPICIOUS'
      ? 'संदेश में कुछ संदिग्ध विशेषताएं पाई गई हैं। किसी भी लिंक पर क्लिक करने से पहले आधिकारिक माध्यम से पुष्टि करें।'
      : 'इस संदेश में कोई सक्रिय फ़िशिंग या धोखाधड़ी के संकेत नहीं मिले। यह एक सामान्य सूचना प्रतीत होती है।';
  }

  return tier === 'HIGH_RISK'
    ? 'Critical threat indicators detected. The message exhibits known phishing mechanisms, including coercive urgency, credential solicitation, or unverified link destinations.'
    : tier === 'SUSPICIOUS'
    ? 'Caution advised. Moderate risk signals were observed that deviate from standard verified corporate communications.'
    : 'Low risk. The message matches standard informational patterns and exhibits no deceptive credential or payment vectors.';
}
