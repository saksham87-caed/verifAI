import React from 'react';
import {
  LayoutDashboard,
  MessageSquareWarning,
  Link2,
  UserCheck,
  FileSearch,
  History,
  BookOpen,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Security Dashboard', icon: LayoutDashboard },
    { id: 'message-scanner', label: 'Message Scanner', icon: MessageSquareWarning },
    { id: 'url-checker', label: 'Link Inspector', icon: Link2 },
    { id: 'identity-checker', label: 'Identity Trust', icon: UserCheck },
    { id: 'analysis-results', label: 'Analysis Report', icon: FileSearch },
    { id: 'scan-history', label: 'Scan History', icon: History },
  ];

  const secondaryNavItems = [
    { id: 'awareness-centre', label: 'Learn to Stay Safe', icon: BookOpen },
    { id: 'about', label: 'How It Works', icon: Info },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Workspace Kicker */}
        <div className="px-3 pt-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Security Operations
          </p>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Knowledge & Protocol */}
        <div className="pt-2 border-t border-slate-900 space-y-1">
          <p className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Knowledge & Principles
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Defensive Shield Reminder */}
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldAlert size={14} className="text-cyan-400" />
          <span>Defensive Shield Active</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Untrusted text inspection only. Links are never automatically visited or executed.
        </p>
      </div>
    </aside>
  );
};
