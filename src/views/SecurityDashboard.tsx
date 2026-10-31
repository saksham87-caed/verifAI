import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { historyManager } from '../services/securityEngine';
import { ScanHistoryItem, RiskLevel, BackendStatsResponse } from '../types/security';
import { fetchBackendStats, fetchHealth } from '../services/apiService';

interface SecurityDashboardProps {
  onNavigate: (view: string, scanData?: any) => void;
  onOpenScanner: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  onNavigate,
  onOpenScanner,
}) => {
  const [scans, setScans] = useState<ScanHistoryItem[]>(() => historyManager.getScans());
  const [backendStats, setBackendStats] = useState<BackendStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'offline'>('checking');
  const [llmConfigured, setLlmConfigured] = useState(false);

  const checkStatus = () => {
    setConnectionStatus('checking');
    fetchHealth()
      .then((res) => {
        if (res.status === 'ok') {
          setConnectionStatus('connected');
          setLlmConfigured(res.llm_configured);
        } else {
          setConnectionStatus('offline');
        }
      })
      .catch(() => setConnectionStatus('offline'));
  };

  const loadStats = () => {
    setIsLoadingStats(true);
    fetchBackendStats()
      .then((data) => {
        if (data) setBackendStats(data);
      })
      .finally(() => setIsLoadingStats(false));
  };

  useEffect(() => {
    checkStatus();
    loadStats();
    const interval = setInterval(() => {
      checkStatus();
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics using local history to ensure all scan types are included
  const totalScans = scans.length;
  const highRiskCount = scans.filter((s) => s.riskLevel === 'HIGH').length;
  const mediumRiskCount = scans.filter((s) => s.riskLevel === 'MEDIUM').length;
  const lowRiskCount = scans.filter((s) => s.riskLevel === 'LOW').length;

  const highPercent = totalScans ? Math.round((highRiskCount / totalScans) * 100) : 0;
  const mediumPercent = totalScans ? Math.round((mediumRiskCount / totalScans) * 100) : 0;
  const lowPercent = totalScans ? Math.round((lowRiskCount / totalScans) * 100) : 0;

  const topSignals = backendStats?.top_signals || [];

  const securityAlerts = [
    {
      id: 'alert-1',
      date: 'Active Advisory',
      title: 'Surge in Fake India Post "Address Update" Smishing',
      severity: 'HIGH' as RiskLevel,
      summary: 'Advisory: Fraudsters send SMS with links to lookalike domains requesting a minor re-delivery fee to harvest credit/debit card numbers.',
    },
    {
      id: 'alert-2',
      date: 'Active Advisory',
      title: 'Deceptive "Digital Arrest" Video Calls Impersonating Law Enforcement',
      severity: 'HIGH' as RiskLevel,
      summary: 'Advisory: Beware of callers claiming airport parcel seizures and demanding instant RTGS transfers. Indian authorities never conduct video arrests.',
    },
    {
      id: 'alert-3',
      date: 'Active Advisory',
      title: 'Electricity Disconnection SMS Demanding Personal Calls',
      severity: 'MEDIUM' as RiskLevel,
      summary: 'Advisory: Messages claiming power disconnection at 9:30 PM asking you to call personal numbers are fraudulent phishing traps.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-white/90">
      {/* Top Banner: Real-time Telemetry & Privacy Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 glass border border-white/15 rounded-2xl text-xs text-white/70">
        <div className="flex items-center gap-2.5">
          <Info size={16} className="text-white shrink-0" />
          <span>
            <strong className="text-white">Defensive Cybersecurity Operations:</strong> Real-time anonymized telemetry across SMS and Email vectors. All links are analyzed statically. Messages are not retained.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {connectionStatus === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Backend API: {llmConfigured ? 'Connected (Gemini + Rules)' : 'Connected (Rules-Only)'}
            </span>
          ) : connectionStatus === 'checking' ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/15">
              <RefreshCw size={11} className="animate-spin text-white" />
              Checking API...
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Backend API: Offline
              </span>
              <button
                onClick={checkStatus}
                className="px-2.5 py-0.5 text-[10px] rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header with Title & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Real-time threat monitoring, risk distribution, multilingual telemetry, and detected social engineering patterns.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-white/90 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap cursor-pointer active:scale-95"
        >
          <Sparkles size={14} />
          <span>Analyse New Message</span>
        </button>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Message Scanner Count */}
        <div className="p-4 glass rounded-2xl border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Message Scans</span>
            <FileText size={15} className="text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {scans.filter((s) => s.type === 'sms' || s.type === 'email' || s.type === 'whatsapp' || s.type === 'other').length}
          </p>
          <p className="text-[10px] text-white/40">SMS, Email & WhatsApp</p>
        </div>

        {/* Link Inspector Count */}
        <div className="p-4 glass rounded-2xl border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Link Inspections</span>
            <FileText size={15} className="text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {scans.filter((s) => s.type === 'url').length}
          </p>
          <p className="text-[10px] text-white/40">Untrusted URLs checked</p>
        </div>

        {/* Identity Trust Count */}
        <div className="p-4 glass rounded-2xl border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Identity Checks</span>
            <FileText size={15} className="text-white" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {scans.filter((s) => s.type === 'identity').length}
          </p>
          <p className="text-[10px] text-white/40">Sender & org provenance</p>
        </div>

        {/* High-Risk Detected */}
        <div className="p-4 glass rounded-2xl border border-rose-500/50 space-y-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <div className="flex items-center justify-between text-rose-500 text-xs font-semibold">
            <span>High-Risk</span>
            <ShieldAlert size={15} className="text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-500 font-mono tabular-nums">
            {highRiskCount}
          </p>
          <p className="text-[10px] text-rose-500/60 font-mono">
            {highPercent}% of total
          </p>
        </div>

        {/* Medium-Risk Detected */}
        <div className="p-4 glass rounded-2xl border border-amber-500/50 space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-center justify-between text-amber-500 text-xs font-semibold">
            <span>Suspicious</span>
            <AlertTriangle size={15} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-500 font-mono tabular-nums">
            {mediumRiskCount}
          </p>
          <p className="text-[10px] text-amber-500/60 font-mono">
            {mediumPercent}% of total
          </p>
        </div>

        {/* Low-Risk Verified */}
        <div className="p-4 glass rounded-2xl border border-emerald-500/50 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between text-emerald-500 text-xs font-semibold">
            <span>Safe / Low</span>
            <ShieldCheck size={15} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-500 font-mono tabular-nums">
            {lowRiskCount}
          </p>
          <p className="text-[10px] text-emerald-500/60 font-mono">
            {lowPercent}% of total
          </p>
        </div>
      </div>

      {/* Middle Section: Risk Distribution Chart + Top Forensic Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Distribution Chart (Left 5 cols) */}
        <div className="lg:col-span-5 p-6 glass-strong rounded-2xl border border-white/18 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Risk Distribution</h2>
              <p className="text-xs text-white/50">Proportional threat breakdown</p>
            </div>
            <span className="text-xs font-mono text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              Deterministic Rules
            </span>
          </div>

          {/* Visual Bar Stack Breakdown */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex p-0.5 border border-white/10">
              <div
                style={{ width: `${highPercent}%` }}
                className="bg-rose-500 h-full rounded-l-full transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                title={`High Risk: ${highPercent}%`}
              />
              <div
                style={{ width: `${mediumPercent}%` }}
                className="bg-amber-500 h-full transition-all duration-500 border-l border-r border-black/20"
                title={`Medium Risk: ${mediumPercent}%`}
              />
              <div
                style={{ width: `${lowPercent}%` }}
                className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                title={`Low Risk: ${lowPercent}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] uppercase font-mono text-rose-500 block">High Risk</span>
                <span className="text-lg font-bold text-rose-500 font-mono tabular-nums">{highPercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] uppercase font-mono text-amber-500 block">Suspicious</span>
                <span className="text-lg font-bold text-amber-500 font-mono tabular-nums">{mediumPercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] uppercase font-mono text-emerald-500 block">Safe</span>
                <span className="text-lg font-bold text-emerald-500 font-mono tabular-nums">{lowPercent}%</span>
              </div>
            </div>
          </div>

          {/* Official Government of India Cybercrime Portal Banner */}
          <div className="p-4 glass rounded-xl border border-white/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold font-mono text-[11px] uppercase">
              <ShieldCheck size={14} />
              <span>Report Cyber Crime — Government of India</span>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              Visit the official National Cyber Crime Reporting Portal to report cybercrime incidents.
            </p>
            <div className="pt-1">
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-colors cursor-pointer"
              >
                <span>Visit cybercrime.gov.in</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Adjudication Feedback Stats */}
          {backendStats && (
            <div className="p-3 glass rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">User Challenges Logged:</span>
              <span className="text-white font-bold">
                {backendStats.feedback_counts.false_positive} FP / {backendStats.feedback_counts.correct} Verified
              </span>
            </div>
          )}
        </div>

        {/* Commonly Detected Scam Techniques & Top Signals (Right 7 cols) */}
        <div className="lg:col-span-7 p-6 glass-strong rounded-2xl border border-white/18 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Top Forensic Security Signals
              </h2>
              <p className="text-xs text-white/50">
                Deterministic detection vectors identifying active deception and credential theft
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topSignals.length > 0 ? (
              topSignals.map((sig, i) => (
                <div
                  key={sig.id || i}
                  className="p-3.5 rounded-xl glass border border-white/15 hover:border-white/30 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{sig.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/20">
                        {sig.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-white font-bold">{sig.count}</span>
                    <span className="text-[10px] text-white/40">occurrences</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl glass border border-white/10 text-center space-y-2">
                <FileText size={24} className="text-white/30 mx-auto" />
                <p className="text-xs text-white/80 font-medium">No signals recorded in live telemetry yet</p>
                <p className="text-[11px] text-white/50 max-w-sm mx-auto">
                  Analyze messages via the Scanner to populate aggregated signal distribution in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Scan Activity + Recent Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Scan Activity (8 cols) */}
        <div className="lg:col-span-8 p-6 glass-strong rounded-2xl border border-white/18 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Scan Activity</h2>
              <p className="text-xs text-white/50">Last processed security assessments</p>
            </div>
            <button
              onClick={() => onNavigate('scan-history')}
              className="text-xs font-semibold text-white hover:text-white/80 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full History</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-white/40">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target Subject</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-sans">
                {scans.slice(0, 5).map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono uppercase text-[11px] text-white/50">
                      {scan.type}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-white line-clamp-1">{scan.title}</p>
                      <p className="text-[11px] text-white/50 line-clamp-1">{scan.preview}</p>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={scan.riskLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                      <span className="text-white">
                        {scan.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('analysis-results', scan.data)}
                        className="text-white hover:underline font-semibold cursor-pointer whitespace-nowrap"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Security Alerts (4 cols) */}
        <div className="lg:col-span-4 p-6 glass-strong rounded-2xl border border-white/18 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Live Threat Alerts</h2>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>

          <div className="space-y-3">
            {securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl glass border border-white/15 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>{alert.date}</span>
                  <RiskBadge level={alert.severity} size="sm" />
                </div>
                <h3 className="font-semibold text-white leading-snug">{alert.title}</h3>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  {alert.summary}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('awareness-centre')}
              className="w-full py-2.5 px-3 rounded-xl glass hover:bg-white/15 text-xs font-semibold text-white transition-all text-center cursor-pointer border border-white/15"
            >
              Explore Awareness Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
