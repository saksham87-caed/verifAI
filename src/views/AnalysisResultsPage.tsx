import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Lock,
  ArrowLeft,
  Copy,
  SplitSquareVertical,
  AlertTriangle,
  Check,
  AlertCircle,
} from 'lucide-react';
import { MessageAnalysisResult, BackendAnalysisResponse } from '../types/security';
import { ScoreCircle } from '../components/ScoreCircle';
import { RiskBadge } from '../components/RiskBadge';
import { saveUserFeedback } from '../services/apiService';
import { runMessageAnalysis } from '../services/securityEngine';
import { HighlightedMessage } from '../components/HighlightedMessage';
import { CompareModal } from '../components/CompareModal';
import { ChallengeModal } from '../components/ChallengeModal';

function normalizeToMessageAnalysisResult(data: any): MessageAnalysisResult | null {
  if (!data) return null;
  if ('messageText' in data && 'detectedSignals' in data) {
    return data as MessageAnalysisResult;
  }
  if ('url' in data && 'categories' in data) {
    const urlData = data as any;
    const detectedSignals = Object.entries(urlData.categories || {})
      .filter(([_, cat]: any) => cat && cat.score > 0)
      .map(([key, cat]: any, idx) => ({
        id: `url-sig-${idx}`,
        name: cat.title || key,
        severity: cat.status === 'dangerous' ? ('critical' as const) : cat.status === 'suspicious' ? ('medium' as const) : ('low' as const),
        evidence: cat.evidence || urlData.domain || urlData.url,
        explanation: cat.detail || 'URL category signal',
        category: 'domain' as const,
      }));

    return {
      id: urlData.id || `url-${Date.now()}`,
      timestamp: urlData.timestamp || new Date().toISOString(),
      messageText: `[Link Inspector URL]: ${urlData.url}`,
      senderName: urlData.domain,
      claimedOrg: urlData.domain,
      messageType: 'other',
      language: 'auto',
      riskScore: urlData.riskScore,
      riskLevel: urlData.riskLevel,
      summary: urlData.summary,
      detectedSignals,
      psychologicalAnalysis: [],
      recommendations: urlData.recommendations || [],
      isLiveAiAnalysis: urlData.isLiveAiAnalysis || false,
      analysis_source: 'rules-only',
      analyzedEntities: {
        orgs: [urlData.domain],
        urls: [urlData.url],
        phones: [],
        upiIds: [],
      },
    };
  }
  if ('claimedOrg' in data && ('senderEmail' in data || 'senderPhone' in data)) {
    const identData = data as any;
    const detectedSignals = (identData.identityRiskIndicators || []).map((ind: string, idx: number) => ({
      id: `ident-sig-${idx}`,
      name: 'Identity Inconsistency',
      severity: 'high' as const,
      evidence: ind,
      explanation: ind,
      category: 'provenance' as const,
    }));

    return {
      id: identData.id || `ident-${Date.now()}`,
      timestamp: identData.timestamp || new Date().toISOString(),
      messageText: `[Identity Check]: Claimed Entity "${identData.claimedOrg || 'Unknown'}"\nSender Email: ${identData.senderEmail || 'N/A'}\nSender Phone: ${identData.senderPhone || 'N/A'}\nSupplied Domain: ${identData.suppliedDomain || 'N/A'}`,
      senderName: identData.senderEmail || identData.senderPhone,
      senderContact: identData.senderEmail || identData.senderPhone,
      claimedOrg: identData.claimedOrg,
      messageType: 'other',
      language: 'auto',
      riskScore: identData.riskScore,
      riskLevel: identData.riskLevel,
      summary: identData.summary,
      detectedSignals,
      psychologicalAnalysis: [],
      recommendations: identData.recommendations || [],
      isLiveAiAnalysis: identData.isLiveAiAnalysis || false,
      analysis_source: 'rules-only',
      analyzedEntities: {
        orgs: identData.claimedOrg ? [identData.claimedOrg] : [],
        urls: identData.suppliedDomain ? [identData.suppliedDomain] : [],
        phones: identData.senderPhone ? [identData.senderPhone] : [],
        upiIds: [],
      },
    };
  }
  return data as MessageAnalysisResult;
}

