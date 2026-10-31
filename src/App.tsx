import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './views/LandingPage';
import { SecurityDashboard } from './views/SecurityDashboard';
import { MessageScanner } from './views/MessageScanner';
import { UrlSecurityChecker } from './views/UrlSecurityChecker';
import { IdentityImpersonationChecker } from './views/IdentityImpersonationChecker';
import { AnalysisResultsPage } from './views/AnalysisResultsPage';
import { ScanHistoryPage } from './views/ScanHistoryPage';
import { AwarenessCentre } from './views/AwarenessCentre';
import { AboutPage } from './views/AboutPage';
import { SupportedLanguage } from './i18n/translations';
import { MessageAnalysisResult } from './types/security';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeScanResult, setActiveScanResult] = useState<MessageAnalysisResult | null>(null);

  const handleNavigate = (view: string, scanData?: any) => {
    if (scanData) {
      setActiveScanResult(scanData);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanComplete = (result: MessageAnalysisResult) => {
    setActiveScanResult(result);
    setCurrentView('analysis-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLanding = currentView === 'landing';

  return (
    <div className="relative min-h-screen bg-[#050505] text-white/90 flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Fixed Grayscale Background Orbs & Ambient Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/[0.09] blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-white/[0.07] blur-[140px]" />
        <div className="absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] rounded-full bg-neutral-300/[0.05] blur-[160px]" />
        <div className="absolute top-2/3 right-1/3 w-80 h-80 rounded-full bg-white/[0.06] blur-[100px]" />
      </div>

      {/* Global Top Navigation Bar */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          language={language}
          onLanguageChange={setLanguage}
          onOpenQuickScan={() => handleNavigate('message-scanner')}
        />

        {/* Main Content Layout */}
        {isLanding ? (
          <main className="flex-1">
            <LandingPage onNavigate={handleNavigate} language={language} />
          </main>
        ) : (
          <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
            {/* Workspace In-App Sidebar Navigation */}
            <Sidebar currentView={currentView} onNavigate={handleNavigate} />

            {/* Active Workspace View */}
            <main className="flex-1 min-w-0 pb-16">
              {currentView === 'dashboard' && (
                <SecurityDashboard
                  onNavigate={handleNavigate}
                  onOpenScanner={() => handleNavigate('message-scanner')}
                />
              )}

              {currentView === 'message-scanner' && (
                <MessageScanner onScanComplete={handleScanComplete} />
              )}

              {currentView === 'url-checker' && <UrlSecurityChecker />}

              {currentView === 'identity-checker' && <IdentityImpersonationChecker />}

              {currentView === 'analysis-results' && (
                <AnalysisResultsPage
                  result={activeScanResult}
                  onBackToScanner={() => handleNavigate('message-scanner')}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'scan-history' && (
                <ScanHistoryPage
                  onViewReport={(data) => handleNavigate('analysis-results', data)}
                  onOpenScanner={() => handleNavigate('message-scanner')}
                />
              )}

              {currentView === 'awareness-centre' && <AwarenessCentre />}

              {currentView === 'about' && <AboutPage />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
