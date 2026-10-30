import {
  MessageAnalysisResult,
  UrlAnalysisResult,
  IdentityAssessmentResult,
  MessageType,
  LanguageCode,
  ScanHistoryItem,
  BackendAnalysisResponse,
  BackendFeedbackResponse,
  BackendCompareResponse,
  BackendStatsResponse,
  BackendSampleItem,
  DetectedSignal,
  VerificationRecommendation,
} from '../types/security';
import {
  runMessageAnalysis,
  runUrlAnalysis,
  runIdentityAssessment,
  historyManager,
} from './securityEngine';

export interface ScanStage {
  stageNumber: number;
  label: string;
  detail: string;
}

export const SCAN_STAGES: ScanStage[] = [
  { stageNumber: 1, label: 'Content Sanitization', detail: 'Redacting PII and normalizing text encoding...' },
  { stageNumber: 2, label: 'Deterministic Rule Inspection', detail: 'Evaluating lookalikes, urgency, and credential harvest triggers...' },
  { stageNumber: 3, label: 'Linguistic Analysis', detail: 'Consulting Gemini safety model with isolated prompt delimiters...' },
  { stageNumber: 4, label: 'Adjudication & Guidance', detail: 'Finalizing calibrated threat tier and defensive verification steps...' },
];

/**
 * Fetch samples from the production backend endpoint GET /api/samples
 */
export async function fetchBackendSamples(): Promise<BackendSampleItem[]> {
  try {
    const res = await fetch('/api/samples');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch /api/samples from backend:', err);
    return [];
  }
}

/**
 * Fetch anonymized statistics from GET /api/stats
 */
export async function fetchBackendStats(): Promise<BackendStatsResponse | null> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch /api/stats from backend:', err);
    return null;
  }
}

/**
 * Compare message against naive baseline via POST /api/compare
 */
