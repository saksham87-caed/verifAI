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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto text-white/90">
      {/* Title & Mission */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <UserCheck size={14} />
          <span>Heuristic Identity Consistency Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Identity Impersonation Checker
        </h1>
        <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
          Evaluate claimed identity against communication channels. Compares domain syntax and infrastructure patterns against known corporate naming standards.
        </p>
      </div>

      {/* Limitations Notice Banner */}
      <div className="p-4 glass rounded-2xl border border-white/15 text-xs text-white/70 flex items-start gap-3">
        <Info size={16} className="text-white shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-white font-semibold">Honest Verification Limitation:</p>
          <p className="text-[11px] text-white/60 leading-relaxed">
            No authoritative source (government database, live telecom carrier, or internal employee directory) is queried. Nothing in this report is certified as verified. verifAI evaluates only static textual consistency.
          </p>
        </div>
      </div>

      {/* Test Sample Profiles */}
      <div className="space-y-3 p-4 glass-strong rounded-2xl border border-white/18">
        <p className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
          <Sparkles size={14} className="text-white" />
          <span>Load Demonstration Test Identities:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROFILES.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 text-xs rounded-xl glass hover:bg-white/15 text-white/80 hover:text-white border border-white/15 transition-all text-left cursor-pointer"
            >
              <span className="font-semibold text-white">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 bg-white/10 border border-white/20 text-white text-xs rounded-xl flex items-center gap-2">
            <XCircle size={16} className="shrink-0 text-white" />
            <span>{error}</span>
          </div>
        )}

        {/* Claimed Institution / Identity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Building size={14} className="text-white" />
            <span>Claimed Organisation / Official Authority</span>
          </label>
          <input
            type="text"
            value={claimedOrg}
            onChange={(e) => setClaimedOrg(e.target.value)}
            placeholder="e.g. State Bank of India, India Post, BESCOM Electricity Office, HR Department"
            className="w-full p-3.5 glass-input rounded-2xl text-xs sm:text-sm focus:outline-none"
          />
        </div>

        {/* Channels Grid: Email, Phone, Domain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Mail size={14} className="text-white" />
              <span>Sender Email Address</span>
            </label>
            <input
              type="text"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="e.g. customer-service@gmail.com"
              className="w-full p-3 glass-input rounded-2xl text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Phone size={14} className="text-white" />
              <span>Sender Phone / Contact</span>
            </label>
            <input
              type="text"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="e.g. +91 98451 20938"
              className="w-full p-3 glass-input rounded-2xl text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Globe size={14} className="text-white" />
              <span>Supplied Website Domain</span>
            </label>
            <input
              type="text"
              value={suppliedDomain}
              onChange={(e) => setSuppliedDomain(e.target.value)}
              placeholder="e.g. sbi-secure-portal.top"
              className="w-full p-3 glass-input rounded-2xl text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Reference Context Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FileQuestion size={14} className="text-white" />
            <span>Optional Reference Context (Circumstances of Contact)</span>
          </label>
          <textarea
            rows={2}
            value={referenceNotes}
            onChange={(e) => setReferenceNotes(e.target.value)}
            placeholder="e.g. Received unsolicited WhatsApp message asking to update KYC or download an APK..."
            className="w-full p-3 glass-input rounded-2xl text-xs focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isAssessing}
            className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-white/90 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {isAssessing ? 'Cross-Matching...' : 'Assess Identity Consistency'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-3.5 text-xs font-semibold text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          {/* Header Score Card */}
          <div className="p-6 glass-strong rounded-2xl border border-white/18 flex flex-col md:flex-row items-center gap-6">
            <ScoreCircle score={result.riskScore} level={result.riskLevel} />
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <RiskBadge level={result.riskLevel} size="lg" />
                <span className="text-xs font-mono text-white/60">
                  Target: <strong className="text-white">{result.claimedOrg || 'Unspecified Entity'}</strong>
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
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
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* 3 Categories: Provided by you | Inferred by Heuristics | Could not be verified here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Provided by you */}
            <div className="p-5 glass rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono tracking-wider">
                <Building size={16} />
                <span>Provided by You</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/80 font-mono">
                <li>
                  <span className="text-white/40">Claimed:</span>{' '}
                  <strong className="text-white">{result.claimedOrg || 'None'}</strong>
                </li>
                <li>
                  <span className="text-white/40">Email:</span>{' '}
                  <strong className="text-white">{result.senderEmail || 'None'}</strong>
                </li>
                <li>
                  <span className="text-white/40">Phone:</span>{' '}
                  <strong className="text-white">{result.senderPhone || 'None'}</strong>
                </li>
                <li>
                  <span className="text-white/40">Domain:</span>{' '}
                  <strong className="text-white">{result.suppliedDomain || 'None'}</strong>
                </li>
              </ul>
            </div>

            {/* 2. Inferred by heuristics (Matches known brand pattern or inconsistent) */}
            <div className="p-5 glass rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono tracking-wider">
                <AlertTriangle size={16} />
                <span>Inferred by Heuristics</span>
              </div>
              {result.inconsistentInformation.length > 0 ? (
                <ul className="space-y-2 text-xs text-white">
                  {result.inconsistentInformation.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : result.matchedBrandPatterns && result.matchedBrandPatterns.length > 0 ? (
                <ul className="space-y-2 text-xs text-white/90">
                  {result.matchedBrandPatterns.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/40 italic">No specific brand pattern matched.</p>
              )}
            </div>

            {/* 3. Could not be verified here */}
            <div className="p-5 glass rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center gap-2 text-white/60 font-bold text-xs uppercase font-mono tracking-wider">
                <HelpCircle size={16} />
                <span>Could Not Be Verified Here</span>
              </div>
              <ul className="space-y-2 text-xs text-white/60">
                {result.unverifiedInformation.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How to verify through known channels */}
          <div className="p-5 glass-strong rounded-2xl border border-white/18 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 font-mono flex items-center gap-2">
              <Shield size={16} className="text-white" />
              <span>How to Verify Through Safe Channels</span>
            </h4>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-white/80">
                  <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">{rec.action}: </span>
                    <span className="text-white/60">{rec.detail}</span>
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
