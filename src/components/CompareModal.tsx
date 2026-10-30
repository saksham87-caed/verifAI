import React, { useEffect, useState } from 'react';
import { X, Sparkles, Filter, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BackendCompareResponse } from '../types/security';
import { compareWithNaiveBaseline } from '../services/apiService';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  channel?: 'email' | 'sms' | 'auto';
  language?: 'en' | 'hi' | 'kn' | 'auto';
  sender?: string;
  claimedIdentity?: string;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  messageText,
  channel = 'auto',
  language = 'auto',
  sender,
  claimedIdentity,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BackendCompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !messageText) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    compareWithNaiveBaseline(messageText, channel, language, sender, claimedIdentity)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to compare');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, messageText, channel, language, sender, claimedIdentity]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Engine Comparison: Naive Filter vs TrustLens AI
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating the exact same input through static keyword matching vs forensic contextual analysis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Message snippet preview */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">Target Message for Evaluation:</span>
            <p className="line-clamp-2 italic">"{messageText}"</p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Running side-by-side benchmark evaluation...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-300 text-xs">
              Error evaluating comparison: {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Dual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Naive Keyword Filter */}
                <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-slate-400" />
                      <span className="font-bold text-slate-200 text-sm">Naive Keyword Baseline</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        data.naive_baseline.tier === 'HIGH_RISK'
                          ? 'text-rose-400 border-rose-800 bg-rose-950/40'
                          : 'text-emerald-400 border-emerald-800 bg-emerald-950/40'
                      }`}
                    >
                      {data.naive_baseline.tier}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Trigger Status:</span>
                      <strong className={data.naive_baseline.flagged ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                        {data.naive_baseline.flagged ? 'FLAGGED AS THREAT' : 'NOT FLAGGED (SAFE)'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block mb-1">Keywords Triggered:</span>
                      {data.naive_baseline.flagged_keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.naive_baseline.flagged_keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-rose-900/30 border border-rose-800 text-rose-300 font-mono text-[11px]"
                            >
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">No naive keywords matched</span>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-amber-400 block">Baseline Flaw:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{data.naive_baseline.flaw}</p>
                    </div>
                  </div>
                </div>

                {/* 2. TrustLens AI */}
                <div className="p-5 rounded-xl bg-slate-950/80 border border-cyan-800/40 space-y-4 shadow-lg shadow-cyan-950/20">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-cyan-400" />
                      <span className="font-bold text-white text-sm">TrustLens AI</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        data.trustlens.risk_tier === 'HIGH_RISK'
                          ? 'text-rose-400 border-rose-800 bg-rose-950/40'
                          : data.trustlens.risk_tier === 'SUSPICIOUS'
                          ? 'text-amber-400 border-amber-800 bg-amber-950/40'
                          : 'text-emerald-400 border-emerald-800 bg-emerald-950/40'
                      }`}
                    >
                      {data.trustlens.risk_tier} ({data.trustlens.risk_score}/100)
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Forensic Signals Found:</span>
                      <strong className="text-cyan-400 font-mono">{data.trustlens.signals_count} signals</strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block mb-1">Key Signals Identified:</span>
                      {data.trustlens.top_signals.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.trustlens.top_signals.map((sig, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/50 text-cyan-300 font-mono text-[11px]"
                            >
                              {sig}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-400 font-mono text-[11px]">No threat signals detected</span>
                      )}
                    </div>

                    <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-800/40 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-cyan-400 block">TrustLens Advantage:</span>
                      <p className="text-slate-200 text-[11px] leading-relaxed">{data.trustlens.advantage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Insight Banner */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-200 block">Comparative Analysis Insight:</span>
                  <p className="text-slate-400 leading-relaxed">{data.comparison_insight}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Privacy Guarantee: Links are never opened. Messages are not stored.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
