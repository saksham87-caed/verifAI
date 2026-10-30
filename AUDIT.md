# TRUSTLENS AI — SECURITY, INTEGRITY & FULL-STACK AUDIT

**Audit Date**: October 30, 2026  
**Auditor**: Senior Full-Stack Security Engineer  
**Baseline Test Status**: 27/27 Vitest unit tests passing  
**Baseline Lint Status**: Passed (0 TypeScript errors)  
**Baseline Build Status**: Passed (Vite production build)  
**Baseline Evaluation Accuracy**: TrustLens 96.2% vs Naive Keyword Baseline 53.8%  

---

## 1. Audit Issue Log

| ID | Priority | Status | File:Line | Description | Planned Fix |
|---|---|---|---|---|---|
| **SEC-01** | **P0** | **CONFIRMED** | `server/llm.ts:105`, `server.ts:116` | PII leakage to Gemini LLM prompt via `ruleResult.signals` evidence strings, `sender`, `claimed_identity`, and feedback `reason`. | Fully redact all fields (signals, sender, claimed_identity, reason) using tokenized placeholders before prompt interpolation. |
| **SEC-02** | **P0** | **CONFIRMED** | `server/redaction.ts:79,86` | Incomplete PII redaction patterns: unspaced 12-digit Aadhaar (`\b[2-9][0-9]{11}\b`), Indian PAN cards (`\b[A-Z]{5}[0-9]{4}[A-Z]\b`), and international phone numbers. | Expand redaction engine with PAN, unspaced Aadhaar, international phone formatting, and card number variants. |
| **SEC-03** | **P0** | **CONFIRMED** | `server.ts:247`, `server/llm.ts:221` | Potential PII leakage in console logs: raw error objects and payloads logged without sanitization. | Implement a structured security logger that strips message text, evidence, sender, and reasons from all log outputs. |
| **SEC-04** | **P0** | **CONFIRMED** | `server.ts:28-43` | Helmet CSP and frameguard are completely disabled (`false`), exposing the app to arbitrary embedding and missing rate limiters on `/api/compare` and `/api/feedback`. | Configure robust Helmet CSP with configurable `ALLOWED_FRAME_ANCESTORS` (defaulting to self, Google AI Studio origins), per-route rate limiters, and `trust proxy 1`. |
| **SEC-05** | **P0** | **CONFIRMED** | `server/store.ts:112-137` | `/api/feedback` invents a successful dummy analysis result when `analysis_id` is unknown or expired, violating honest reporting rules. | Return strict 404 `{ error: { code: "NOT_FOUND", message: "Analysis record expired or not found" } }`. |
| **SEC-06** | **P0** | **CONFIRMED** | `server/store.ts:68, 104-219` | Memory store lacks 1-hour TTL cleanup, lacks feedback deduplication per client (allowing infinite spammed challenges), and allows user challenge to downgrade HIGH_RISK even when critical credential extraction rules exist. | Implement TTL-based store eviction, client feedback deduplication returning 409, and strict enforcement of mandatory risk tier floors. |
| **SEC-07** | **P0** | **CONFIRMED** | `server/types.ts:70-85`, `src/services/apiService.ts:161-163` | Analysis source is not honestly labeled (`analysis_source = "gemini+rules" \| "rules-only" \| "local-fallback"` with fallback reason). Client silently falls back to local heuristic without user notice or retry. | Add `analysis_source` and `fallback_reason` fields to contracts. Display clear badge in UI and show visible retry banner if backend is unreachable. |
| **SEC-08** | **P0** | **CONFIRMED** | `src/services/securityEngine.ts:800-830`, `src/views/IdentityImpersonationChecker.tsx:210-230` | Identity Checker labels heuristic pattern matches as "Verified Information" despite no authoritative registry lookup being performed. | Relabel fields to "Provided by you", "Inferred by heuristics", and "Could not be verified here". Prohibit the word "Verified" without authoritative integration. |
| **SEC-09** | **P0** | **CONFIRMED** | `src/views/UrlSecurityChecker.tsx:194`, `src/services/securityEngine.ts:585-640` | URL Checker claims in loading status "Checking DNS flags" and labels sample "Verified banking domain", violating the zero-fetch and static-only guarantee. | Update URL Checker copy to explicitly state "Static analysis of the link text. No page is visited. No DNS, WHOIS or reputation lookup is performed." Remove misleading "Verified" labels. |
| **ENG-01** | **P1** | **CONFIRMED** | `server/llm.ts:172-196`, `server.ts:125-127` | Single scoring policy violation: LLM additional signals are merged without recomputing the deterministic score and tier using the single scoring formula. | Recompute score, tier, confidence, and summary consistency from the merged validated signal set using a unified scoring module. |
| **ENG-02** | **P1** | **CONFIRMED** | `server/store.ts:42-61` | Artificial baseline telemetry numbers in memory store (`totalsPerTier.HIGH_RISK = 48`, etc.), displaying fabricated SOC statistics on dashboard. | Initialize real telemetry stats at 0. Separate real scan metrics from synthetic demo samples on the dashboard. |
| **ENG-03** | **P1** | **CONFIRMED** | `src/views/SecurityDashboard.tsx:86-108` | Static threat alerts presented with fabricated timestamps ("Today, 10:15 AM") and unverified telemetry without explicit illustrative labeling. | Relabel alerts to "Example scenarios (illustrative, not live intelligence)" with no invented dates or live claims. Add live `/api/health` polling. |
| **ENG-04** | **P1** | **CONFIRMED** | `src/services/securityEngine.ts:1021-1053` | Scan history does not quarantine corrupted JSON, clearing history immediately restores demo records making it impossible to empty history, and lacks raw text retention toggle. | Version storage key (`trustlens_history_v2`), quarantine corrupt JSON to backup key, support true history wipe, per-item delete, export, and optional raw text storage toggle. |
| **ENG-05** | **P1** | **CONFIRMED** | `src/views/MessageScanner.tsx:85-115`, `src/services/apiService.ts:132-138` | Scanner lacks `AbortController` cancellation, allows rapid duplicate clicks, and uses artificial fixed-timer delays disguised as inspection progress. | Add `AbortController` support, disable submit on pending, and replace artificial progress timers with honest indeterminate or event-driven states. |
| **ENG-06** | **P1** | **CONFIRMED** | `src/views/AnalysisResultsPage.tsx:37-47` | Refreshing or deep-linking to results page with empty state silently displays a hardcoded SBI scenario instead of a clear "No active scan" state. | Show empty state with "No active scan found" and direct button to Message Scanner when opened without scan state. |
| **UI-01** | **P2** | **CONFIRMED** | `src/components/HighlightedMessage.tsx:67-75` | In-place mutation of span objects during highlight slice computation and potential Unicode surrogate pair splitting on emoji or Indic combining marks. | Clone span objects before sorting/merging and use grapheme-aware / safe offset slicing. |
| **UI-02** | **P2** | **CONFIRMED** | `src/components/ChallengeModal.tsx:40-60`, `src/components/CompareModal.tsx:45-65` | Modals lack keyboard `Escape` dismissal listener and proper focus trapping. | Add `Escape` key event listener and focus management to all modals. |
| **UI-03** | **P2** | **CONFIRMED** | `src/views/AwarenessCentre.tsx:1-150` | Missing accessible ARIA roles and keyboard tab switching for categories. | Add proper ARIA tablist/tab roles and keyboard arrow navigation. |

---

## 2. Gate Verification Milestones

- [x] **Phase 0 Baseline**: Verified clean build, test suite (27 tests), and eval benchmark (96.2% accuracy).
- [ ] **Phase 1 Gate**: P0 Fixes (PII redaction, Helmet CSP, Feedback 404/409, Source labeling, Truthful URL/Identity).
- [ ] **Phase 2 Gate**: P1 Fixes (Unified scoring policy, Clean dashboard stats, Resilient history, Scanner flow).
- [ ] **Phase 3 Gate**: P1/P2 UI & Accessibility polish (Modals, Unicode offsets, Empty states, Contrast).
- [ ] **Phase 4 Gate**: Tests, Verification & Benchmark Comparison.
