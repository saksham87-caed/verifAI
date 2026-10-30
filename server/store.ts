import {
  AnalysisResponse,
  AnonymizedEvent,
  StatsResponse,
  RiskTier,
  Channel,
  DetectedLanguage,
  FeedbackResponse,
  FeedbackAdjustment,
} from './types';
import { redactString } from './redaction';
import { computeScoreAndTier } from './scoring';

interface StoredAnalysis {
  analysis: AnalysisResponse;
  createdAt: number;
}

const ANALYSIS_TTL_MS = 60 * 60 * 1000; // 1 hour TTL
const MAX_STORED_ANALYSES = 5000;

class MemoryStore {
  private analyses: Map<string, StoredAnalysis> = new Map();
  private submittedFeedback: Map<string, { timestamp: number; verdict: string }> = new Map();
  private recentEvents: AnonymizedEvent[] = [];

  private feedbackCounts = {
    false_positive: 0,
    false_negative: 0,
    correct: 0,
  };

  // Real operational telemetry: Starts at 0 (No fabricated baseline counts)
  private totalsPerTier: Record<RiskTier, number> = {
    SAFE: 0,
    SUSPICIOUS: 0,
    HIGH_RISK: 0,
  };

  private totalsPerChannel: Record<Channel, number> = {
    email: 0,
    sms: 0,
  };

  private totalsPerLanguage: Record<DetectedLanguage, number> = {
    en: 0,
    hi: 0,
    mixed: 0,
  };

  private signalCounts: Map<string, { label: string; count: number }> = new Map();

  constructor() {
    // Real stats start at 0 as required by integrity audit.
  }

  /**
   * Prunes expired analyses older than 1 hour or evicts if exceeding max capacity
   */
  private pruneExpired(): void {
    const now = Date.now();
    for (const [id, record] of this.analyses.entries()) {
      if (now - record.createdAt > ANALYSIS_TTL_MS) {
        this.analyses.delete(id);
      }
    }

    if (this.analyses.size > MAX_STORED_ANALYSES) {
      const keysToDelete = Array.from(this.analyses.keys()).slice(
        0,
        this.analyses.size - MAX_STORED_ANALYSES
      );
      for (const k of keysToDelete) {
        this.analyses.delete(k);
      }
    }
  }

