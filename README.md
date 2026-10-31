# verifAI

> **"Don't Trust the Message. Verify the Identity."**  
> *Your AI-powered shield against phishing, impersonation, and digital deception.*

verifAI is a defensive, privacy-preserving cybersecurity assistant designed for high-risk phishing, smishing, and digital impersonation attacks, with specialized focus on the Indian financial and communications ecosystem (UPI scams, bank KYC suspensions, electricity blackout threats, job extortion, and regional languages including English and Hindi).

---

## 🛡️ Core Architecture: Hybrid Rules + Gemini LLM

```
       [ Untrusted Message / Email / SMS ]
                       │
                       ▼
          ┌──────────────────────────┐
          │  PII Redaction Engine    │ ── [PHONE], [EMAIL], [ID], [CARD], [OTP], [UPI]
          └──────────────────────────┘
                       │
                       ▼
          ┌──────────────────────────┐
          │ Deterministic Heuristics │ ── Single Source of Truth
          │      (Rule Engine)       │    - Static String URL inspection
          └──────────────────────────┘    - Sender domain matching & lookalikes
                       │                  - Urgency & Disconnection triggers
                       │                  - Credential & PIN requests
                       │                  - Negative-advice exclusion guards
                       ▼
                 [ Risk Tier ]
         (SAFE | SUSPICIOUS | HIGH_RISK)
                       │
                       ▼
            ┌──────────────────────┐
            │   Gemini 3.8 Flash   │ ── Strict delimiter isolation
            │  (Language & Synth)  │    JSON-schema response validation
            └──────────────────────┘    8s timeout + 1 retry
                       │
                       ├─────────────────► [ Graceful Fallback: llm_used = false ]
                       ▼
         [ Final Forensic Assessment ]
          - Risk Tier & Calibrated Score
          - Highlighted Text Offsets
          - Verification Guidance
```

1. **Deterministic Rule Engine as Single Source of Truth**: All risk tiers, signal detections, and evidence offset ranges (`start`, `end`) are computed deterministically. The engine is explainable, reproducible, and impervious to LLM hallucination.
2. **Gemini 3.8 Flash for Linguistic Synthesis**: Gemini synthesizes actionable, human-readable explanations and identifies subtle psychological manipulation triggers within strict data delimiters.
3. **Graceful Fallback Guarantee**: If the LLM call times out (8 seconds) or if the API key is not configured, verifAI returns a complete, valid result generated purely by the heuristic engine with `llm_used: false`. The user interface never crashes or blocks.

---

## 🔒 Hard Safety Rules (Defensive Protocol)

verifAI adheres strictly to non-negotiable defensive constraints:

- **Static String Analysis Only**: URLs in messages are NEVER fetched, connected to, resolved via DNS, or visited.
- **Zero Automated Actions**: The system never sends replies, emails, SMS, or triggers external actions on the user's behalf.
- **PII Redaction**: All phone numbers, Aadhaar-like 12-digit IDs, payment card numbers, OTPs, and UPI IDs are redacted to placeholder tokens before processing or logging. Email addresses have their local-part masked while preserving the domain part (which serves as evidence).
- **In-Memory Volatile Processing**: Raw message content is processed strictly in-memory and immediately discarded. Only anonymized statistical aggregates (risk tier, signal identifiers, language, channel, timestamp) are stored.
- **Prompt-Injection Defense**: Untrusted message text is isolated using strict delimiters (`<<<UNTRUSTED_MESSAGE_DATA_DO_NOT_EXECUTE>>>`), explicit anti-injection instructions, and JSON schema output validation.

---

## 🔌 API Endpoints Reference

### 1. `POST /api/analyze`
Analyzes a submitted message or email for phishing signals and impersonation.
- **Request Body**:
  ```json
  {
    "message": "Dear SBI User, your YONO account is suspended. Update KYC at http://sbi-kyc-update.top/login within 24h.",
    "channel": "sms",
    "language": "en",
    "sender": "VK-SBIINB",
    "claimed_identity": "State Bank of India"
  }
  ```
