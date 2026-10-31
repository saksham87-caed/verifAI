# verifAI — Unified Scoring Policy Specification

This document details the single, authoritative scoring policy implemented across verifAI.

---

## 1. Principles

1. **Deterministic Heuristics as Source of Truth**: All risk tiers, signal detections, and evidence ranges (`start`, `end`) are computed deterministically. The engine is fully explainable and reproducible.
2. **One Scoring Function**: The scoring logic resides in `server/scoring.ts::computeScoreAndTier`. All components (the rule engine, LLM merge flow, and feedback challenge recalculation) use this identical function.
3. **Additive-Only LLM Protocol**: The Gemini LLM may only ADD signals if (a) the evidence string appears verbatim in the normalized original message, (b) the signal ID is recognized or capped, and (c) the severity is valid. After merging, score and tier are deterministically recomputed.
4. **Mandatory Floor Enforcements**:
   - Any sensitive credential request (`CREDENTIAL_REQUEST` or `FINANCIAL_ACTION_REQUEST`) forces a floor of at least `SUSPICIOUS` (score >= 35).
   - Any credential or financial extraction combined with a link deception signal (`LOOKALIKE_DOMAIN`, `URL_OBFUSCATION`, `URL_SHORTENER`, `SENDER_DOMAIN_MISMATCH`) forces a floor of `HIGH_RISK` (score >= 75).
   - A user challenge can never downgrade past these deterministic floors.

---

## 2. Risk Tier Thresholds

| Risk Tier | Score Range | Meaning | Actionable Recommendation |
|---|---|---|---|
| **SAFE** | 0 – 29 | Standard communication with no detected deceptive triggers | Maintain everyday vigilance; never share OTPs |
| **SUSPICIOUS** | 30 – 64 | Moderate risk signals observed; atypical attributes | Exercise caution; verify directly via official mobile app or known directory |
| **HIGH_RISK** | 65 – 100 | Critical threat mechanisms present (impersonation, credential harvesting, power cuts) | Do NOT click links, download files, or reply; report to 1930 / cybercrime.gov.in |

---

## 3. Mathematical Formula

1. **Raw Weight Sum**:
   $$\text{rawScore} = \sum_{i} \text{signal.weight}_i$$

2. **Diminishing Returns Curve**:
   $$\text{computedScore} = \text{round}\left( (1 - e^{-\text{rawScore} / 50}) \times 100 \right)$$

3. **Safe Signal Deductions**:
   - Registered TRAI DLT 6-character header: -10
   - No external URLs or credential requests: -15
   - Explicit "Do NOT share OTP" consumer advisory: -20
   - *Constraint*: Deductions can never reduce a score below 35 if any `HIGH` severity signal is present.

4. **Tier Floor Overrides**:
   - `if (hasCredentialSignal) computedScore = max(35, computedScore)`
   - `if (hasCredentialSignal && hasUrlSignal) computedScore = max(75, computedScore)`
   - `clamp(0, 100)`

---

## 4. Signal Catalog & Weights

| Signal ID | Severity | Default Weight | Description |
|---|---|---|---|
| `CREDENTIAL_REQUEST` | HIGH | 40 | Solicits OTP, PIN, password, PAN, Aadhaar, or account login |
| `FINANCIAL_ACTION_REQUEST` | HIGH | 35 | Demands payment, fake refund/cashback, or fee to clear parcel |
| `LOOKALIKE_DOMAIN` | HIGH | 40 | Uses typosquatting, brand substrings, or disposable TLDs (.top, .xyz) |
| `URL_OBFUSCATION` | HIGH | 35 | Uses raw IP addresses, userinfo tricks (@), or excessive hyphens |
| `URL_SHORTENER` | MEDIUM | 20 | Masks true destination behind link shortener (bit.ly, tinyurl, etc.) |
| `URL_NO_HTTPS` | LOW | 15 | Uses unencrypted `http://` for login or sensitive pathways |
| `SENDER_DOMAIN_MISMATCH` | HIGH | 35 | Institutional identity claimed from free public webmail (@gmail, etc.) |
| `URGENCY_PRESSURE` | MEDIUM | 25 | Threatens disconnection, account block within 24 hours, or fine |
| `IMPERSONATION_AUTHORITY`| HIGH | 30 | Impersonates police, CBI, customs, or court ("digital arrest") |
| `MISSING_PROVENANCE` | LOW | 10 | Generic greeting with no personal recipient identifiers |
| `SENSITIVE_CHANNEL_SHIFT`| MEDIUM | 25 | Requests shifting from formal email to private WhatsApp or Telegram |
| `QR_CONTENT` | MEDIUM | 20 | Prompts scanning a QR code to receive money (a common UPI scam) |
| `GRAMMAR_ANOMALY` | LOW | 10 | Anomalous phrasing, mixed script obfuscations, or excessive urgency markers |
