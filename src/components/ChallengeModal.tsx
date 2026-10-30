import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { submitChallengeFeedback } from '../services/apiService';
import { BackendAnalysisResponse } from '../types/security';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  currentTier: string;
  currentScore: number;
  onReassessed: (
    revisedResult: BackendAnalysisResponse,
    adjustments: Array<{ signal_id: string; action: 'downweighted' | 'retained' | 'dismissed'; reason: string }>,
    note: string
  ) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  currentTier,
  currentScore,
  onReassessed,
}) => {
  const [verdict, setVerdict] = useState<'false_positive' | 'false_negative'>('false_positive');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitChallengeFeedback(analysisId, verdict, reason);
      if (response.success && response.revised_result) {
        onReassessed(response.revised_result, response.adjustments || [], response.note || '');
        onClose();
      } else {
        throw new Error('Server could not process reassessment.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Challenge Security Assessment
              </h2>
              <p className="text-xs text-slate-400">
                Current rating: <span className="font-mono text-cyan-400">{currentTier} ({currentScore}/100)</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              What looks incorrect about this assessment?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVerdict('false_positive')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  verdict === 'false_positive'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <strong className="block text-slate-100 mb-0.5">False Positive</strong>
                <span>This message is legitimate or from a trusted contact/service.</span>
              </button>

              <button
                type="button"
                onClick={() => setVerdict('false_negative')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  verdict === 'false_negative'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <strong className="block text-slate-100 mb-0.5">Under-Flagged</strong>
                <span>This is actually harmful or deceptive and scored too low.</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Reason / Context (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. This is a verified internal message from our IT helpdesk, or I initiated this transaction myself..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              Note: The adjudication engine will downweight benign urgency or conversational signals, but retains critical credential and financial theft rules for defensive safety.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Reassessing...</span>
                </>
              ) : (
                <>
                  <span>Submit Challenge & Reassess</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
