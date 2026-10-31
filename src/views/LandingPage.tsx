import React from 'react';
import {
  ShieldCheck,
  Search,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  Globe2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { SupportedLanguage, translations } from '../i18n/translations';
import { Logo } from '../components/Logo';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  language: SupportedLanguage;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, language }) => {
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen text-white/90">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-white/90 tracking-wider uppercase bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <ShieldCheck size={14} />
                <span>Next-Gen Cybersecurity Defense</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
                {t.hero.headline}
              </h1>

              <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
                {t.hero.description}
              </p>

              <div className="p-4 glass border border-white/15 rounded-2xl text-xs text-white/60 space-y-1">
                <p className="font-semibold text-white">
                  Tagline: <span className="text-white/90">"{t.tagline}"</span>
                </p>
                <p>{t.subTagline}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('message-scanner')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-white/90 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <span>{t.hero.scanCta}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>{t.hero.exploreCta}</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Supported users ticker */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-white/50">
                <span className="text-white/70 font-medium">Built for:</span>
                <span>Students</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span>Ordinary Internet Users</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span>Elderly Citizens</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span>Small Businesses</span>
                <span aria-hidden="true" className="text-white/30">·</span>
                <span>UPI & Banking Users</span>
              </div>
            </div>

            {/* Right Column: Visual Shield Asset */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl glass-strong border border-white/20 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 border-b border-white/10 pb-3">
                    <span className="text-emerald-500 font-bold">VERIFIED SCAN READY</span>
                    <span>LOCAL ANALYSIS ONLY</span>
                </div>
                <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-[11px] font-mono text-white/90">"Dear user, your HDFC bank account is blocked..."</p>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">High Risk</span>
                        <span className="text-[14px] font-bold text-rose-500 font-mono">92/100</span>
                    </div>
                </div>
                <div className="text-[10px] text-white/40 font-mono pt-2">
                    // ANALYSIS COMPLETE. THREAT DETECTED.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Threat Protection Overview */}
      <section className="py-16 border-b border-white/10 glass-strong rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Targeted Protection for Modern Digital Threats
            </h2>
            <p className="text-sm text-white/60">
              Cyber deception in India has evolved past crude spam into sophisticated social engineering targeting fear, urgency, and unfamiliarity with digital systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Bank KYC & PAN Blocks',
                desc: 'Fake warnings threatening account freeze unless links to cloned portals (.top, .xyz) are opened within 24 hours.',
                vector: 'SMS / WhatsApp',
              },
              {
                title: 'UPI PIN Deception',
                desc: 'Fraudulent refund requests, lottery scratch cards, and QR codes designed to debit rather than credit money.',
                vector: 'Payment Apps',
              },
              {
                title: 'Utility Disconnection',
                desc: 'High-urgency threats claiming electricity, SIM, or LPG will be disconnected tonight at 9:30 PM.',
                vector: 'Hinglish Smishing',
              },
              {
                title: 'Task & Fake Job Scams',
                desc: 'Remote part-time tasks promising thousands for hotel reviews that end in high-value advance extortion.',
                vector: 'Telegram / WhatsApp',
              },
            ].map((threat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl glass hover:border-white/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono text-white/50">
                  <span>VECTOR {idx + 1}</span>
                  <span className="text-white font-semibold">{threat.vector}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{threat.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{threat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Three Major Capabilities */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-bold text-white">
              Core Security Capabilities
            </h2>
            <p className="text-sm text-white/60">
              Three specialized verification engines inspect every dimension of incoming communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Capability 1 */}
            <div className="p-6 rounded-2xl glass border border-white/15 space-y-4 hover:border-white/35 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <AlertOctagon size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">
                AI Message Security Scanner
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Evaluates SMS, email bodies, and WhatsApp forwards across multi-lingual and code-mixed patterns (English, Hindi, Hinglish). Detects coercive urgency, false authority, and credential traps.
              </p>
              <button
                onClick={() => onNavigate('message-scanner')}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-white/80 pt-2 cursor-pointer"
              >
                <span>Launch Message Scanner</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-2xl glass border border-white/15 space-y-4 hover:border-white/35 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Suspicious Link Inspector
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Deconstructs untrusted URLs without opening them. Uncovers raw IP addresses, typosquatting, deceptive brand subdomains, punycode lookalikes, and abusive TLD extensions.
              </p>
              <button
                onClick={() => onNavigate('url-checker')}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-white/80 pt-2 cursor-pointer"
              >
                <span>Inspect Suspicious Links</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-2xl glass border border-white/15 space-y-4 hover:border-white/35 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <UserCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Identity Impersonation Detection
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Cross-validates claimed organisations against sender email domains, consumer phone numbers, and web domains. Never declares an identity verified without authentic provenance.
              </p>
              <button
                onClick={() => onNavigate('identity-checker')}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-white/80 pt-2 cursor-pointer"
              >
                <span>Check Identity Trust</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How verifAI Works in Three Steps */}
      <section className="py-20 border-b border-white/10 glass-strong rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-bold text-white">
              How verifAI Works in Three Steps
            </h2>
            <p className="text-sm text-white/60">
              A transparent, safe verification workflow that protects your devices from execution risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 glass rounded-2xl border border-white/15 space-y-3">
              <div className="text-xs font-mono text-white/80 uppercase tracking-widest font-bold">
                Step 01
              </div>
              <h3 className="text-lg font-semibold text-white">Paste Untrusted Content</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Paste any questionable SMS, WhatsApp message, email, or URL into verifAI. Content is isolated as plain text—no scripts or web links are executed.
              </p>
            </div>

            <div className="p-6 glass rounded-2xl border border-white/15 space-y-3">
              <div className="text-xs font-mono text-white/80 uppercase tracking-widest font-bold">
                Step 02
              </div>
              <h3 className="text-lg font-semibold text-white">Forensic Signal Extraction</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                The engine evaluates domain reputation, psychological pressure (fear, greed, artificial urgency), financial extraction triggers, and sender provenance.
              </p>
            </div>

            <div className="p-6 glass rounded-2xl border border-white/15 space-y-3">
              <div className="text-xs font-mono text-white/80 uppercase tracking-widest font-bold">
                Step 03
              </div>
              <h3 className="text-lg font-semibold text-white">Actionable Verification Guidance</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Receive an explainable risk assessment with highlighted manipulation triggers and exact safe steps to verify the institution through trusted official channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Multilingual Support Showcase */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-white uppercase tracking-wider bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
                <Globe2 size={14} />
                <span>Multilingual & Code-Mixed Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Engineered for India's Linguistic Diversity
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Fraudsters deliberately craft messages in regional vernaculars or code-mixed Hinglish to exploit users who may not be comfortable in English. verifAI processes English and Hindi (हिन्दी) seamlessly.
              </p>
              <div className="space-y-2 pt-2 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>Supports pure English, pure Hindi, and code-mixed Latin transliterations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span>Identifies local administrative deception (BESCOM, UP Power, SBI YONO, India Post)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-5 rounded-2xl glass border border-white/20 space-y-3 font-mono text-xs">
                <div className="text-[11px] text-white/40 uppercase tracking-wider pb-2 border-b border-white/10">
                  Sample Code-Mixed Verification Input
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/15 text-white/90">
                  "Dear Consumer, Your electricity bill not updated. Power supply will be disconnected tonight at 9:30 PM. Call Mr. Sharma immediately..."
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white">
                  Detected Signals: <span className="font-bold underline decoration-solid">CRITICAL URGENCY</span> · Personal phone number impersonating utility · Coercive blackout threat
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security Statistics */}
      <section className="py-16 border-b border-white/10 glass-strong rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white">
                Threat Landscape & Security Benchmarks
              </h2>
              <p className="text-xs text-white/50">
                National cybersecurity landscape context & simulated benchmark performance
              </p>
            </div>
            <span className="text-[11px] font-mono text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/20 shrink-0">
              Illustrative figures for demonstration
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 glass rounded-2xl border border-white/15 space-y-2">
              <p className="text-3xl font-extrabold text-white font-mono tabular-nums">
                68%
              </p>
              <h3 className="text-xs font-semibold text-white/90">SMS / Smishing Share</h3>
              <p className="text-[11px] text-white/50 leading-normal">
                Estimated proportion of digital banking scams initiated via fraudulent SMS links.
              </p>
            </div>

            <div className="p-5 glass rounded-2xl border border-white/15 space-y-2">
              <p className="text-3xl font-extrabold text-white font-mono tabular-nums">
                &lt; 15 min
              </p>
              <h3 className="text-xs font-semibold text-white/90">Urgency Window</h3>
              <p className="text-[11px] text-white/50 leading-normal">
                Average artificial deadline imposed by scammers before victims can verify with family.
              </p>
            </div>

            <div className="p-5 glass rounded-2xl border border-white/15 space-y-2">
              <p className="text-3xl font-extrabold text-white font-mono tabular-nums">
                0 PINs
              </p>
              <h3 className="text-xs font-semibold text-white/90">UPI Receipt Rule</h3>
              <p className="text-[11px] text-white/50 leading-normal">
                UPI architecture never requires entering a PIN to receive or accept funds.
              </p>
            </div>

            <div className="p-5 glass rounded-2xl border border-white/15 space-y-2">
              <p className="text-3xl font-extrabold text-white font-mono tabular-nums">
                5 Stages
              </p>
              <h3 className="text-xs font-semibold text-white/90">Forensic Pipeline</h3>
              <p className="text-[11px] text-white/50 leading-normal">
                Multi-layer inspection across linguistics, domain entropy, entity cross-matching, and psychology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Why verifAI is Different */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl font-bold text-white">
              Why verifAI is Different
            </h2>
            <p className="text-sm text-white/60">
              We reject opaque blackbox scores in favor of transparent, explainable forensic reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl glass border border-white/15 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                Explains "WHY" Instead of Just Rating
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Generic spam blockers assign an unexplained number. verifAI highlights the exact psychological hooks, suspicious domain structures, and missing corporate authentication headers.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass border border-white/15 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                Strict Non-Executing Defensive Sandbox
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                verifAI never visits, pings, or executes submitted URLs. Your device and our servers remain insulated from drive-by downloads or zero-day browser exploits.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass border border-white/15 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                Local & Indian Regulatory Alignment
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Trained on TRAI 6-character DLT header protocols, Indian bank URL registries (.bank.sbi, hdfcbank.com), NPCI UPI rules, and state electricity board formats.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass border border-white/15 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                Direct Official Verification Channels
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Every report provides concrete, safe alternatives: toll-free numbers on physical bank cards, official portal addresses, and national cyber reporting procedures (1930 / cybercrime.gov.in).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action Banner */}
      <section className="py-16 glass-strong rounded-none border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Have a Message That Seems Suspicious?
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto">
            Do not click the link. Do not enter your PIN. Paste the content into verifAI and receive an immediate forensic breakdown.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('message-scanner')}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-white/90 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap cursor-pointer"
            >
              Scan Message in Sandbox
            </button>
            <button
              onClick={() => onNavigate('url-checker')}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white glass hover:bg-white/15 border border-white/20 rounded-xl transition-all whitespace-nowrap cursor-pointer"
            >
              Inspect Untrusted Link
            </button>
          </div>
        </div>
      </section>

      {/* 9. Professional Footer */}
      <footer className="py-12 glass-strong rounded-none text-white/60 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-white font-sans text-xl">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Logo size={16} />
                </div>
                <span>verif<b className="font-extrabold text-white">AI</b></span>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed">
                Intelligent digital security assistant built for the 24-hour national hackathon. Defending digital identity and protecting citizens from social engineering.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-white/90 mb-3 font-mono">
                Security Tools
              </p>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('message-scanner')} className="hover:text-white transition-colors cursor-pointer">
                    AI Message Security Scanner
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('url-checker')} className="hover:text-white transition-colors cursor-pointer">
                    Suspicious Link Inspector
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('identity-checker')} className="hover:text-white transition-colors cursor-pointer">
                    Identity Trust Checker
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('scan-history')} className="hover:text-white transition-colors cursor-pointer">
                    Scan History
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-white/90 mb-3 font-mono">
                Resources
              </p>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('awareness-centre')} className="hover:text-white transition-colors cursor-pointer">
                    Security Awareness Centre
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                    How verifAI Works
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                    SOC Dashboard
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-white/90 mb-3 font-mono">
                National Cyber Helpline
              </p>
              <p className="text-[11px] text-white/50">
                In India, report active cyber fraud within the "golden hour" to helpline:
              </p>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl glass border border-white/20 text-white font-mono font-bold text-sm flex items-center justify-between group hover:bg-white/10 transition-colors"
                title="Visit National Cyber Crime Reporting Portal (cybercrime.gov.in)"
              >
                <span>Dial 1930 · cybercrime.gov.in</span>
                <ExternalLink size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
            <p>© 2026 verifAI. All rights reserved. Defensive cybersecurity assistant.</p>
            <p>Illustrative demonstration data. Not legal or financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
