import React, { useState } from 'react';
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  Globe,
  FileQuestion,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Shield,
  Sparkles,
  Info,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { IdentityAssessmentResult } from '../types/security';
import { assessIdentityWithVerification } from '../services/apiService';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreCircle } from '../components/ScoreCircle';

const SAMPLE_PROFILES = [
  {
    label: 'Airtel Impersonation (Free Gmail)',
    org: 'Bharti Airtel Customer Support',
    email: 'airtel-5g-upgrade@gmail.com',
    phone: '+91 98451 90812',
    domain: 'airtel-5g-kyc.xyz',
    notes: 'Caller claims SIM will be blocked unless Aadhaar verification is completed immediately.',
  },
  {
    label: 'SBI Fraud Cell Spoof',
    org: 'State Bank of India',
    email: 'fraud-alert@sbi-security-dept.in',
    phone: '+91 88921 77210',
    domain: 'sbi-card-kyc-verification.top',
    notes: 'Sender claims urgent payment fraud on credit card and demands confirmation.',
  },
  {
    label: 'Known HDFC Bank Pattern',
    org: 'HDFC Bank Ltd',
    email: 'alerts@hdfcbank.net',
    phone: '1800 202 6161',
    domain: 'www.hdfcbank.com',
    notes: 'Routine statement notification matching official domain syntax.',
  },
];

export const IdentityImpersonationChecker: React.FC = () => {
  const [claimedOrg, setClaimedOrg] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [suppliedDomain, setSuppliedDomain] = useState('');
  const [referenceNotes, setReferenceNotes] = useState('');

  const [isAssessing, setIsAssessing] = useState(false);
  const [result, setResult] = useState<IdentityAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setClaimedOrg('');
    setSenderEmail('');
    setSenderPhone('');
    setSuppliedDomain('');
    setReferenceNotes('');
    setResult(null);
    setError(null);
  };

  const handleSelectSample = (sample: (typeof SAMPLE_PROFILES)[0]) => {
    setClaimedOrg(sample.org);
    setSenderEmail(sample.email);
    setSenderPhone(sample.phone);
    setSuppliedDomain(sample.domain);
    setReferenceNotes(sample.notes);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedOrg.trim() && !senderEmail.trim() && !senderPhone.trim()) {
      setError('Please provide at least a Claimed Organisation, Email, or Phone number.');
      return;
    }

    setError(null);
    setIsAssessing(true);

    try {
      const res = await assessIdentityWithVerification(
        claimedOrg,
        senderEmail,
        senderPhone,
        suppliedDomain,
        referenceNotes
      );
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Failed to assess sender authenticity. Please try again.');
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title & Mission */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
          <UserCheck size={14} />
          <span>Heuristic Identity Consistency Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Identity Impersonation Checker
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Evaluate claimed identity against communication channels. Compares domain syntax and infrastructure patterns against known corporate naming standards.
        </p>
      </div>

      {/* Limitations Notice Banner */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
        <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-slate-200 font-semibold">Honest Verification Limitation:</p>
          <p className="text-[11px] leading-relaxed">
            No authoritative source (government database, live telecom carrier, or internal employee directory) is queried. Nothing in this report is certified as verified. TrustLens evaluates only static textual consistency.
          </p>
        </div>
      </div>

      {/* Test Sample Profiles */}
      <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles size={14} className="text-cyan-400" />
          <span>Load Demonstration Test Identities:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROFILES.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-left cursor-pointer"
            >
              <span className="font-semibold text-cyan-300">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
            <XCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Claimed Institution / Identity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Building size={14} className="text-cyan-400" />
            <span>Claimed Organisation / Official Authority</span>
          </label>
          <input
            type="text"
            value={claimedOrg}
            onChange={(e) => setClaimedOrg(e.target.value)}
            placeholder="e.g. State Bank of India, India Post, BESCOM Electricity Office, HR Department"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Channels Grid: Email, Phone, Domain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Mail size={14} className="text-cyan-400" />
              <span>Sender Email Address</span>
            </label>
            <input
              type="text"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="e.g. customer-service@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Phone size={14} className="text-cyan-400" />
              <span>Sender Phone / Contact</span>
            </label>
            <input
              type="text"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="e.g. +91 98451 20938"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Globe size={14} className="text-cyan-400" />
              <span>Supplied Website Domain</span>
            </label>
            <input
              type="text"
              value={suppliedDomain}
              onChange={(e) => setSuppliedDomain(e.target.value)}
              placeholder="e.g. sbi-secure-portal.top"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Reference Context Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FileQuestion size={14} className="text-cyan-400" />
            <span>Optional Reference Context (Circumstances of Contact)</span>
          </label>
          <textarea
            rows={2}
            value={referenceNotes}
            onChange={(e) => setReferenceNotes(e.target.value)}
            placeholder="e.g. Received unsolicited WhatsApp message asking to update KYC or download an APK..."
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isAssessing}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-sm shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isAssessing ? 'Cross-Matching...' : 'Assess Identity Consistency'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-3 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-6 border-t border-slate-800">
          {/* Header Score Card */}
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
            <ScoreCircle score={result.riskScore} level={result.riskLevel} />
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <RiskBadge level={result.riskLevel} size="lg" />
                <span className="text-xs font-mono text-slate-400">
                  Target: <strong className="text-slate-200">{result.claimedOrg || 'Unspecified Entity'}</strong>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Static Heuristics (Unverified)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {result.riskLevel === 'HIGH'
                  ? 'Severe Identity Inconsistency (Likely Impersonation)'
                  : result.riskLevel === 'MEDIUM'
                  ? 'Incomplete Provenance - Proceed with Caution'
                  : 'Pattern Aligns with Standard Practices (Not Authoritatively Verified)'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* 3 Categories: Provided by you | Inferred by Heuristics | Could not be verified here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Provided by you */}
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase font-mono tracking-wider">
                <Building size={16} className="text-cyan-400" />
                <span>Provided by You</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>
                  <span className="text-slate-500">Claimed:</span>{' '}
                  <strong className="text-slate-200">{result.claimedOrg || 'None'}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Email:</span>{' '}
                  <strong className="text-slate-200">{result.senderEmail || 'None'}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Phone:</span>{' '}
                  <strong className="text-slate-200">{result.senderPhone || 'None'}</strong>
                </li>
                <li>
                  <span className="text-slate-500">Domain:</span>{' '}
                  <strong className="text-slate-200">{result.suppliedDomain || 'None'}</strong>
                </li>
              </ul>
            </div>

            {/* 2. Inferred by heuristics (Matches known brand pattern or inconsistent) */}
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase font-mono tracking-wider">
                <AlertTriangle size={16} className="text-amber-400" />
                <span>Inferred by Heuristics</span>
              </div>
              {result.inconsistentInformation.length > 0 ? (
                <ul className="space-y-2 text-xs text-rose-300">
                  {result.inconsistentInformation.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : result.matchedBrandPatterns && result.matchedBrandPatterns.length > 0 ? (
                <ul className="space-y-2 text-xs text-emerald-300">
                  {result.matchedBrandPatterns.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No specific brand pattern matched.</p>
              )}
            </div>

            {/* 3. Could not be verified here */}
            <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase font-mono tracking-wider">
                <HelpCircle size={16} />
                <span>Could Not Be Verified Here</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                {result.unverifiedInformation.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How to verify through known channels */}
          <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" />
              <span>How to Verify Through Safe Channels</span>
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
