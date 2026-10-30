import React, { useState } from 'react';
import {
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Brain,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { SCAM_EDUCATION_CARDS } from '../services/securityEngine';
import { ScamEducationCard } from '../types/security';

export const AwarenessCentre: React.FC = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>('edu-smishing');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'Mobile Messaging', 'Payment Systems', 'Banking Security', 'Account Takeover', 'Employment Fraud'];

  const filteredCards = categoryFilter === 'all'
    ? SCAM_EDUCATION_CARDS
    : SCAM_EDUCATION_CARDS.filter((c) => c.category === categoryFilter);

  // Psychological Manipulation Techniques Guide
  const psychologicalFramework = [
    {
      title: '1. Manufactured Fear & Disruption',
      mechanism: 'Threatening that your bank balance is frozen, power will be cut tonight, or police warrants are issued.',
      whyItWorks: 'Panic shifts cognitive processing from logical reasoning to survival fight-or-flight, causing victims to bypass basic checks.',
      countermeasure: 'Pause. Take three deep breaths. Official Indian government departments never issue warrants or service terminations via WhatsApp or SMS links.',
    },
    {
      title: '2. Artificial & Coercive Urgency',
      mechanism: 'Setting strict deadlines like "within 24 hours", "in 15 minutes", or "tonight at 9:30 PM".',
      whyItWorks: 'Prevents the victim from calling their bank branch, asking tech-savvy family members, or verifying official apps.',
      countermeasure: 'Treat any extreme time pressure as an immediate red flag. Real banks do not freeze accounts without written branch notices.',
    },
    {
      title: '3. Fabricated Institutional Authority',
      mechanism: 'Impersonating police inspectors, CBI officers, bank fraud heads, or telecom technicians.',
      whyItWorks: 'Social conditioning instills obedience to uniformed authorities and judicial terminology.',
      countermeasure: 'Ask for the officer\'s official badge or branch location, hang up, and call the public helpline independently.',
    },
    {
      title: '4. Greed & Unearned Financial Rewards',
      mechanism: 'Promising lottery winnings, scratch card rewards of Rs 4,999, or Rs 5,000 daily for liking YouTube videos.',
      whyItWorks: 'The temptation of effortless financial gain lowers skepticism and triggers dopamine excitement.',
      countermeasure: 'No legitimate commercial firm pays thousands of rupees for rating hotels or gives random lotteries to mobile numbers.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Title & Mission */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
          <BookOpen size={14} />
          <span>Security Education & Citizen Empowerment</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Learn to Stay Safe
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Comprehensive defense guides on phishing, UPI fraud, vishing, fake job networks, and psychological deception techniques targeting Indian internet users.
        </p>
      </div>

      {/* Official Government of India Cybercrime Portal Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-800/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Official Government Portal</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Report Cyber Crime — Government of India
          </h3>
          <p className="text-xs text-slate-300">
            Visit the official National Cyber Crime Reporting Portal to report cybercrime incidents.
          </p>
        </div>
        <a
          href="https://cybercrime.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-md shadow-cyan-500/20"
        >
          <span>Visit cybercrime.gov.in</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              categoryFilter === cat
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Scam Vectors' : cat}
          </button>
        ))}
      </div>

      {/* 10 Educational Scam Modules */}
      <div className="space-y-4">
        {filteredCards.map((card) => {
          const isExpanded = expandedCardId === card.id;

          return (
            <div
              key={card.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-slate-900 border-cyan-500/40 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <button
                type="button"
                onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono uppercase text-cyan-400 font-semibold">
                      {card.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        card.severity === 'critical'
                          ? 'text-rose-400 border-rose-800 bg-rose-950/40'
                          : 'text-amber-400 border-amber-800 bg-amber-950/40'
                      }`}
                    >
                      {card.severity} threat
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-slate-400">{card.subtitle}</p>
                </div>

                <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-6">
                  {/* Simple Explanation */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase text-slate-300 font-mono">
                      How This Attack Works
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {card.simpleExplanation}
                    </p>
                  </div>

                  {/* Realistic Example */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono">
                    <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-bold">
                      Realistic Fictional Scenario:
                    </span>
                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      {card.realisticExample}
                    </p>
                  </div>

                  {/* Warning Signs & Prevention in 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Warning Signs */}
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase text-rose-400 font-mono flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>Key Warning Signs</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-rose-200/90">
                        {card.warningSigns.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-400 font-bold shrink-0">•</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention Tips */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase text-emerald-400 font-mono flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        <span>How to Protect Yourself</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-emerald-200/90">
                        {card.preventionTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Stats context */}
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    Impact Insight: {card.statsContext}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deep-Dive: Psychological Manipulation Techniques */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Deconstructing The Psychological Playbook
            </h2>
            <p className="text-xs text-slate-400">
              Why smart people fall for scams: attackers hack human cognitive psychology, not computers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {psychologicalFramework.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
            >
              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              <div className="text-xs space-y-2">
                <p className="text-slate-300">
                  <strong className="text-slate-400">The Tactic:</strong> {item.mechanism}
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  <strong className="text-slate-300">Why It Works:</strong> {item.whyItWorks}
                </p>
                <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/30 text-cyan-200 text-[11px] leading-relaxed">
                  <strong>Defensive Habit:</strong> {item.countermeasure}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