interface AnalysisResultsPageProps {
  result?: MessageAnalysisResult | null;
  onBackToScanner: () => void;
  onNavigate: (view: string) => void;
}

export const AnalysisResultsPage: React.FC<AnalysisResultsPageProps> = ({
  result: propResult,
  onBackToScanner,
}) => {
  const [result, setResult] = useState<MessageAnalysisResult | null>(() => normalizeToMessageAnalysisResult(propResult));

  useEffect(() => {
    if (propResult) {
      setResult(normalizeToMessageAnalysisResult(propResult));
      setFeedbackSubmitted(propResult.userFeedback || null);
    }
  }, [propResult]);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'correct' | 'false_positive' | null>(
    propResult?.userFeedback || null
  );
  const [copied, setCopied] = useState(false);

  // Challenge modal state
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [reassessmentNote, setReassessmentNote] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<
    Array<{ signal_id: string; action: 'downweighted' | 'retained' | 'dismissed'; reason: string }>
  >([]);

  // Compare modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const loadDemoScenario = () => {
    const demo = runMessageAnalysis(
      'Dear SBI User, your YONO SBI account has been suspended due to pending KYC verification. Please click here http://sbi-kyc-update.top/login immediately to update your Pan Card within 24 hours, else your account balance will be blocked.',
      'VK-SBIINB',
      '+91 89102 38471',
      'State Bank of India',
      'sms',
      'en'
    );
    setResult(demo);
  };

  if (!result) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6 text-center py-16 text-white/90">
        <div className="w-16 h-16 rounded-2xl glass border border-white/20 flex items-center justify-center mx-auto text-white">
          <FileText size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">No Active Scan Loaded</h2>
          <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
            Scan results are stored in-memory during your session and cleared upon browser reload to preserve privacy.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={onBackToScanner}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
          >
            Open Message Scanner
          </button>
          <button
            onClick={loadDemoScenario}
            className="px-5 py-2.5 rounded-xl glass hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer border border-white/20"
          >
            Load Sample Scenario (SBI KYC Phishing)
          </button>
        </div>
      </div>
    );
  }

  const handleFeedback = (type: 'correct' | 'false_positive') => {
    saveUserFeedback(result.id, type);
    setFeedbackSubmitted(type);
  };

  const handleCopyReport = () => {
    const summaryText = `[verifAI Security Report]\nSubject: ${
      result.claimedOrg || result.senderName || 'Message Scan'
    }\nRisk Level: ${result.riskLevel} (${result.riskScore}/100)\nSummary: ${
      result.summary
    }\nDetected Signals: ${result.detectedSignals.map((s) => s.name).join(', ')}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReassessed = (
    revised: BackendAnalysisResponse,
    adjList: Array<{ signal_id: string; action: 'downweighted' | 'retained' | 'dismissed'; reason: string }>,
    note: string
  ) => {
    setReassessmentNote(note);
    setAdjustments(adjList);
    setFeedbackSubmitted('false_positive');

    setResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        riskScore: revised.risk_score,
        riskLevel:
          revised.risk_tier === 'HIGH_RISK' ? 'HIGH' : revised.risk_tier === 'SUSPICIOUS' ? 'MEDIUM' : 'LOW',
        summary: revised.summary,
        backendResponse: revised,
      };
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto text-white/90">
      {/* Modals */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        messageText={result.messageText}
        channel={result.messageType === 'email' ? 'email' : 'sms'}
        language={result.language}
        sender={result.senderName || result.senderContact}
        claimedIdentity={result.claimedOrg}
      />

      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        analysisId={result.id}
        currentTier={result.riskLevel}
        currentScore={result.riskScore}
        onReassessed={handleReassessed}
      />

      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          onClick={onBackToScanner}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Scanner</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Button */}
          <button
            onClick={() => setIsCompareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass hover:bg-white/15 text-xs font-semibold text-white border border-white/20 transition-all cursor-pointer"
          >
            <SplitSquareVertical size={13} />
            <span>Compare with Keyword Filter</span>
          </button>

          {/* Challenge Assessment Button */}
          <button
            onClick={() => setIsChallengeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass hover:bg-white/15 text-xs font-semibold text-white border border-white/20 transition-all cursor-pointer"
          >
            <AlertTriangle size={13} />
            <span>Challenge Assessment</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass hover:bg-white/15 text-xs text-white border border-white/20 transition-all cursor-pointer"
          >
            {copied ? <Check size={13} className="text-white" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Notice */}
      <div className="p-3.5 glass rounded-2xl border border-white/15 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-white shrink-0" />
          <span>
            <strong className="text-white">Defensive Privacy Guarantee:</strong> Links are never opened or visited. All URL analysis is static string evaluation. Messages are processed in-memory and never stored.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-white/40">
          <span>Engine: Hybrid Rule+LLM</span>
        </div>
      </div>

      {/* Reassessment Banner (if challenged) */}
      {reassessmentNote && (
        <div className="p-5 glass-strong rounded-2xl border border-white/25 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <AlertCircle size={18} />
            <span>Reassessment Adjudication Complete</span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">{reassessmentNote}</p>

          {adjustments.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
                Signal Adjustments Made:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {adjustments.map((adj, i) => (
                  <div key={i} className="p-2.5 rounded-xl glass border border-white/15 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{adj.signal_id}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.2 rounded border text-black bg-white font-bold">
                        {adj.action}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 font-sans">{adj.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* A. Overall Risk Assessment Header Card */}
      <div className="p-6 sm:p-8 glass-strong rounded-2xl border border-white/18 flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <ScoreCircle score={result.riskScore} level={result.riskLevel} size={150} />

        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <RiskBadge level={result.riskLevel} size="lg" />
            <span className="text-xs font-mono text-white/50">
              Scanned: {new Date(result.timestamp).toLocaleDateString()}{' '}
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {result.analysis_source === 'gemini+rules' && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                AI + Rules (Gemini 3.8 Flash)
              </span>
            )}
            {result.analysis_source === 'rules-only' && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-white/80 border border-white/15">
                Deterministic Rule Engine {result.fallback_reason ? `(${result.fallback_reason})` : ''}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {result.riskLevel === 'HIGH'
              ? 'Critical Security Threat Detected'
              : result.riskLevel === 'MEDIUM'
              ? 'Suspicious Activity Detected'
              : 'Low Risk Communication Profile'}
          </h1>

          <p className="text-sm text-white/70 leading-relaxed max-w-2xl">{result.summary}</p>

          <p className="text-[11px] font-mono text-white/40">
            *Risk scores are determined by deterministic heuristic rules; the AI synthesizes human-readable explanations.
          </p>
        </div>
      </div>

      {/* Submitted Content Preview with Signal Highlighting & PII Redaction Badges */}
      <div className="p-5 glass rounded-2xl border border-white/15 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-white/40 uppercase">
          <div className="flex items-center gap-2">
            <span>Evidence Citation & Redaction Analysis</span>
            <span className="text-white font-bold">• Text Offsets Highlighted</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Channel: {result.messageType.toUpperCase()}</span>
            <span>Lang: {result.language.toUpperCase()}</span>
          </div>
        </div>

        {/* PII Redactions Notice if available */}
        {result.backendResponse?.redactions && result.backendResponse.redactions.length > 0 && (
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white font-semibold font-mono text-[11px]">Redacted PII Protected:</span>
            {result.backendResponse.redactions.map((red, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono"
              >
                {red}
              </span>
            ))}
          </div>
        )}

        {/* Message body with safe offset highlighting */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-white">
          <HighlightedMessage
            text={result.messageText}
            signals={result.backendResponse?.signals}
            redactions={result.backendResponse?.redactions}
          />
        </div>

        {(result.senderName || result.senderContact || result.claimedOrg) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 pt-1">
            {result.claimedOrg && (
              <span>
                Claimed Org: <strong className="text-white">{result.claimedOrg}</strong>
              </span>
            )}
            {result.senderName && (
              <span>
                Sender Name: <strong className="text-white">{result.senderName}</strong>
              </span>
            )}
            {result.senderContact && (
              <span>
                Contact Address: <strong className="text-white">{result.senderContact}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* B. Detected Security Signals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Detected Security Signals ({result.detectedSignals.length})
          </h2>
          <span className="text-xs text-white/40 font-mono">Deterministic Heuristic Rules (Source of Truth)</span>
        </div>

        {result.detectedSignals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.detectedSignals.map((signal) => (
              <div
                key={signal.id}
                className="p-5 rounded-2xl glass border border-white/15 hover:border-white/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-sm">{signal.name}</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border text-black bg-white font-bold">
                    {signal.severity}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white">
                  <span className="text-white/40 text-[10px] uppercase block mb-0.5">Observed Evidence:</span>
                  {signal.evidence}
                </div>

                <div className="text-xs text-white/60 space-y-1">
                  <span className="text-white font-medium block">Why this matters:</span>
                  <p className="leading-relaxed">{signal.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 glass rounded-2xl border border-white/10 text-center text-xs text-white/50">
            No active threat signals detected in this communication.
          </div>
        )}
      </div>

      {/* C. Safe Signals Found */}
      {result.backendResponse?.safe_signals && result.backendResponse.safe_signals.length > 0 && (
        <div className="p-4 rounded-2xl glass border border-white/20 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <ShieldCheck size={16} />
            <span>Legitimate & Defensive Attributes Verified:</span>
          </div>
          <ul className="list-disc list-inside text-xs text-white/70 space-y-1 font-mono">
            {result.backendResponse.safe_signals.map((sig, i) => (
              <li key={i}>{sig}</li>
            ))}
          </ul>
        </div>
      )}

      {/* D. Safe Verification Recommendations */}
      <div className="p-6 glass-strong rounded-2xl border border-white/18 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-white" />
          <h2 className="text-base font-bold text-white">
            Practical Defensive Steps (Safe Verification Through Known Channels)
          </h2>
        </div>

        <div className="space-y-3">
          {(result.riskLevel === 'HIGH' || result.riskLevel === 'MEDIUM') && (
            <div className="p-4 rounded-2xl glass border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ExternalLink size={18} className="text-white shrink-0" />
                <div>
                  <p className="font-semibold text-white">Report Financial Cyber Fraud / Incident</p>
                  <p className="text-white/60 text-[11px]">
                    File an official complaint on the Government of India Cyber Crime Reporting Portal or call National Cyber Helpline 1930.
                  </p>
                </div>
              </div>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <span>Visit cybercrime.gov.in</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {result.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl glass border border-white/15 text-xs"
            >
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-white">{rec.action}</p>
                <p className="text-white/60 leading-relaxed text-[11px]">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* E. User Feedback Section with Challenge Trigger */}
      <div className="p-6 glass-strong rounded-2xl border border-white/18 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Was this security assessment helpful?</h3>
          <p className="text-xs text-white/50">
            Contest false positives or verify correct alerts to refine our defensive models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {feedbackSubmitted ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-white bg-white/10 px-4 py-2 rounded-xl border border-white/20 font-mono">
              <CheckCircle2 size={15} />
              <span>
                {feedbackSubmitted === 'correct'
                  ? 'Thank you! Confirmed correct warning.'
                  : 'Assessment challenged: Feedback logged and model updated.'}
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleFeedback('correct')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all cursor-pointer"
              >
                <ThumbsUp size={14} />
                <span>This warning is correct</span>
              </button>
              <button
                onClick={() => setIsChallengeOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all cursor-pointer"
              >
                <ThumbsDown size={14} />
                <span>This looks wrong (Challenge)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
