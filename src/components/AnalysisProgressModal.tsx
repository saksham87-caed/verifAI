import React from 'react';
import { ScanStage, SCAN_STAGES } from '../services/apiService';
import { Check, Loader2 } from 'lucide-react';
import { Logo } from './Logo';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg p-6 glass-strong border border-white/18 rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Logo size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                verifAI Security Inspection
              </h3>
              <p className="text-xs text-white/50">
                Forensic signal analysis & threat modeling in progress
              </p>
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums text-white font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-white h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 5-Stage Checklist */}
        <div className="space-y-2.5">
          {SCAN_STAGES.map((stage) => {
            const isCompleted = currentStage && currentStage.stageNumber > stage.stageNumber;
            const isCurrent = currentStage && currentStage.stageNumber === stage.stageNumber;

            return (
              <div
                key={stage.stageNumber}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-sm ${
                  isCurrent
                    ? 'bg-white/15 border-white/30 text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
                    : isCompleted
                    ? 'bg-white/5 border-white/10 text-white/80'
                    : 'bg-transparent border-transparent text-white/40 opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center">
                      <Loader2 size={13} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-mono text-white/40">
                      {stage.stageNumber}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${isCurrent ? 'text-white' : ''}`}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-white/60 mt-0.5">
                      {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-white/40 text-center font-mono">
          Defensive Sandbox · Safe Content Inspection · Non-Executing Engine
        </p>
      </div>
    </div>
  );
};
