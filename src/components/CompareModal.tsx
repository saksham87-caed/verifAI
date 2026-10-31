import React, { useEffect, useState } from 'react';
import { X, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl glass-strong border border-white/18 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Engine Comparison: Naive Filter vs verifAI
              </h2>
              <p className="text-xs text-white/50">
                Evaluating the exact same input through static keyword matching vs forensic contextual analysis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Message snippet preview */}
          <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-mono text-white/80">
            <span className="text-[10px] text-white/40 uppercase block mb-1">Target Message for Evaluation:</span>
            <p className="line-clamp-2 italic">"{messageText}"</p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-white/50 font-mono">Running side-by-side benchmark evaluation...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-white/10 border border-white/20 rounded-xl text-white text-xs">
              Error evaluating comparison: {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Dual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Naive Keyword Filter */}
                <div className="p-5 rounded-2xl glass border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-white/50" />
                      <span className="font-bold text-white text-sm">Naive Keyword Baseline</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border text-white/70 border-white/20 bg-white/5">
                      {data.naive_baseline.tier}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-white/60">
                      <span>Trigger Status:</span>
                      <strong className="text-white font-mono">
                        {data.naive_baseline.flagged ? 'FLAGGED AS THREAT' : 'NOT FLAGGED (SAFE)'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-white/40 uppercase block mb-1">Keywords Triggered:</span>
                      {data.naive_baseline.flagged_keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.naive_baseline.flagged_keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white font-mono text-[11px]"
                            >
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/40 font-mono text-[11px]">No naive keywords matched</span>
                      )}
                    </div>

                    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-white/60 block font-semibold">Baseline Flaw:</span>
                      <p className="text-white/75 text-[11px] leading-relaxed">{data.naive_baseline.flaw}</p>
                    </div>
                  </div>
                </div>

                {/* 2. verifAI */}
                <div className="p-5 rounded-2xl glass border border-white/25 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-white" />
                      <span className="font-bold text-white text-sm">verifAI</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md border text-black bg-white font-bold">
                      {data.trustlens.risk_tier} ({data.trustlens.risk_score}/100)
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-white/60">
                      <span>Forensic Signals Found:</span>
                      <strong className="text-white font-mono">{data.trustlens.signals_count} signals</strong>
                    </div>

                    <div>
                      <span className="text-[11px] text-white/40 uppercase block mb-1">Key Signals Identified:</span>
                      {data.trustlens.top_signals.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.trustlens.top_signals.map((sig, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white/15 border border-white/30 text-white font-mono text-[11px]"
                            >
                              {sig}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/60 font-mono text-[11px]">No threat signals detected</span>
                      )}
                    </div>

                    <div className="p-3 bg-white/10 rounded-xl border border-white/20 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-white block font-bold">verifAI Advantage:</span>
                      <p className="text-white/85 text-[11px] leading-relaxed">{data.trustlens.advantage}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Insight Banner */}
              <div className="p-4 glass rounded-xl border border-white/15 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-white block">Comparative Analysis Insight:</span>
                  <p className="text-white/70 leading-relaxed">{data.comparison_insight}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 glass rounded-none border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span className="font-mono text-[11px]">
            Privacy Guarantee: Links are never opened. Messages are not stored.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all cursor-pointer border border-white/15"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
