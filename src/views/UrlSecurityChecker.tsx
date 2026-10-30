import React, { useState } from 'react';
import {
  Link2,
  ShieldAlert,
  Search,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { UrlAnalysisResult, RiskLevel } from '../types/security';
import { inspectUrlWithInspection } from '../services/apiService';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreCircle } from '../components/ScoreCircle';

interface UrlSecurityCheckerProps {
  onScanComplete?: (result: UrlAnalysisResult) => void;
}

const SAMPLE_URLS = [
  {
    label: 'Fake SBI KYC Domain',
    url: 'http://sbi-kyc-update.top/login-portal',
    risk: 'HIGH' as RiskLevel,
    note: 'Deceptive brand impersonation on disposable .top TLD',
  },
  {
    label: 'Raw IP Bank Login',
    url: 'http://192.168.1.102/bank-login',
    risk: 'HIGH' as RiskLevel,
    note: 'Raw numerical IP address masquerading as a portal',
  },
  {
    label: 'Masked Bitly Shortener',
    url: 'https://bit.ly/free-recharge-reward-claim',
    risk: 'HIGH' as RiskLevel,
    note: 'Shortened URL hiding downstream destination payload',
  },
  {
    label: 'Stacked Subdomains',
    url: 'https://support-hdfc.net.verify-session.org/auth',
    risk: 'HIGH' as RiskLevel,
    note: 'Multi-level nested subdomains misleading mobile viewers',
  },
  {
    label: 'Official SBI Domain (Legitimate)',
    url: 'https://www.onlinesbi.sbi/portal',
    risk: 'LOW' as RiskLevel,
    note: 'Official banking domain matching registered .sbi institutional TLD',
  },
];

export const UrlSecurityChecker: React.FC<UrlSecurityCheckerProps> = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setUrlInput('');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please provide a URL or web address to inspect.');
      return;
    }

    setError(null);
    setIsInspecting(true);

    try {
      const res = await inspectUrlWithInspection(urlInput, (_pct, msg) => {
        setProgressMsg(msg);
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to evaluate URL. Please check formatting.');
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title & Mission */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
          <Link2 size={14} />
          <span>Non-Executing Link Sandbox</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Suspicious Link Inspector
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Investigate suspicious links before you visit them. Untrusted text analysis parses hostnames, TLD abuse, IP-based routing, and typosquatting without executing remote code.
        </p>
      </div>

      {/* Safety Policy Alert */}
      <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/40 rounded-xl text-xs text-cyan-300 flex items-start gap-2.5">
        <Shield size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Static-Only Defensive Policy:</p>
          <p className="text-[11px] text-cyan-200/90 leading-relaxed">
            Static analysis of the link text. No page is visited. No DNS, WHOIS or reputation lookup is performed. TrustLens treats all URLs strictly as untrusted text.
          </p>
        </div>
      </div>

      {/* Demonstration URL Test Buttons */}
      <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Demonstration Test URLs:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_URLS.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setUrlInput(sample.url);
                setError(null);
              }}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-left cursor-pointer"
            >
              <span className="font-semibold text-cyan-300">{sample.label}</span>
              <span className="text-[11px] text-slate-400 block font-mono truncate max-w-[280px]">
                {sample.url}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="url-input" className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Untrusted URL / Web Link
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. http://sbi-kyc-update.top/login or https://bit.ly/cash-reward"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isInspecting}
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-sm shadow-cyan-500/20 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {isInspecting ? 'Inspecting...' : 'Analyse URL'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Inspecting state */}
      {isInspecting && (
        <div className="p-6 bg-slate-900 border border-cyan-500/30 rounded-xl text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-200 font-mono">
            {progressMsg || 'Evaluating link structure...'}
          </p>
          <p className="text-xs text-slate-400">
            Evaluating static URL tokens, TLD reputation, homoglyphs & syntax anomalies (no network calls)
          </p>
        </div>
      )}

      {/* Detailed Analysis Result Display */}
      {result && !isInspecting && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          {/* Top Score Banner */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
            <ScoreCircle score={result.riskScore} level={result.riskLevel} />
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <RiskBadge level={result.riskLevel} size="lg" />
                <span className="text-xs font-mono text-slate-400">
                  Domain: <strong className="text-slate-200 font-mono">{result.domain}</strong>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  Static String Rules (Zero-Fetch)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {result.riskLevel === 'HIGH'
                  ? 'Dangerous / Unsafe Web Destination'
                  : result.riskLevel === 'MEDIUM'
                  ? 'Suspicious URL Structure - Exercise Caution'
                  : 'Domain Structure Appears Standard'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* 7 Inspection Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              7-Point Forensic Inspection Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.categories).map(([key, category]) => {
                const isBad = category.status === 'dangerous';
                const isWarning = category.status === 'suspicious';
                const isSafe = category.status === 'safe';

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border space-y-2 text-xs transition-colors ${
                      isBad
                        ? 'bg-rose-950/20 border-rose-900/50'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-900/50'
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-sm">
                        {category.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          isBad
                            ? 'text-rose-400 border-rose-800 bg-rose-950/40'
                            : isWarning
                            ? 'text-amber-400 border-amber-800 bg-amber-950/40'
                            : 'text-emerald-400 border-emerald-800 bg-emerald-950/40'
                        }`}
                      >
                        {category.status}
                      </span>
                    </div>

                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {category.detail}
                    </p>

                    {category.evidence && (
                      <div className="pt-1 text-[11px] font-mono text-cyan-300">
                        Evidence: {category.evidence}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Recommendations */}
          <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Safe Handling Recommendations
            </h4>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">{rec.action}: </span>
                    <span className="text-slate-400">{rec.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
