import React from 'react';
import {
  History,
  Search,
  Trash2,
  FileText,
  Sparkles,
  Download,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ScanHistoryItem, RiskLevel } from '../types/security';
import { historyManager } from '../services/securityEngine';
import { RiskBadge } from '../components/RiskBadge';

interface ScanHistoryPageProps {
  onViewReport: (data: any) => void;
  onOpenScanner: () => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  onViewReport,
  onOpenScanner,
}) => {
  const [scans, setScans] = React.useState<ScanHistoryItem[]>(() => historyManager.getScans());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [riskFilter, setRiskFilter] = React.useState<'ALL' | RiskLevel>('ALL');
  const [confirmClearOpen, setConfirmClearOpen] = React.useState(false);
  const [storeRawText, setStoreRawText] = React.useState<boolean>(() => historyManager.getStoreRawMessage());
  const [downloadNotice, setDownloadNotice] = React.useState(false);

  // Filtered scans
  const filteredScans = React.useMemo(() => {
    return scans.filter((item: ScanHistoryItem) => {
      const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);
      return matchesRisk && matchesSearch;
    });
  }, [scans, riskFilter, searchQuery]);

  const handleToggleStoreRaw = (val: boolean) => {
    setStoreRawText(val);
    historyManager.setStoreRawMessage(val);
  };

  const handleExportJson = () => {
    const jsonStr = historyManager.exportScans();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verifai-scan-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 2500);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    historyManager.deleteScan(id);
    setScans(historyManager.getScans());
  };

  const handleClearHistory = () => {
    historyManager.clearUserScans();
    setScans(historyManager.getScans());
    setConfirmClearOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto text-white/90">
      {/* Title & Mission */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <History size={14} />
            <span>Inspection Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Scan History
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Audit records of evaluated messages, links, and identity verifications stored locally in your browser.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export JSON Button */}
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass hover:bg-white/15 text-xs font-mono text-white border border-white/20 transition-all cursor-pointer"
            title="Export local history as JSON"
          >
            {downloadNotice ? <Check size={14} className="text-white" /> : <Download size={14} />}
            <span>{downloadNotice ? 'Exported!' : 'Export (JSON)'}</span>
          </button>

          {/* Clear History Trigger */}
          <button
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass hover:bg-white/15 text-xs font-mono text-white border border-white/20 transition-all cursor-pointer"
            title="Clear stored scans"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal / Banner for Wipe */}
      {confirmClearOpen && (
        <div className="p-4 rounded-2xl glass-strong border border-white/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 text-xs">
            <p className="font-bold text-white">Confirm Deletion of Local Scan History?</p>
            <p className="text-white/70">
              This will remove all saved scans and reset demonstration items from this browser session.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-colors cursor-pointer"
            >
              Confirm Clear
            </button>
            <button
              onClick={() => setConfirmClearOpen(false)}
              className="px-3.5 py-1.5 rounded-xl glass text-white text-xs hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Privacy Configuration Toggle & Demo Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Privacy Raw Text Toggle */}
        <div className="p-4 glass rounded-2xl border border-white/15 flex items-center justify-between text-xs">
          <div className="space-y-0.5 pr-2">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              {storeRawText ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white/40" />}
              <span>Store Raw Message Text Locally</span>
            </div>
            <p className="text-[11px] text-white/50">
              {storeRawText
                ? 'Raw text stored in browser localStorage for review.'
                : 'Raw text discarded; only metadata and signals saved.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggleStoreRaw(!storeRawText)}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all cursor-pointer ${
              storeRawText
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-white/50 border-white/10'
            }`}
          >
            {storeRawText ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Demo records clarification */}
        <div className="p-4 glass rounded-2xl border border-white/15 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-white shrink-0" />
            <span>
              <strong className="text-white">Session Privacy:</strong> Items tagged <span className="text-white font-mono text-[11px]">[DEMO]</span> are benchmark scenarios; <span className="text-white font-mono text-[11px]">[USER]</span> items reflect your live inputs.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 glass rounded-2xl border border-white/15">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scans by sender, subject, URL or preview..."
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-sans focus:outline-none"
          />
        </div>

        {/* Risk Level Segmented Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                riskFilter === r
                  ? 'bg-white text-black font-bold'
                  : 'glass text-white/60 hover:text-white border-transparent'
              }`}
            >
              {r === 'ALL' ? 'All Records' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table / List */}
      {filteredScans.length > 0 ? (
        <div className="rounded-2xl border border-white/15 glass-strong overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-white/40 bg-white/[0.02]">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Subject & Preview</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-sans">
                {filteredScans.map((item: ScanHistoryItem) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-white/50 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString()}{' '}
                      <span className="text-white/30">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Type & Demo Badge */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] uppercase text-white font-semibold block">
                        {item.type}
                      </span>
                      {item.isDemoRecord ? (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70 border border-white/15">
                          DEMO
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-black font-bold">
                          USER SCAN
                        </span>
                      )}
                    </td>

                    {/* Title & Preview */}
                    <td className="py-3 px-4 max-w-md">
                      <p className="font-semibold text-white line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">{item.preview}</p>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3 px-4">
                      <RiskBadge level={item.riskLevel} size="sm" />
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-xs tabular-nums text-white">
                      {item.riskScore}/100
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewReport(item.data)}
                          className="text-white hover:underline font-semibold text-xs cursor-pointer"
                        >
                          View Report →
                        </button>
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Delete this record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl glass border border-white/15 space-y-4">
          <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-white/50 mx-auto">
            <FileText size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No Matching Scan Records</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              {searchQuery || riskFilter !== 'ALL'
                ? 'No items match your active filters. Clear search or filter to see previous scans.'
                : 'No messages or URLs have been analysed yet.'}
            </p>
          </div>
          <button
            onClick={onOpenScanner}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
          >
            Analyse Your First Message
          </button>
        </div>
      )}
    </div>
  );
};
