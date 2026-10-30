import { z } from 'zod';

export type RiskTier = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type DetectedLanguage = 'en' | 'hi' | 'mixed';
export type Channel = 'email' | 'sms';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export type AnalysisSource = 'gemini+rules' | 'rules-only' | 'local-fallback';
export type FallbackReason =
  | 'timeout'
  | 'quota'
  | 'invalid_output'
  | 'missing_key'
  | 'backend_unreachable'
  | 'model_unavailable';

export interface Signal {
  id: string;
  label: string;
  severity: Severity;
  weight: number;
  evidence: string;
  start: number;
  end: number;
  explanation: string;
}

export interface AnalysisResponse {
  id: string;
  risk_tier: RiskTier;
  risk_score: number;
  confidence: Confidence;
  detected_language: DetectedLanguage;
  channel: Channel;
  signals: Signal[];
  summary: string;
  verification_steps: string[];
  safe_signals: string[];
  redactions: string[];
  llm_used: boolean;
  analysis_source: AnalysisSource;
  fallback_reason?: FallbackReason;
  disclaimer: string;
}

export interface FeedbackRequest {
  analysis_id: string;
  verdict: 'false_positive' | 'false_negative' | 'correct';
  reason?: string;
}

export interface FeedbackAdjustment {
  signal_id: string;
  action: 'downweighted' | 'retained' | 'dismissed';
  reason: string;
}

export interface FeedbackResponse {
  success: boolean;
  analysis_id: string;
  verdict: 'false_positive' | 'false_negative' | 'correct';
  revised_result: AnalysisResponse;
  adjustments: FeedbackAdjustment[];
  note: string;
}

export interface SampleItem {
  id: string;
  channel: Channel;
  language: DetectedLanguage;
  text: string;
  sender?: string;
  claimed_identity?: string;
  expected_tier: RiskTier;
  expected_signal_ids: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'tricky_benign';
  description: string;
}

export interface NaiveBaselineResult {
  flagged: boolean;
  flagged_keywords: string[];
  tier: 'SAFE' | 'HIGH_RISK';
  reason: string;
  flaw: string;
}

export interface CompareResponse {
  id: string;
  naive_baseline: NaiveBaselineResult;
  trustlens: {
    risk_tier: RiskTier;
    risk_score: number;
    signals_count: number;
    top_signals: string[];
    summary: string;
    advantage: string;
  };
  comparison_insight: string;
}

export interface AnonymizedEvent {
  id: string;
  timestamp: string;
  risk_tier: RiskTier;
  risk_score: number;
  channel: Channel;
  detected_language: DetectedLanguage;
  signal_count: number;
}

export interface StatsResponse {
  totals_per_tier: Record<RiskTier, number>;
  totals_per_channel: Record<Channel, number>;
  totals_per_language: Record<DetectedLanguage, number>;
  top_signals: Array<{ id: string; label: string; count: number }>;
  recent_events: AnonymizedEvent[];
  feedback_counts: {
    false_positive: number;
    false_negative: number;
    correct: number;
  };
  total_analyzed: number;
}

// Zod validation schemas
export const AnalyzeRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(5000, 'Message cannot exceed 5000 characters'),
  channel: z.enum(['email', 'sms', 'auto']).default('auto'),
  language: z.enum(['en', 'hi', 'auto']).default('auto'),
  sender: z.string().trim().max(200).optional(),
  claimed_identity: z.string().trim().max(200).optional(),
});

export const FeedbackRequestSchema = z.object({
  analysis_id: z.string().trim().min(1, 'analysis_id is required').max(100),
  verdict: z.enum(['false_positive', 'false_negative', 'correct']),
  reason: z.string().trim().max(500, 'Reason cannot exceed 500 characters').optional(),
});
