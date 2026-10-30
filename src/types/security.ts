export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export type MessageType = 'sms' | 'email' | 'whatsapp' | 'other';

export type LanguageCode = 'en' | 'hi' | 'auto';

export type AnalysisSource = 'gemini+rules' | 'rules-only' | 'local-fallback';
export type FallbackReason =
  | 'timeout'
  | 'quota'
  | 'invalid_output'
  | 'missing_key'
  | 'backend_unreachable'
  | 'model_unavailable';

export interface DetectedSignal {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  evidence: string;
  explanation: string;
  category: 'domain' | 'urgency' | 'financial' | 'provenance' | 'deception';
}

export interface PsychologicalTechnique {
  type: 'fear' | 'urgency' | 'fake_authority' | 'greed' | 'curiosity' | 'social_pressure';
  name: string;
  detected: boolean;
  score: number; // 0 to 10
  highlightedPhrases: string[];
  description: string;
}

export interface VerificationRecommendation {
  action: string;
  priority: 'immediate' | 'precautionary' | 'general';
  detail: string;
  isOfficialChannel?: boolean;
}

export interface MessageAnalysisResult {
  id: string;
  timestamp: string;
  messageText: string;
  senderName?: string;
  senderContact?: string;
  claimedOrg?: string;
  messageType: MessageType;
  language: LanguageCode;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  summary: string;
  detectedSignals: DetectedSignal[];
  psychologicalAnalysis: PsychologicalTechnique[];
  recommendations: VerificationRecommendation[];
  isLiveAiAnalysis: boolean;
  analysis_source: AnalysisSource;
  fallback_reason?: FallbackReason;
  userFeedback?: 'correct' | 'false_positive';
  analyzedEntities: {
    orgs: string[];
    urls: string[];
    phones: string[];
    upiIds: string[];
  };
  // Backend enhanced properties
  backendResponse?: BackendAnalysisResponse;
}

export interface UrlCategoryAnalysis {
  status: 'safe' | 'suspicious' | 'dangerous';
  score: number;
  title: string;
  detail: string;
  evidence?: string;
}

export interface UrlAnalysisResult {
  id: string;
  timestamp: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  categories: {
    domainStructure: UrlCategoryAnalysis;
    misleadingDomainPatterns: UrlCategoryAnalysis;
    shortenedUrlDetection: UrlCategoryAnalysis;
    suspiciousSubdomains: UrlCategoryAnalysis;
    ipAddressBased: UrlCategoryAnalysis;
    unusualCharacters: UrlCategoryAnalysis;
    claimedOrgMismatch: UrlCategoryAnalysis;
  };
  recommendations: VerificationRecommendation[];
  isLiveAiAnalysis: boolean;
  analysis_source: 'static-string-rules';
  userFeedback?: 'correct' | 'false_positive';
}

export interface IdentityAssessmentResult {
  id: string;
  timestamp: string;
  claimedOrg: string;
  senderEmail: string;
  senderPhone: string;
  suppliedDomain: string;
  referenceNotes: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  // Truthful labelling: No authoritative source is queried
  providedInformation: {
    claimedOrg: string;
    senderEmail: string;
    senderPhone: string;
    suppliedDomain: string;
  };
  matchedBrandPatterns: string[];
  inconsistentInformation: string[];
  unverifiedInformation: string[];
  identityRiskIndicators: string[];
  recommendations: VerificationRecommendation[];
  isLiveAiAnalysis: boolean;
  analysis_source: 'static-heuristic-rules';
  userFeedback?: 'correct' | 'false_positive';
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  type: 'sms' | 'email' | 'whatsapp' | 'url' | 'identity' | 'other';
  title: string;
  preview: string;
  riskLevel: RiskLevel;
  riskScore: number;
  isDemoRecord: boolean;
  data: MessageAnalysisResult | UrlAnalysisResult | IdentityAssessmentResult;
}

export interface ScamEducationCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  simpleExplanation: string;
  realisticExample: string;
  warningSigns: string[];
  preventionTips: string[];
  statsContext: string;
}

// ================= BACKEND API SCHEMAS =================
export type BackendRiskTier = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';

export interface BackendSignal {
  id: string;
  label: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  weight: number;
  evidence: string;
  start: number;
  end: number;
  explanation: string;
}

export interface BackendAnalysisResponse {
  id: string;
  risk_tier: BackendRiskTier;
  risk_score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  detected_language: 'en' | 'hi' | 'mixed';
  channel: 'email' | 'sms';
  signals: BackendSignal[];
  summary: string;
  verification_steps: string[];
  safe_signals: string[];
  redactions: string[];
  llm_used: boolean;
  analysis_source: AnalysisSource;
  fallback_reason?: FallbackReason;
  disclaimer: string;
}

export interface BackendFeedbackResponse {
  success: boolean;
  analysis_id: string;
  verdict: 'false_positive' | 'false_negative' | 'correct';
  revised_result: BackendAnalysisResponse;
  adjustments: Array<{
    signal_id: string;
    action: 'downweighted' | 'retained' | 'dismissed';
    reason: string;
  }>;
  note: string;
}

export interface BackendCompareResponse {
  id: string;
  naive_baseline: {
    flagged: boolean;
    flagged_keywords: string[];
    tier: 'SAFE' | 'HIGH_RISK';
    reason: string;
    flaw: string;
  };
  trustlens: {
    risk_tier: BackendRiskTier;
    risk_score: number;
    signals_count: number;
    top_signals: string[];
    summary: string;
    advantage: string;
  };
  comparison_insight: string;
}

export interface BackendStatsResponse {
  totals_per_tier: Record<BackendRiskTier, number>;
  totals_per_channel: Record<'email' | 'sms', number>;
  totals_per_language: Record<'en' | 'hi' | 'mixed', number>;
  top_signals: Array<{ id: string; label: string; count: number }>;
  recent_events: Array<{
    id: string;
    timestamp: string;
    risk_tier: BackendRiskTier;
    risk_score: number;
    channel: 'email' | 'sms';
    detected_language: string;
    signal_count: number;
  }>;
  feedback_counts: {
    false_positive: number;
    false_negative: number;
    correct: number;
  };
  total_analyzed: number;
}

export interface BackendSampleItem {
  id: string;
  channel: 'email' | 'sms';
  language: 'en' | 'hi' | 'mixed';
  text: string;
  sender?: string;
  claimed_identity?: string;
  expected_tier: BackendRiskTier;
  expected_signal_ids: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'tricky_benign';
  description: string;
}
