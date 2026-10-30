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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Global Top Navigation Bar */}
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
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Workspace In-App Sidebar Navigation */}
          <Sidebar currentView={currentView} onNavigate={handleNavigate} />

          {/* Active Workspace View */}
          <main className="flex-1 min-w-0 bg-slate-950/50 pb-16">
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
  );
}