  public recordAnalysis(analysis: AnalysisResponse): void {
    this.pruneExpired();

    // Store strictly in-memory with creation timestamp (raw message text is never stored in AnalysisResponse)
    this.analyses.set(analysis.id, {
      analysis,
      createdAt: Date.now(),
    });

    // Update real anonymized aggregates
    this.totalsPerTier[analysis.risk_tier] = (this.totalsPerTier[analysis.risk_tier] || 0) + 1;
    this.totalsPerChannel[analysis.channel] = (this.totalsPerChannel[analysis.channel] || 0) + 1;
    this.totalsPerLanguage[analysis.detected_language] = (this.totalsPerLanguage[analysis.detected_language] || 0) + 1;

    for (const sig of analysis.signals) {
      const existing = this.signalCounts.get(sig.id) || { label: sig.label, count: 0 };
      existing.count += 1;
      this.signalCounts.set(sig.id, existing);
    }

    const event: AnonymizedEvent = {
      id: analysis.id,
      timestamp: new Date().toISOString(),
      risk_tier: analysis.risk_tier,
      risk_score: analysis.risk_score,
      channel: analysis.channel,
      detected_language: analysis.detected_language,
      signal_count: analysis.signals.length,
    };

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 20) {
      this.recentEvents.pop();
    }
  }

  public getAnalysis(id: string): AnalysisResponse | undefined {
    this.pruneExpired();
    const item = this.analyses.get(id);
    if (!item) return undefined;
    return item.analysis;
  }

  public hasFeedback(analysisId: string, clientKey: string): boolean {
    const key = `${analysisId}:${clientKey}`;
    return this.submittedFeedback.has(key);
  }

  /**
   * Re-adjudicates user feedback challenge:
   * - 404 if unknown/expired
   * - 409 if duplicate per client
   * - Strict deterministic floors: CREDENTIAL_REQUEST / FINANCIAL_ACTION_REQUEST cannot be downgraded past floor
   * - Redacts reason before storage
   */
  public recordFeedback(
    analysisId: string,
    verdict: 'false_positive' | 'false_negative' | 'correct',
    rawReason: string | undefined,
    clientKey: string
  ): { status: number; body: FeedbackResponse | { error: { code: string; message: string } } } {
    this.pruneExpired();

    const dedupKey = `${analysisId}:${clientKey}`;
    if (this.submittedFeedback.has(dedupKey)) {
      return {
        status: 409,
        body: {
          error: {
            code: 'ALREADY_SUBMITTED',
            message: 'Feedback has already been submitted for this analysis by your session.',
          },
        },
      };
    }

    const storedItem = this.analyses.get(analysisId);
    if (!storedItem) {
      return {
        status: 404,
        body: {
          error: {
            code: 'NOT_FOUND',
            message: 'Analysis record expired or not found. Please re-scan the message to challenge it.',
          },
        },
      };
    }

    const original = storedItem.analysis;
    const safeReason = rawReason ? redactString(rawReason.slice(0, 500)) : '';

    // Mark feedback submitted
    this.submittedFeedback.set(dedupKey, { timestamp: Date.now(), verdict });
    this.feedbackCounts[verdict] = (this.feedbackCounts[verdict] || 0) + 1;

    const adjustments: FeedbackAdjustment[] = [];
    const revisedSignals = [...original.signals];

    const hasCredential = original.signals.some((s) => s.id === 'CREDENTIAL_REQUEST');
    const hasFinancial = original.signals.some((s) => s.id === 'FINANCIAL_ACTION_REQUEST');
    const hasLookalike = original.signals.some(
      (s) => s.id === 'LOOKALIKE_DOMAIN' || s.id === 'URL_OBFUSCATION' || s.id === 'SENDER_DOMAIN_MISMATCH'
    );

    const userReasonLower = safeReason.toLowerCase();
    const isFamiliarSender =
      userReasonLower.includes('recognize') ||
      userReasonLower.includes('sender') ||
      userReasonLower.includes('know') ||
      userReasonLower.includes('internal') ||
      userReasonLower.includes('college') ||
      userReasonLower.includes('friend') ||
      userReasonLower.includes('branch');

    // Down-weight non-critical context signals only
    for (let i = 0; i < revisedSignals.length; i++) {
      const sig = revisedSignals[i];

      // CRITICAL RULE: Mandatory safeguards are NEVER dismissed
      if (sig.id === 'CREDENTIAL_REQUEST' || sig.id === 'FINANCIAL_ACTION_REQUEST') {
        adjustments.push({
          signal_id: sig.id,
          action: 'retained',
          reason: `Maintained strict protection on ${sig.label}. No legitimate institution solicits OTPs, PINs, or money transfers over non-standard channels, even if the sender is believed to be known.`,
        });
      } else if (sig.id === 'LOOKALIKE_DOMAIN' || sig.id === 'URL_OBFUSCATION') {
        adjustments.push({
          signal_id: sig.id,
          action: 'retained',
          reason: `Retained destination link alert (${sig.evidence}). Unofficial domain infrastructure poses high interception risks.`,
        });
      } else if (
        sig.id === 'MISSING_PROVENANCE' ||
        sig.id === 'GRAMMAR_ANOMALY' ||
        (isFamiliarSender && sig.id === 'SENDER_DOMAIN_MISMATCH')
      ) {
        revisedSignals[i] = { ...sig, weight: Math.max(0, sig.weight - 15) };
        adjustments.push({
          signal_id: sig.id,
          action: 'downweighted',
          reason: `Down-weighted ${sig.label} based on user-attested familiarity with sender.`,
        });
      } else if (sig.id === 'URGENCY_PRESSURE' && isFamiliarSender) {
        revisedSignals[i] = { ...sig, weight: Math.max(5, sig.weight - 15) };
        adjustments.push({
          signal_id: sig.id,
          action: 'downweighted',
          reason: 'Conversational urgency caution adjusted for user-verified operational communication context.',
        });
      } else if (sig.id === 'URL_SHORTENER' && isFamiliarSender) {
        revisedSignals[i] = { ...sig, weight: Math.max(5, sig.weight - 10) };
        adjustments.push({
          signal_id: sig.id,
          action: 'downweighted',
          reason: 'Shortened URL caution reduced based on attested sender context. Manual expansion still recommended.',
        });
      }
    }

    // Recompute score and tier using the Unified Scoring Policy
    const recomputed = computeScoreAndTier(revisedSignals, original.safe_signals);
    let revisedScore = recomputed.score;
    let revisedTier = recomputed.tier;

    // Strict Floor: If credential/financial combined with deceptive link exists, tier MUST remain HIGH_RISK
    if ((hasCredential || hasFinancial) && hasLookalike) {
      revisedTier = 'HIGH_RISK';
      revisedScore = Math.max(75, revisedScore);
    } else if (hasCredential || hasFinancial) {
      // Must remain at least SUSPICIOUS
      if (revisedTier === 'SAFE') {
        revisedTier = 'SUSPICIOUS';
        revisedScore = Math.max(35, revisedScore);
      }
    }

    const revisedResult: AnalysisResponse = {
      ...original,
      risk_score: revisedScore,
      risk_tier: revisedTier,
      confidence: 'MEDIUM',
      signals: revisedSignals,
      summary: `[Challenge Re-adjudication] ${original.summary} (Adjusted for user challenge: ${
        safeReason ? `"${safeReason}"` : 'sender familiarity claimed'
      }).`,
      safe_signals: [
        ...original.safe_signals,
        `User challenge recorded: "${safeReason || 'Sender context claimed'}". Heuristic weights adjusted.`,
      ],
      disclaimer: `${original.disclaimer} Re-assessed in response to false-positive challenge.`,
    };

    // Update in-memory cache
    this.analyses.set(analysisId, {
      analysis: revisedResult,
      createdAt: storedItem.createdAt,
    });

    const hasProtectedSignals = hasCredential || hasFinancial;

    return {
      status: 200,
      body: {
        success: true,
        analysis_id: analysisId,
        verdict,
        revised_result: revisedResult,
        adjustments,
        note: hasProtectedSignals
          ? 'Risk tier re-adjudicated. Mandatory credential and financial protection rules were retained for your security.'
          : 'Re-assessment complete. Scores adjusted based on your challenge.',
      },
    };
  }

  public getStats(): StatsResponse {
    const top_signals = Array.from(this.signalCounts.entries())
      .map(([id, item]) => ({ id, label: item.label, count: item.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const total =
      this.totalsPerTier.SAFE +
      this.totalsPerTier.SUSPICIOUS +
      this.totalsPerTier.HIGH_RISK;

    return {
      totals_per_tier: { ...this.totalsPerTier },
      totals_per_channel: { ...this.totalsPerChannel },
      totals_per_language: { ...this.totalsPerLanguage },
      top_signals,
      recent_events: [...this.recentEvents],
      feedback_counts: { ...this.feedbackCounts },
      total_analyzed: total,
    };
  }

  public resetForTesting(): void {
    this.analyses.clear();
    this.submittedFeedback.clear();
    this.recentEvents = [];
    this.feedbackCounts = { false_positive: 0, false_negative: 0, correct: 0 };
    this.totalsPerTier = { SAFE: 0, SUSPICIOUS: 0, HIGH_RISK: 0 };
    this.totalsPerChannel = { email: 0, sms: 0 };
    this.totalsPerLanguage = { en: 0, hi: 0, mixed: 0 };
    this.signalCounts.clear();
  }
}

export const memoryStore = new MemoryStore();