export async function compareWithNaiveBaseline(
  message: string,
  channel: 'email' | 'sms' | 'auto' = 'auto',
  language: 'en' | 'hi' | 'kn' | 'auto' = 'auto',
  sender?: string,
  claimed_identity?: string,
  signal?: AbortSignal
): Promise<BackendCompareResponse> {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, channel, language, sender, claimed_identity }),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Compare error ${res.status}`);
  }
  return await res.json();
}

/**
 * Submit feedback challenge via POST /api/feedback
 */
export async function submitChallengeFeedback(
  analysis_id: string,
  verdict: 'false_positive' | 'false_negative' | 'correct',
  reason?: string
): Promise<BackendFeedbackResponse> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis_id, verdict, reason }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error(errData?.error?.message || 'Analysis record expired or not found. Please re-scan the message.');
    }
    if (res.status === 409) {
      throw new Error(errData?.error?.message || 'You have already submitted a challenge for this analysis.');
    }
    if (res.status === 429) {
      throw new Error('Too many feedback requests. Please wait a moment before trying again.');
    }
    throw new Error(errData?.error?.message || `Feedback request failed with status ${res.status}`);
  }
  return await res.json();
}

/**
 * Check backend health & LLM status via GET /api/health
 */
export async function fetchHealth(): Promise<{ status: string; llm_configured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return { status: 'offline', llm_configured: false };
  }
}

/**
 * Analyzes message with honest stage progression, abort signal support, and clear fallback labeling
 */
export async function analyzeMessageWithStages(
  text: string,
  senderName: string,
  senderContact: string,
  claimedOrg: string,
  messageType: MessageType,
  language: LanguageCode,
  onStageChange: (stage: ScanStage, progressPercent: number) => void,
  abortSignal?: AbortSignal
): Promise<MessageAnalysisResult> {
  // Stage 1: Content Sanitization
  onStageChange(SCAN_STAGES[0], 25);

  let backendData: BackendAnalysisResponse | null = null;
  let backendError: Error | null = null;

  try {
    // Stage 2: Deterministic Rule Inspection
    onStageChange(SCAN_STAGES[1], 50);

    const channelParam = messageType === 'email' ? 'email' : 'sms';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s client timeout

    // Link abort signals
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => controller.abort());
    }

    // Stage 3: Linguistic Analysis
    onStageChange(SCAN_STAGES[2], 75);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        channel: channelParam,
        language: language,
        sender: senderName || senderContact || undefined,
        claimed_identity: claimedOrg || undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      backendData = await response.json();
    } else {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Backend error: ${response.status}`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Analysis was cancelled by the user.');
    }
    backendError = err;
    console.warn('Backend call failed, using client rule engine fallback:', err);
  }

  // Stage 4: Adjudication & Guidance
  onStageChange(SCAN_STAGES[3], 100);

  // If backend responded, map into MessageAnalysisResult with exact backend signals
  if (backendData) {
    const mappedSignals: DetectedSignal[] = backendData.signals.map((s) => ({
      id: s.id,
      name: s.label,
      severity: s.severity === 'HIGH' ? 'critical' : s.severity === 'MEDIUM' ? 'medium' : 'low',
      evidence: s.evidence,
      explanation: s.explanation,
      category:
        s.id.includes('DOMAIN') || s.id.includes('URL')
          ? 'domain'
          : s.id.includes('CREDENTIAL') || s.id.includes('FINANCIAL')
          ? 'financial'
          : 'urgency',
    }));

    const mappedRecs: VerificationRecommendation[] = backendData.verification_steps.map((step, idx) => ({
      action: idx === 0 ? 'Immediate Action' : idx === 1 ? 'Authentication Rule' : 'Verification Channel',
      priority: idx === 0 ? 'immediate' : 'precautionary',
      detail: step,
      isOfficialChannel: idx >= 2,
    }));

    const result: MessageAnalysisResult = {
      id: backendData.id,
      timestamp: new Date().toISOString(),
      messageText: text,
      senderName,
      senderContact,
      claimedOrg,
      messageType,
      language: backendData.detected_language === 'mixed' ? 'auto' : backendData.detected_language,
      riskScore: backendData.risk_score,
      riskLevel:
        backendData.risk_tier === 'HIGH_RISK'
          ? 'HIGH'
          : backendData.risk_tier === 'SUSPICIOUS'
          ? 'MEDIUM'
          : 'LOW',
      summary: backendData.summary,
      detectedSignals: mappedSignals,
      psychologicalAnalysis: [
        {
          type: 'fear',
          name: 'Fear & Account Disruption',
          detected: backendData.signals.some((s) => s.id === 'URGENCY_PRESSURE' || s.id === 'IMPERSONATION_AUTHORITY'),
          score: backendData.signals.some((s) => s.id === 'URGENCY_PRESSURE') ? 8 : 2,
          highlightedPhrases: backendData.signals.filter((s) => s.id === 'URGENCY_PRESSURE').map((s) => s.evidence),
          description: 'Leverages threats of account block or service disruption to cause anxiety.',
        },
        {
          type: 'urgency',
          name: 'Artificial Urgency',
          detected: backendData.signals.some((s) => s.id === 'URGENCY_PRESSURE'),
          score: backendData.signals.some((s) => s.id === 'URGENCY_PRESSURE') ? 9 : 1,
          highlightedPhrases: backendData.signals.filter((s) => s.id === 'URGENCY_PRESSURE').map((s) => s.evidence),
          description: 'Pressures the recipient to act immediately before consulting trusted sources.',
        },
        {
          type: 'fake_authority',
          name: 'Impersonation of Authority',
          detected: backendData.signals.some((s) => s.id === 'IMPERSONATION_AUTHORITY' || s.id === 'SENDER_DOMAIN_MISMATCH'),
          score: backendData.signals.some((s) => s.id === 'IMPERSONATION_AUTHORITY') ? 8 : 1,
          highlightedPhrases: backendData.signals.filter((s) => s.id === 'IMPERSONATION_AUTHORITY').map((s) => s.evidence),
          description: 'Impersonates institutions, government agencies, police, or corporate leadership.',
        },
      ],
      recommendations: mappedRecs,
      isLiveAiAnalysis: backendData.llm_used,
      analysis_source: backendData.analysis_source,
      fallback_reason: backendData.fallback_reason,
      analyzedEntities: {
        orgs: claimedOrg ? [claimedOrg] : [],
        urls: backendData.signals.filter((s) => s.id.includes('URL') || s.id.includes('DOMAIN')).map((s) => s.evidence),
        phones: senderContact ? [senderContact] : [],
        upiIds: [],
      },
      backendResponse: backendData,
    };

    // Save to scan history
    const historyItem: ScanHistoryItem = {
      id: result.id,
      timestamp: result.timestamp,
      type: messageType,
      title: claimedOrg ? `${claimedOrg} Verification` : senderName ? `${senderName} Message` : 'Suspicious Message Scan',
      preview: text.length > 90 ? text.substring(0, 87) + '...' : text,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      isDemoRecord: false,
      data: result,
    };
    historyManager.saveScan(historyItem);

    return result;
  }

  // Fallback to local heuristic engine with explicit fallback labeling
  const fallbackResult = runMessageAnalysis(
    text,
    senderName,
    senderContact,
    claimedOrg,
    messageType,
    language
  );

  const localResult: MessageAnalysisResult = {
    ...fallbackResult,
    isLiveAiAnalysis: false,
    analysis_source: 'local-fallback',
    fallback_reason: 'backend_unreachable',
    summary: `[Local Heuristic Analysis] ${fallbackResult.summary} (Backend API unreachable: ${backendError?.message || 'offline'}).`,
  };

  const historyItem: ScanHistoryItem = {
    id: localResult.id,
    timestamp: localResult.timestamp,
    type: messageType,
    title: claimedOrg ? `${claimedOrg} Verification` : senderName ? `${senderName} Message` : 'Suspicious Message Scan',
    preview: text.length > 90 ? text.substring(0, 87) + '...' : text,
    riskLevel: localResult.riskLevel,
    riskScore: localResult.riskScore,
    isDemoRecord: false,
    data: localResult,
  };
  historyManager.saveScan(historyItem);

  return localResult;
}

