/**
 * PII Redaction and Text Normalization Module
 * Strict defensive safety rule:
 * Redact PII before logging or sending to the LLM:
 * - Phone numbers (Indian & International formats)
 * - Emails (keep domain for evidence)
 * - Aadhaar-like 12-digit numbers (spaced or unspaced)
 * - PAN cards (Indian 10-character alphanumeric)
 * - Card-like numbers (13-19 digits, spaced or contiguous)
 * - OTP-like codes (4-8 digits near OTP/PIN/CVV/password words)
 * - UPI IDs (name@bank)
 */

export interface RedactionResult {
  redactedText: string;
  redactions: string[];
}

/**
 * Normalizes input text for rule matching:
 * - Unicode NFKC
 * - Strips zero-width characters
 * - Normalizes homoglyphs (e.g. Cyrillic a, e, o, p, c -> Latin)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  // Unicode NFKC normalization
  let normalized = text.normalize('NFKC');

  // Strip zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

  // Map common Cyrillic / Greek lookalikes to Latin
  const homoglyphMap: Record<string, string> = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
    'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'і': 'i', 'І': 'I',
    'α': 'a', 'ο': 'o', 'ν': 'v', 'τ': 't',
  };

  normalized = normalized.replace(/[аеорсухАВЕКМНОРСТХіІαοντ]/g, (ch) => homoglyphMap[ch] || ch);

  return normalized;
}

/**
 * Strips HTML tags but extracts any href URLs to preserve them for static string analysis
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  // Extract hrefs to keep link destinations in text
  let sanitized = input.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 (Link: $1)');
  // Strip all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]+>/g, ' ');
  // Unescape common HTML entities
  sanitized = sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return sanitized.trim();
}

/**
 * Redacts PII from text for secure logging and LLM inspection.
 * Keeps domain part of email addresses and URLs intact for evidence attribution.
 */
export function redactPii(text: string): RedactionResult {
  if (!text) return { redactedText: '', redactions: [] };

  const redactionsSet = new Set<string>();
  let result = text;

  // 1. Credit / Debit Card Numbers (13-19 digits, formatted with spaces/dashes or contiguous)
  const cardRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|(?:[0-9]{4}[-\s]){3}[0-9]{1,4}|[0-9]{13,19})\b/g;
  if (cardRegex.test(result)) {
    redactionsSet.add('CARD');
    result = result.replace(cardRegex, '[CARD]');
  }

  // 2. Aadhaar-like 12-digit numbers: 1234 5678 9012 or 1234-5678-9012 or 12 unspaced digits
  const aadhaarRegex = /\b[2-9][0-9]{3}[\s-][0-9]{4}[\s-][0-9]{4}\b|\b[2-9][0-9]{11}\b/g;
  if (aadhaarRegex.test(result)) {
    redactionsSet.add('ID');
    result = result.replace(aadhaarRegex, '[ID]');
  }

  // 3. Indian PAN Card (5 uppercase letters, 4 digits, 1 uppercase letter e.g. ABCDE1234F)
  const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g;
  if (panRegex.test(result)) {
    redactionsSet.add('PAN');
    result = result.replace(panRegex, '[PAN]');
  }

  // 4. Phone numbers:
  // a) Indian 10 digits starting with 6-9, optionally prefixed with +91 or 0
  const indianPhoneRegex = /(?:\+91[\s-]?)?(?:0)?[6-9]\d{4}[\s-]?\d{5}\b/g;
  if (indianPhoneRegex.test(result)) {
    redactionsSet.add('PHONE');
    result = result.replace(indianPhoneRegex, '[PHONE]');
  }

  // b) International telephone numbers with country code e.g. +1 555-123-4567, +44 7911 123456
  const intlPhoneRegex = /(?:\+\d{1,3}[\s-]?)?(?:\([0-9]{2,4}\)[\s-]?)?[0-9]{3,4}[\s-][0-9]{3,4}(?:[\s-][0-9]{3,4})?\b/g;
  if (intlPhoneRegex.test(result)) {
    redactionsSet.add('PHONE');
    result = result.replace(intlPhoneRegex, '[PHONE]');
  }

  // 5. UPI IDs (e.g. username@okhdfcbank, name@upi, 9876543210@paytm, user@ybl) - preserve provider handle
  const upiRegex = /\b[a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|ibl|upi|axl|apl|barodampay)\b/gi;
  if (upiRegex.test(result)) {
    redactionsSet.add('UPI');
    result = result.replace(upiRegex, '[UPI]@$1');
  }

  // 6. Emails (preserve domain name for forensic evidence: e.g. [EMAIL]@sbi-update.xyz)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g;
  if (emailRegex.test(result)) {
    redactionsSet.add('EMAIL');
    result = result.replace(emailRegex, '[EMAIL]@$1');
  }

  // 7. OTP-like codes (e.g., "OTP: 492018", "verification code is 849201", "PIN 4819", "CVV 123")
  const otpContextRegex = /\b(otp|code|pin|cvv|password|secret|one[\s-]time[\s-]password|verification[\s-]code)(?:\s+(?:is|:|=|-))?\s+([0-9]{3,8})\b/gi;
  if (otpContextRegex.test(result)) {
    redactionsSet.add('OTP');
    result = result.replace(otpContextRegex, '$1 [OTP]');
  }

  return {
    redactedText: result,
    redactions: Array.from(redactionsSet),
  };
}

/**
 * Redacts any single string value (e.g. sender, claimed identity, or feedback reason).
 */
export function redactString(val?: string): string {
  if (!val) return '';
  return redactPii(val).redactedText;
}
