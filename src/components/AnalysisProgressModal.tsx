import React from 'react';
import { ScanStage, SCAN_STAGES } from '../services/apiService';
import { Shield, Check, Loader2 } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  currentStage: ScanStage | null;
  progressPercent: number;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  currentStage,
  progressPercent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                TrustLens Security Inspection
              </h3>
              <p className="text-xs text-slate-400">
                Forensic signal analysis & threat modeling in progress
              </p>
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/50">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 5-Stage Checklist */}
        <div className="space-y-3">
          {SCAN_STAGES.map((stage) => {
            const isCompleted = currentStage && currentStage.stageNumber > stage.stageNumber;
            const isCurrent = currentStage && currentStage.stageNumber === stage.stageNumber;
            const isPending = !isCompleted && !isCurrent;

            return (
              <div
                key={stage.stageNumber}
                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all text-sm ${
                  isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-100'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    : 'bg-transparent border-transparent text-slate-500 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Loader2 size={13} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                      {stage.stageNumber}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${isCurrent ? 'text-cyan-300' : ''}`}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-slate-400 mt-0.5 animate-fadeIn">
                      {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 text-center font-mono">
          Defensive Sandbox · Safe Content Inspection · Non-Executing Engine
        </p>
      </div>
    </div>
  );
};
