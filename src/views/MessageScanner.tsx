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
} from 'lucide-react';
import { MessageType, LanguageCode, MessageAnalysisResult, BackendSampleItem } from '../types/security';
import { SAMPLE_MESSAGES, SampleMessage } from '../services/securityEngine';

const getTierColor = (tier: string) => {
  if (tier === 'HIGH_RISK') return 'text-rose-500';
  if (tier === 'SUSPICIOUS') return 'text-amber-500';
  return 'text-emerald-500';
};

const getCategoryColor = (category: string) => {
  if (['Bank KYC Phishing', 'Parcel Scam (Smishing)', 'Utility Threat (Hinglish)', 'Task / Job Fraud', 'OTP Theft', 'Fake Support'].includes(category)) return 'text-rose-500';
  if (['UPI PIN Deception', 'QR Code'].includes(category)) return 'text-amber-500';
  return 'text-emerald-500';
};
import { analyzeMessageWithStages, ScanStage, fetchBackendSamples } from '../services/apiService';
import { AnalysisProgressModal } from '../components/AnalysisProgressModal';
import { CompareModal } from '../components/CompareModal';

interface MessageScannerProps {
  onScanComplete: (result: MessageAnalysisResult) => void;
  onOpenCompare?: (text: string, channel?: string, lang?: string, sender?: string, claim?: string) => void;
}

export const MessageScanner: React.FC<MessageScannerProps> = ({
  onScanComplete,
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
    if (isScanning) return;

    if (!messageText.trim()) {
      setFormError('Please enter or paste the message text you wish to analyze.');
      return;
    }

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

  const displayedSamples = backendSamples.length > 0
    ? backendSamples.filter((s) => {
        if (sampleTab === 'tricky_benign') return s.difficulty === 'tricky_benign' || s.expected_tier === 'SAFE';
        if (sampleTab === 'regional') return s.language === 'hi' || s.language === 'mixed';
        return s.expected_tier === 'HIGH_RISK';
      })
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto text-white/90">
      {/* Page Title & Mission */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <MessageSquareWarning size={14} />
          <span>Core Forensic Engine · Hybrid Rules + AI</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Message Security Scanner
        </h1>
        <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
          Paste any suspicious message and let verifAI investigate its security signals. Supports English, Hindi (हिन्दी), and code-mixed Hinglish SMS.
        </p>
      </div>

      {/* Real-World Test Sample Buttons with Tabs */}
      <div className="space-y-3 p-4 glass-strong rounded-2xl border border-white/18">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
            <Sparkles size={14} className="text-white" />
            <span>Try Curated Examples (/api/samples):</span>
          </p>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setSampleTab('threats')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                sampleTab === 'threats' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              High Threats
            </button>
            <button
              type="button"
              onClick={() => setSampleTab('tricky_benign')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                sampleTab === 'tricky_benign' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Tricky Benign
            </button>
            <button
              type="button"
              onClick={() => setSampleTab('regional')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                sampleTab === 'regional' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
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
                className="px-3 py-1.5 text-xs rounded-xl glass hover:bg-white/15 text-white/80 hover:text-white border border-white/15 transition-all text-left cursor-pointer"
                title={sample.description}
              >
                <span className={`font-semibold ${getTierColor(sample.expected_tier)}`}>
                  [{sample.expected_tier.replace('_', ' ')}]
                </span>{' '}
                <span className="font-mono text-white/60">{sample.claimed_identity || sample.channel.toUpperCase()}</span>:{' '}
                {sample.text.substring(0, 38)}...
              </button>
            ))
          ) : (
            SAMPLE_MESSAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-3 py-1.5 text-xs rounded-xl glass hover:bg-white/15 text-white/80 hover:text-white border border-white/15 transition-all text-left cursor-pointer"
              >
                <span className={`font-semibold ${getCategoryColor(sample.category)}`}>[{sample.category}]</span> {sample.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Analysis Form */}
      <form onSubmit={handleAnalyze} className="space-y-6">
        {formError && (
          <div className="p-3.5 bg-white/10 border border-white/20 text-white text-xs rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-white" />
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
            <label htmlFor="message-text" className="text-xs font-semibold text-white/80 uppercase tracking-wider font-mono">
              Suspicious Message Content <span className="text-white">*</span>
            </label>
            <span className="text-[11px] font-mono text-white/40">
              {messageText.length} / 5000 characters
            </span>
          </div>

          <textarea
            id="message-text"
            rows={6}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp forward, bank warning, or email body here... (e.g., 'Dear SBI customer, your YONO account is suspended. Update Pan Card at http://sbi-kyc-update.top/login immediately')"
            className="w-full p-4 glass-input rounded-2xl text-sm font-sans leading-relaxed focus:outline-none"
          />
        </div>

        {/* Multi-Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 glass rounded-2xl border border-white/15">
          {/* Claimed Organisation */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
              <Building size={14} className="text-white/40" />
              <span>Claimed Identity</span>
            </label>
            <input
              type="text"
              value={claimedOrg}
              onChange={(e) => setClaimedOrg(e.target.value)}
              placeholder="e.g. State Bank of India, India Post"
              className="w-full p-2.5 glass-input rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Sender Header Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
              <User size={14} className="text-white/40" />
              <span>Sender Header / Name</span>
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. VK-SBIINB, it-support@domain.com"
              className="w-full p-2.5 glass-input rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Sender Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
              <Phone size={14} className="text-white/40" />
              <span>Sender Phone / Email</span>
            </label>
            <input
              type="text"
              value={senderContact}
              onChange={(e) => setSenderContact(e.target.value)}
              placeholder="e.g. +91 98451 20938"
              className="w-full p-2.5 glass-input rounded-xl text-xs focus:outline-none"
            />
          </div>

          {/* Message Platform Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
              <FileText size={14} className="text-white/40" />
              <span>Platform</span>
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
              className="w-full p-2.5 glass-input rounded-xl text-xs focus:outline-none cursor-pointer bg-black/80"
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
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="font-semibold text-white/80">Target Language:</span>
            <div className="inline-flex rounded-xl p-1 glass border border-white/15">
              {(['auto', 'en', 'hi'] as LanguageCode[]).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-white text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {lang === 'auto' ? 'Auto-Detect' : lang === 'en' ? 'English' : 'हिन्दी (Hindi)'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-mono text-white/40">
            Static string analysis · PII redacted before AI evaluation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isScanning}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-white/90 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Send size={15} />
              <span>{isScanning ? 'Analyzing...' : 'Analyse Message'}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-xs font-semibold text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all cursor-pointer"
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
              className="inline-flex items-center gap-2 px-4 py-3.5 text-xs font-semibold text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all cursor-pointer"
            >
              <SplitSquareVertical size={14} className="text-white" />
              <span>Compare with Naive Baseline</span>
            </button>
          </div>
        </div>
      </form>

      {/* Safety & Defensive Policy Banner */}
      <div className="p-4 glass rounded-2xl border border-white/15 text-xs text-white/60 space-y-2">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Info size={16} className="text-white" />
          <span>Defensive Privacy & Isolation Guarantee</span>
        </div>
        <p className="text-white/50 text-[11px] leading-relaxed">
          verifAI treats all message text as untrusted data. Links are analyzed purely as static strings without resolving DNS or fetching servers. Phone numbers, emails, Aadhaar numbers, and OTPs are redacted prior to AI evaluation.
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
