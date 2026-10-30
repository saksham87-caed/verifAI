import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  Building,
  User,
  Phone,
  FileText,
  SplitSquareVertical,
  CheckCircle2,
} from 'lucide-react';
import { MessageType, LanguageCode, MessageAnalysisResult, BackendSampleItem } from '../types/security';
import { SAMPLE_MESSAGES, SampleMessage } from '../services/securityEngine';
import { analyzeMessageWithStages, ScanStage, fetchBackendSamples } from '../services/apiService';
import { AnalysisProgressModal } from '../components/AnalysisProgressModal';
import { CompareModal } from '../components/CompareModal';

interface MessageScannerProps {
  onScanComplete: (result: MessageAnalysisResult) => void;
  onOpenCompare?: (text: string, channel?: string, lang?: string, sender?: string, claim?: string) => void;
}

export const MessageScanner: React.FC<MessageScannerProps> = ({
  onScanComplete,
  onOpenCompare,
}) => {
  const [messageText, setMessageText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [claimedOrg, setClaimedOrg] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('sms');
  const [language, setLanguage] = useState<LanguageCode>('auto');

  // Backend samples state
  const [backendSamples, setBackendSamples] = useState<BackendSampleItem[]>([]);
  const [sampleTab, setSampleTab] = useState<'threats' | 'tricky_benign' | 'regional'>('threats');

  // Loading / Pipeline State
  const [isScanning, setIsScanning] = useState(false);
  const [currentStage, setCurrentStage] = useState<ScanStage | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    fetchBackendSamples().then((data) => {
      if (data && data.length > 0) {
        setBackendSamples(data);
      }
    });

    return () => {
      // Abort any in-flight request when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessageText('');
    setSenderName('');
    setSenderContact('');
    setClaimedOrg('');
    setMessageType('sms');
    setLanguage('auto');
    setFormError(null);
  };

  const handleSelectSample = (sample: SampleMessage) => {
    setMessageText(sample.text);
    setSenderName(sample.senderName);
    setSenderContact(sample.senderContact);
    setClaimedOrg(sample.claimedOrg);
    setMessageType(sample.messageType);
    setLanguage(sample.language);
    setFormError(null);
  };

  const handleSelectBackendSample = (sample: BackendSampleItem) => {
    setMessageText(sample.text);
    setSenderName(sample.sender || '');
    setSenderContact('');
    setClaimedOrg(sample.claimed_identity || '');
    setMessageType(sample.channel);
    setLanguage(sample.language === 'mixed' ? 'auto' : sample.language);
    setFormError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) return; // Prevent double-click submission

    if (!messageText.trim()) {
      setFormError('Please enter or paste the message text you wish to analyze.');
      return;
    }

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setFormError(null);
    setIsScanning(true);
    setProgressPercent(0);

    try {
      const result = await analyzeMessageWithStages(
        messageText,
        senderName,
        senderContact,
        claimedOrg,
        messageType,
        language,
        (stage, progress) => {
          setCurrentStage(stage);
          setProgressPercent(progress);
        },
        controller.signal
      );

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(result);
      }, 350);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setIsScanning(false);
        return;
      }
      console.error(err);
      setIsScanning(false);
      setFormError(err?.message || 'An error occurred during message analysis. Please try again.');
    }
  };

  // Filter backend samples by selected tab
  const displayedSamples = backendSamples.length > 0
    ? backendSamples.filter((s) => {
        if (sampleTab === 'tricky_benign') return s.difficulty === 'tricky_benign' || s.expected_tier === 'SAFE';
        if (sampleTab === 'regional') return s.language === 'hi' || s.language === 'mixed';
        return s.expected_tier === 'HIGH_RISK';
      })
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Page Title & Mission */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
          <MessageSquareWarning size={14} />
          <span>Core Forensic Engine · Hybrid Rules + AI</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Message Security Scanner
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Paste any suspicious message and let TrustLens investigate its security signals. Supports English, Hindi (हिन्दी), and code-mixed Hinglish SMS.
        </p>
      </div>

      {/* Real-World Test Sample Buttons with Tabs */}
      <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Try Curated Examples (/api/samples):</span>
          </p>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setSampleTab('threats')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                sampleTab === 'threats' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              High Threats
            </button>
            <button
              type="button"
              onClick={() => setSampleTab('tricky_benign')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                sampleTab === 'tricky_benign' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tricky Benign
            </button>
            <button
              type="button"
              onClick={() => setSampleTab('regional')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                sampleTab === 'regional' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hindi / Hinglish
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {displayedSamples.length > 0 ? (
            displayedSamples.slice(0, 7).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectBackendSample(sample)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-left cursor-pointer"
                title={sample.description}
              >
                <span className={sample.expected_tier === 'SAFE' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  [{sample.expected_tier}]
                </span>{' '}
                <span className="font-mono text-slate-300">{sample.claimed_identity || sample.channel.toUpperCase()}</span>:{' '}
                {sample.text.substring(0, 38)}...
              </button>
            ))
          ) : (
            SAMPLE_MESSAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-left cursor-pointer"
              >
                <span className="font-semibold text-cyan-300">[{sample.category}]</span> {sample.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Analysis Form */}
      <form onSubmit={handleAnalyze} className="space-y-6">
        {formError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className="text-xs font-semibold underline hover:text-white cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="message-text" className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Suspicious Message Content <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {messageText.length} / 5000 characters
            </span>
          </div>

          <textarea
            id="message-text"
            rows={6}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp forward, bank warning, or email body here... (e.g., 'Dear SBI customer, your YONO account is suspended. Update Pan Card at http://sbi-kyc-update.top/login immediately')"
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans leading-relaxed transition-colors"
          />
        </div>

        {/* Multi-Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          {/* Claimed Organisation */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Building size={14} className="text-slate-400" />
              <span>Claimed Identity</span>
            </label>
            <input
              type="text"
              value={claimedOrg}
              onChange={(e) => setClaimedOrg(e.target.value)}
              placeholder="e.g. State Bank of India, India Post, CEO"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sender Header Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              <span>Sender Header / Name</span>
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. VK-SBIINB, it-support@domain.com"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sender Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Phone size={14} className="text-slate-400" />
              <span>Sender Phone / Email</span>
            </label>
            <input
              type="text"
              value={senderContact}
              onChange={(e) => setSenderContact(e.target.value)}
              placeholder="e.g. +91 98451 20938"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Message Platform Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              <span>Platform</span>
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="sms">SMS Text Message</option>
              <option value="email">Email Content</option>
              <option value="whatsapp">WhatsApp Message</option>
              <option value="other">Telegram / Other</option>
            </select>
          </div>
        </div>

        {/* Language selector & Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Target Language:</span>
            <div className="inline-flex rounded-lg p-1 bg-slate-900 border border-slate-800">
              {(['auto', 'en', 'hi'] as LanguageCode[]).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                    language === lang
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'auto' ? 'Auto-Detect' : lang === 'en' ? 'English' : 'हिन्दी (Hindi)'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            Static string analysis · PII redacted before AI evaluation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isScanning}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Send size={15} />
              <span>{isScanning ? 'Analyzing...' : 'Analyse Message'}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Clear Content</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!messageText.trim()) {
                  setFormError('Please enter or select a sample message first to compare.');
                  return;
                }
                setIsCompareOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-3.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <SplitSquareVertical size={14} className="text-cyan-400" />
              <span>Compare with Naive Baseline</span>
            </button>
          </div>
        </div>
      </form>

      {/* Safety & Defensive Policy Banner */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Info size={16} className="text-cyan-400" />
          <span>Defensive Privacy & Isolation Guarantee</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          TrustLens treats all message text as untrusted data. Links are analyzed purely as static strings without resolving DNS or fetching servers. Phone numbers, emails, Aadhaar numbers, and OTPs are redacted prior to AI evaluation.
        </p>
      </div>

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        messageText={messageText}
        channel={messageType === 'email' ? 'email' : 'sms'}
        language={language}
        sender={senderName || senderContact}
        claimedIdentity={claimedOrg}
      />

      {/* Loading Modal with 5-stage progression */}
      <AnalysisProgressModal
        isOpen={isScanning}
        currentStage={currentStage}
        progressPercent={progressPercent}
      />
    </div>
  );
};
