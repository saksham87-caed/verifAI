import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { SCAM_EDUCATION_CARDS } from '../services/securityEngine';

export const AwarenessCentre: React.FC = () => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>('edu-smishing');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'Mobile Messaging', 'Payment Systems', 'Banking Security', 'Account Takeover', 'Employment Fraud'];

  const filteredCards = categoryFilter === 'all'
    ? SCAM_EDUCATION_CARDS
    : SCAM_EDUCATION_CARDS.filter((c) => c.category === categoryFilter);

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto text-white/90">
      {/* Title & Mission */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <BookOpen size={14} />
          <span>Security Education & Citizen Empowerment</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Learn to Stay Safe
        </h1>
        <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
          Comprehensive defense guides on phishing, UPI fraud, vishing, fake job networks, and psychological deception techniques targeting Indian internet users.
        </p>
      </div>

      {/* Official Government of India Cybercrime Portal Banner */}
      <div className="p-6 rounded-2xl glass-strong border border-white/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Official Government Portal</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Report Cyber Crime — Government of India
          </h3>
          <p className="text-xs text-white/60">
            Visit the official National Cyber Crime Reporting Portal to report cybercrime incidents.
          </p>
        </div>
        <a
          href="https://cybercrime.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === cat
                ? 'bg-white text-black font-bold'
                : 'glass text-white/60 hover:text-white border-transparent'
            }`}
          >
            {cat === 'all' ? 'All Scam Vectors' : cat}
          </button>
        ))}
      </div>

      {/* Educational Scam Modules */}
      <div className="space-y-4">
        {filteredCards.map((card) => {
          const isExpanded = expandedCardId === card.id;

          return (
            <div
              key={card.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'glass-strong border-white/30 shadow-xl'
                  : 'glass border-white/15 hover:border-white/25'
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
                    <span className="text-[11px] font-mono uppercase text-white/50 font-semibold">
                      {card.category}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border text-black bg-white font-bold">
                      {card.severity} threat
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-white/60">{card.subtitle}</p>
                </div>

                <div className="p-2 rounded-xl glass text-white/70">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/10 space-y-6">
                  {/* Simple Explanation */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase text-white/80 font-mono">
                      How This Attack Works
                    </h4>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                      {card.simpleExplanation}
                    </p>
                  </div>

                  {/* Realistic Example */}
                  <div className="p-4 bg-black/40 rounded-xl border border-white/15 space-y-1 font-mono">
                    <span className="text-[10px] text-white uppercase tracking-wider block font-bold">
                      Realistic Fictional Scenario:
                    </span>
                    <p className="text-xs text-white/80 italic leading-relaxed">
                      {card.realisticExample}
                    </p>
                  </div>

                  {/* Warning Signs & Prevention in 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Warning Signs */}
                    <div className="p-4 rounded-xl glass border border-white/20 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase text-white font-mono flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>Key Warning Signs</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-white/80">
                        {card.warningSigns.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold shrink-0">•</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prevention Tips */}
                    <div className="p-4 rounded-xl glass border border-white/20 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase text-white font-mono flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        <span>How to Protect Yourself</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-white/80">
                        {card.preventionTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold shrink-0">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Stats context */}
                  <div className="p-3 bg-black/30 rounded-xl border border-white/10 text-[11px] text-white/50 font-mono">
                    Impact Insight: {card.statsContext}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deep-Dive: Psychological Manipulation Techniques */}
      <div className="p-6 sm:p-8 rounded-2xl glass-strong border border-white/18 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Deconstructing The Psychological Playbook
            </h2>
            <p className="text-xs text-white/50">
              Why smart people fall for scams: attackers hack human cognitive psychology, not computers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {psychologicalFramework.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass border border-white/15 space-y-3"
            >
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <div className="text-xs space-y-2">
                <p className="text-white/80">
                  <strong className="text-white/40">The Tactic:</strong> {item.mechanism}
                </p>
                <p className="text-white/60 leading-relaxed text-[11px]">
                  <strong className="text-white/80">Why It Works:</strong> {item.whyItWorks}
                </p>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] leading-relaxed">
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