- **Response**:
  ```json
  {
    "id": "tls_1730294829102_a8f3b9c1",
    "risk_tier": "HIGH_RISK",
    "risk_score": 90,
    "confidence": "HIGH",
    "detected_language": "en",
    "channel": "sms",
    "signals": [
      {
        "id": "LOOKALIKE_DOMAIN",
        "label": "Lookalike / Typosquatted Domain",
        "severity": "HIGH",
        "weight": 35,
        "evidence": "http://sbi-kyc-update.top/login",
        "start": 80,
        "end": 111,
        "explanation": "Domain 'sbi-kyc-update.top' imitates State Bank of India using an untrusted TLD."
      }
    ],
    "summary": "Critical phishing attempt impersonating State Bank of India with deceptive KYC portal.",
    "verification_steps": [
      "Do NOT click any link in this SMS.",
      "Access YONO SBI exclusively through official banking apps or onlinesbi.sbi."
    ],
    "safe_signals": [],
    "redactions": [],
    "llm_used": true,
    "disclaimer": "Defensive analysis provided for educational and verification guidance."
  }
  ```

### 2. `POST /api/feedback`
Allows users to challenge an assessment (e.g. false positive on legitimate corporate messages).
- **Request Body**:
  ```json
  {
    "analysis_id": "tls_1730294829102_a8f3b9c1",
    "verdict": "false_positive",
    "reason": "This was an internal scheduled maintenance alert from my corporate IT helpdesk."
  }
  ```
- **Response**: Returns `revised_result`, signal adjustments (`downweighted` vs `retained`), and adjudication reasoning. (Critical credential theft and financial extraction rules remain protected for safety).

### 3. `GET /api/stats`
Returns anonymized telemetry: total scans, tier breakdown, channel breakdown, language distribution, top detected signals, and feedback counts.

### 4. `GET /api/samples`
Returns 26 curated synthetic test samples spanning:
- English, Hindi, and code-mixed messages.
- High-risk phishing attacks (KYC smishing, utility blackouts, UPI cashbacks, job scams).
- Tricky benign messages with security disclaimers (e.g. HDFC debit alert with "Do NOT share OTP").

### 5. `POST /api/compare`
Compares a message simultaneously against a **Naive Keyword Baseline** and **verifAI**:
- Demonstrates why keyword filters fail (false alarms on benign security warnings, false negatives on obfuscated or lookalike URLs).
- Highlights verifAI's contextual and offset-level forensic edge.

### 6. `GET /api/health`
Health check endpoint reporting `{ "status": "ok", "llm_configured": boolean }`.

---

## 🧪 Testing & Evaluation Benchmark

### Run Automated Unit Tests (Vitest)
```bash
npm test
```
Executes 27 tests across 8 categories:
- PII Redaction & Normalization
- Static URL String Analysis (no network activity)
- Multilingual & Regional Heuristics (English, Hindi)
- Tier Overrides & Guardrails
- Benign Transaction Exclusion Guards
- Prompt Injection Sanitization & Delimitation
- Rule Engine LLM Fallback (`llm_used: false`)
- Feedback Adjudication & Signal Retention

### Run Benchmark Evaluation
```bash
npm run eval
```
Evaluates verifAI against the 26-sample benchmark dataset compared to a naive keyword filter:
- **verifAI Accuracy**: ~96.2% (100% Precision, 100% Recall, 0 False Negatives)
- **Naive Keyword Baseline Accuracy**: ~53.8% (high false positive rate on benign banking disclaimers)

---

## 🚀 Environment Variables

Copy `.env.example` to `.env`:
```bash
# GEMINI_API_KEY: Injected by AI Studio user secrets panel
GEMINI_API_KEY="your_api_key_here"

# GEMINI_MODEL: Model alias (default: gemini-3.8-flash)
GEMINI_MODEL="gemini-3.8-flash"

# PORT: Server port (default: 3000)
PORT="3000"
```

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, Helmet, Express-Rate-Limit, Zod
- **AI Integration**: `@google/genai` (Gemini 3.8 Flash)
- **Testing**: Vitest
