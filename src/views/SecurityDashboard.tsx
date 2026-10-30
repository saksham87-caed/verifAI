import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  Filter,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Languages,
  CheckCircle2,
  RefreshCw,
  Activity,
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
    // Poll every 30 seconds
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

  // Real top signals from backend or local scans, never fabricated numbers
  const topSignals = backendStats?.top_signals || [];

  // Curated National Cyber Advisories (Clearly labeled as educational guidance)
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Real-time Telemetry & Privacy Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-cyan-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Defensive Cybersecurity Operations:</strong> Real-time anonymized telemetry across SMS and Email vectors. All links are analyzed statically. Messages are not retained.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {connectionStatus === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Backend API: {llmConfigured ? 'Connected (Gemini + Rules)' : 'Connected (Rules-Only)'}
            </span>
          ) : connectionStatus === 'checking' ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
              <RefreshCw size={11} className="animate-spin text-amber-400" />
              Checking API...
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Backend API: Offline
              </span>
              <button
                onClick={checkStatus}
                className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
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
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time threat monitoring, risk distribution, multilingual telemetry, and detected social engineering patterns.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20 cursor-pointer"
        >
          <Sparkles size={14} />
          <span>Analyse New Message</span>
        </button>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Message Scanner Count */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Message Scans</span>
            <FileText size={15} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {scans.filter((s) => s.type === 'sms' || s.type === 'email' || s.type === 'whatsapp' || s.type === 'other').length}
          </p>
          <p className="text-[10px] text-slate-400">SMS, Email & WhatsApp</p>
        </div>

        {/* Link Inspector Count */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Link Inspections</span>
            <FileText size={15} className="text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {scans.filter((s) => s.type === 'url').length}
          </p>
          <p className="text-[10px] text-slate-400">Untrusted URLs checked</p>
        </div>

        {/* Identity Trust Count */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Identity Checks</span>
            <FileText size={15} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {scans.filter((s) => s.type === 'identity').length}
          </p>
          <p className="text-[10px] text-slate-400">Sender & org provenance</p>
        </div>

        {/* High-Risk Detected */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-rose-900/30 space-y-2">
          <div className="flex items-center justify-between text-rose-400 text-xs">
            <span>High-Risk</span>
            <ShieldAlert size={15} className="text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400 font-mono tabular-nums">
            {highRiskCount}
          </p>
          <p className="text-[10px] text-rose-300/70 font-mono">
            {highPercent}% of total
          </p>
        </div>

        {/* Medium-Risk Detected */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-amber-900/30 space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span>Suspicious</span>
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
            {mediumRiskCount}
          </p>
          <p className="text-[10px] text-amber-300/70 font-mono">
            {mediumPercent}% of total
          </p>
        </div>

        {/* Low-Risk Verified */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-emerald-900/30 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span>Safe / Low</span>
            <ShieldCheck size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {lowRiskCount}
          </p>
          <p className="text-[10px] text-emerald-300/70 font-mono">
            {lowPercent}% of total
          </p>
        </div>
      </div>

      {/* Middle Section: Risk Distribution Chart + Top Forensic Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Distribution Chart (Left 5 cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-900/90 rounded-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Risk Distribution</h2>
              <p className="text-xs text-slate-400">Proportional threat breakdown</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Deterministic Rules
            </span>
          </div>

          {/* Visual Bar Stack Breakdown */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${highPercent}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`High Risk: ${highPercent}%`}
              />
              <div
                style={{ width: `${mediumPercent}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Medium Risk: ${mediumPercent}%`}
              />
              <div
                style={{ width: `${lowPercent}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Low Risk: ${lowPercent}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40">
                <span className="text-[10px] uppercase font-mono text-rose-300 block">High Risk</span>
                <span className="text-lg font-bold text-rose-400 font-mono tabular-nums">{highPercent}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40">
                <span className="text-[10px] uppercase font-mono text-amber-300 block">Suspicious</span>
                <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">{mediumPercent}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
                <span className="text-[10px] uppercase font-mono text-emerald-300 block">Safe</span>
                <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">{lowPercent}%</span>
              </div>
            </div>
          </div>

          {/* Official Government of India Cybercrime Portal Banner */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/60 to-slate-950/80 border border-cyan-800/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-[11px] uppercase">
              <ShieldCheck size={14} />
              <span>Report Cyber Crime — Government of India</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Visit the official National Cyber Crime Reporting Portal to report cybercrime incidents.
            </p>
            <div className="pt-1">
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <span>Visit cybercrime.gov.in</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Adjudication Feedback Stats */}
          {backendStats && (
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">User Challenges Logged:</span>
              <span className="text-cyan-300 font-bold">
                {backendStats.feedback_counts.false_positive} FP / {backendStats.feedback_counts.correct} Verified
              </span>
            </div>
          )}
        </div>

        {/* Commonly Detected Scam Techniques & Top Signals (Right 7 cols) */}
        <div className="lg:col-span-7 p-6 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Top Forensic Security Signals
              </h2>
              <p className="text-xs text-slate-400">
                Deterministic detection vectors identifying active deception and credential theft
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topSignals.length > 0 ? (
              topSignals.map((sig, i) => (
                <div
                  key={sig.id || i}
                  className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{sig.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-800/40">
                        {sig.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-cyan-400 font-bold">{sig.count}</span>
                    <span className="text-[10px] text-slate-400">occurrences</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-lg bg-slate-950/40 border border-slate-800/60 text-center space-y-2">
                <FileText size={24} className="text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">No signals recorded in live telemetry yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
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
        <div className="lg:col-span-8 p-6 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Scan Activity</h2>
              <p className="text-xs text-slate-400">Last processed security assessments</p>
            </div>
            <button
              onClick={() => onNavigate('scan-history')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full History</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target Subject</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {scans.slice(0, 5).map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono uppercase text-[11px] text-slate-400">
                      {scan.type}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-200 line-clamp-1">{scan.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{scan.preview}</p>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={scan.riskLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={
                        scan.riskLevel === 'HIGH' ? 'text-rose-400' :
                        scan.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        {scan.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('analysis-results', scan.data)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer whitespace-nowrap"
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
        <div className="lg:col-span-4 p-6 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Live Threat Alerts</h2>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            {securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{alert.date}</span>
                  <RiskBadge level={alert.severity} size="sm" />
                </div>
                <h3 className="font-semibold text-slate-200 leading-snug">{alert.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {alert.summary}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('awareness-centre')}
              className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors text-center cursor-pointer"
            >
              Explore Awareness Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
