import React from 'react';
import {
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const workflowSteps = [
    {
      num: '01',
      title: 'User Submits Content',
      desc: 'Users paste any suspicious SMS text, WhatsApp forward, email body, or web link into the verifAI isolation field.',
    },
    {
      num: '02',
      title: 'Defensive Content Isolation',
      desc: 'The payload is treated strictly as untrusted text. No network pings, web browsing, script execution, or tracking beacons occur.',
    },
    {
      num: '03',
      title: 'Forensic Signal Extraction',
      desc: 'The heuristic engine extracts structural indicators: domain reputation, TRAI DLT headers, financial extraction hooks, and urgent deadlines.',
    },
    {
      num: '04',
      title: 'AI-Assisted Assessment',
      desc: 'Cognitive models evaluate social engineering triggers (fear, coercive urgency, unearned rewards, and fake institutional authority).',
    },
    {
      num: '05',
      title: 'Transparent Risk Explanation',
      desc: 'Instead of an opaque score, verifAI explains the exact evidence discovered in the message and why it constitutes a threat.',
    },
    {
      num: '06',
      title: 'Safe Verification Guidance',
      desc: 'Delivers actionable, official steps: direct branch escalation, helpline dialing (1930), and authentic portal lookups.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12 max-w-5xl mx-auto text-white/90">
      {/* Title & Mission */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <ShieldCheck size={14} />
          <span>Architecture & Principles</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          About verifAI
        </h1>
        <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
          Developed for the 24-hour national-level hackathon. Built to defend Indian digital banking and messaging users against social engineering, deceptive links, and impersonation.
        </p>
      </div>

      {/* 6-Stage Visual Workflow */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            How verifAI Operates: 6-Stage Defensive Pipeline
          </h2>
          <p className="text-xs text-white/50 mt-1">
            From untrusted submission to safe, transparent verification guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-5 rounded-2xl glass border border-white/15 space-y-3 relative hover:border-white/30 transition-all"
            >
              <span className="text-2xl font-extrabold font-mono text-white/40 block">
                {step.num}
              </span>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Defensive Architecture Philosophy */}
      <div className="p-6 sm:p-8 glass-strong rounded-2xl border border-white/18 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Lock size={20} />
          </div>
          <h2 className="text-lg font-bold text-white">
            Core Defensive Philosophy
          </h2>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-white/80 leading-relaxed">
          <p>
            verifAI is designed strictly as a <strong>defensive advisory assistant</strong>. It operates under strict security boundaries:
          </p>
          <ul className="space-y-2 pt-2 text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-white font-bold shrink-0">✕</span>
              <span><strong>Never automatically opens or visits links:</strong> Attackers often set up exploit kits or tracking pixels. verifAI parses links in memory without opening remote network sockets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold shrink-0">✕</span>
              <span><strong>Never sends replies or messages:</strong> verifAI will never contact the sender, preventing attackers from learning that a phone number is active.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold shrink-0">✕</span>
              <span><strong>Never performs or authorizes financial transactions:</strong> verifAI does not integrate with payment gateways or handle banking authentication tokens.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Responsible Handling & Privacy Section */}
      <div className="p-6 sm:p-8 glass-strong rounded-2xl border border-white/18 space-y-4">
        <h2 className="text-lg font-bold text-white">
          Responsible Handling of User-Submitted Information
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
          <p>
            We recognize that users paste communications that may contain private context, such as delivery notifications or bank statements.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl glass border border-white/15 space-y-2 text-xs">
              <h4 className="font-semibold text-white">Zero Credential Storage</h4>
              <p className="text-white/60 text-[11px] leading-relaxed">
                verifAI never stores user passwords, UPI PINs, CVVs, or full debit card numbers. Any numeric credentials discovered in message text are evaluated solely as threat signatures.
              </p>
            </div>
            <div className="p-4 rounded-xl glass border border-white/15 space-y-2 text-xs">
              <h4 className="font-semibold text-white">Session Privacy</h4>
              <p className="text-white/60 text-[11px] leading-relaxed">
                Scan history is stored on your device's browser memory (localStorage) and can be cleared at any time with a single click.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* National Hackathon Context & Supabase Architecture */}
      <div className="p-6 glass rounded-2xl border border-white/15 space-y-3 font-mono text-xs text-white/60">
        <p className="text-white font-bold text-sm">
          Hackathon Architecture & Supabase Integration Readiness
        </p>
        <p className="leading-relaxed">
          The verifAI API client in <code className="text-white">src/services/apiService.ts</code> is structured with modular interfaces for message analysis, URL inspection, identity verification, and scan persistence. Setting <code className="text-white">VITE_SUPABASE_URL</code> and <code className="text-white">VITE_SUPABASE_ANON_KEY</code> allows direct synchronization with PostgreSQL / Supabase tables without changing UI components.
        </p>
      </div>
    </div>
  );
};
