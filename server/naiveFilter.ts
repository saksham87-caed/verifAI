import { NaiveBaselineResult } from './types';

/**
 * Naive Static Keyword Filter
 * A simplistic baseline used by naive email filters / SMS spam guards.
 * It simply searches for high-frequency security buzzwords ("urgent", "bank", "verify", "click").
 *
 * Flaws:
 * 1. Misses polite lookalike-domain phishing (e.g. "Dear Colleague, please review your employee profile at hdfccbank.com").
 * 2. Wrongly flags legitimate bank alerts (e.g. "Debited from Bank... if not done by you verify immediately").
 */
export function runNaiveKeywordFilter(messageText: string): NaiveBaselineResult {
  const naiveKeywords = ['urgent', 'bank', 'verify', 'click', 'account', 'link', 'blocked', 'update'];
  const textLower = messageText.toLowerCase();

  const flaggedKeywords = naiveKeywords.filter((kw) => textLower.includes(kw));
  const isFlagged = flaggedKeywords.length >= 2;

  let flaw = '';
  if (isFlagged) {
    flaw = 'Naive keyword filters trigger false positives on legitimate bank statements and hospital appointments that happen to contain words like "bank" or "verify".';
  } else {
    flaw = 'Naive keyword filters miss polite, zero-urgency social engineering attacks that spoof domains without using aggressive buzzwords.';
  }

  return {
    flagged: isFlagged,
    flagged_keywords: flaggedKeywords,
    tier: isFlagged ? 'HIGH_RISK' : 'SAFE',
    reason: isFlagged
      ? `Flagged due to presence of simple static keywords: ${flaggedKeywords.map((k) => `"${k}"`).join(', ')}`
      : 'Passed without inspection because no blunt panic keywords were found.',
    flaw,
  };
}