export async function inspectUrlWithInspection(
  url: string,
  onProgress?: (percent: number, msg: string) => void
): Promise<UrlAnalysisResult> {
  if (onProgress) {
    onProgress(50, 'Analyzing URL structure, tokens & hostname (static string inspection)...');
    await new Promise((res) => setTimeout(res, 50));
    onProgress(100, 'Compiling untrusted link assessment...');
  }

  const result = runUrlAnalysis(url);

  const historyItem: ScanHistoryItem = {
    id: result.id,
    timestamp: result.timestamp,
    type: 'url',
    title: `URL: ${result.domain || url}`,
    preview: `${url} - ${result.summary}`,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    isDemoRecord: false,
    data: result,
  };
  historyManager.saveScan(historyItem);

  return result;
}

export async function assessIdentityWithVerification(
  claimedOrg: string,
  senderEmail: string,
  senderPhone: string,
  suppliedDomain: string,
  referenceNotes: string
): Promise<IdentityAssessmentResult> {
  const result = runIdentityAssessment(
    claimedOrg,
    senderEmail,
    senderPhone,
    suppliedDomain,
    referenceNotes
  );

  const historyItem: ScanHistoryItem = {
    id: result.id,
    timestamp: result.timestamp,
    type: 'identity',
    title: `Identity Check: ${claimedOrg || senderEmail || senderPhone}`,
    preview: result.summary,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    isDemoRecord: false,
    data: result,
  };
  historyManager.saveScan(historyItem);

  return result;
}

export function saveUserFeedback(
  scanId: string,
  feedback: 'correct' | 'false_positive'
): boolean {
  try {
    const scans = historyManager.getScans();
    const target = scans.find((s) => s.id === scanId);
    if (target && target.data) {
      target.data.userFeedback = feedback;
      historyManager.saveScan(target);
    }
    // Also notify server
    submitChallengeFeedback(scanId, feedback).catch(() => {});
    return true;
  } catch {
    return false;
  }
}
