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
    <aside className="w-64 shrink-0 glass rounded-none border-r border-white/10 border-t-0 border-b-0 border-l-0 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Workspace Kicker */}
        <div className="px-3 pt-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-white/40 font-semibold">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-white/12 text-white border border-white/30 shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
                    : 'text-white/55 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Knowledge & Protocol */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <p className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-white/40 font-semibold">
            Knowledge & Principles
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-white/12 text-white border border-white/30 shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
                    : 'text-white/55 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Defensive Shield Reminder */}
      <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10 text-[11px] text-white/60 space-y-1.5">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldAlert size={14} className="text-white" />
          <span>Defensive Shield Active</span>
        </div>
        <p className="text-white/45 leading-relaxed">
          Untrusted text inspection only. Links are never automatically visited or executed.
        </p>
      </div>
    </aside>
  );
};
