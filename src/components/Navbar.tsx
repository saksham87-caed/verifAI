import React from 'react';
import { Menu, X } from 'lucide-react';
import { SupportedLanguage } from '../i18n/translations';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onOpenQuickScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenQuickScan,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'message-scanner', label: 'Message Scanner' },
    { id: 'url-checker', label: 'Link Inspector' },
    { id: 'awareness-centre', label: 'Awareness' },
    { id: 'about', label: 'How It Works' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/10 rounded-none backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center text-white group-hover:border-white/40 group-hover:bg-white/15 transition-all">
              <Logo size={18} />
            </div>
            <span className="text-xl tracking-tight text-white font-sans whitespace-nowrap">
              verif<b className="font-extrabold text-white">AI</b>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-white/60">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/12 border border-white/30 text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Primary Action Button */}
          <button
            onClick={onOpenQuickScan}
            className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-white/90 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            Scan Message
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 glass-strong rounded-none px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all cursor-pointer ${
                currentView === link.id
                  ? 'bg-white/12 border border-white/30 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenQuickScan();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider text-black bg-white/90 rounded-lg hover:bg-white"
            >
              Scan a Suspicious Message
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
