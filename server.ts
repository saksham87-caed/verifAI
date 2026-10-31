import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import {
  AnalyzeRequestSchema,
  FeedbackRequestSchema,
  AnalysisResponse,
  CompareResponse,
} from './server/types';
import { redactPii, sanitizeHtml } from './server/redaction';
import { runRuleEngine } from './server/rules';
import { enhanceWithLlm } from './server/llm';
import { memoryStore } from './server/store';
import { SYNTHETIC_DATASET } from './server/dataset';
import { runNaiveKeywordFilter } from './server/naiveFilter';
import { secLog } from './server/logger';

dotenv.config();

const app = express();
process.env.PORT = '3000';
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy for accurate client IP rate limiting behind Cloud Run / reverse proxies
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false, frameguard: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));

// Body parser with 20kb limit
app.use(express.json({ limit: '20kb' }));

// 413 Payload Too Large handler for JSON bodies
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds 20kb size limit.',
      },
    });
    return;
  }
  next(err);
});

// Standard Rate Limit error handler
const createLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
        },
      });
    },
  });

const analyzeLimiter = createLimiter(
  60 * 1000,
  30,
  'Too many analysis requests. Please wait a moment before analyzing another message.'
);

const compareLimiter = createLimiter(
  60 * 1000,
  30,
  'Too many comparison requests. Please wait a moment before comparing again.'
);

const feedbackLimiter = createLimiter(
  60 * 1000,
  10,
  'Too many feedback submissions. Please wait before submitting more feedback.'
);

const generalApiLimiter = createLimiter(
  60 * 1000,
  120,
  'Too many requests to the verifAI API. Please slow down.'
);

app.use('/api', generalApiLimiter);

// Helper for unique ID generation
function generateId(): string {
  return `tl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ================= API ENDPOINTS =================

// 1. POST /api/analyze
app.post('/api/analyze', analyzeLimiter, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: errorMsg,
        },
      });
      return;
    }

    const { message, channel, language, sender, claimed_identity } = parseResult.data;

    // Handle whitespace-only
    if (!message.trim()) {
      res.status(400).json({
        error: {
          code: 'EMPTY_INPUT',
          message: 'Message cannot be empty or only whitespace.',
        },
      });
      return;
    }

    // Sanitize HTML and truncate if needed
    let sanitizedText = sanitizeHtml(message);
    if (sanitizedText.length > 5000) {
      sanitizedText = sanitizedText.substring(0, 5000);
    }

    // 1. Redact PII (strict privacy & defensive prompt-injection boundary)
    const { redactedText, redactions } = redactPii(sanitizedText);

    // 2. Deterministic rule engine execution (Source of Truth)
    const ruleResult = runRuleEngine(
      sanitizedText,
      channel,
      language,
      sender,
      claimed_identity
    );

    // 3. AI / LLM linguistic enhancement with safe fallback & prompt pre-redaction
    const enhanced = await enhanceWithLlm(
      sanitizedText,
      redactedText,
      ruleResult,
      language !== 'auto' ? language : undefined,
      claimed_identity,
      sender
    );

    const responsePayload: AnalysisResponse = {
      id: generateId(),
      risk_tier: enhanced.risk_tier,
      risk_score: enhanced.risk_score,
      confidence: enhanced.confidence,
      detected_language: enhanced.detected_language,
      channel: enhanced.channel,
      signals: enhanced.signals,
      summary: enhanced.summary,
      verification_steps: enhanced.verification_steps,
      safe_signals: ruleResult.safe_signals,
      redactions,
      llm_used: enhanced.llm_used,
      analysis_source: enhanced.analysis_source,
      fallback_reason: enhanced.fallback_reason,
      disclaimer: enhanced.disclaimer,
    };

    // Store in-memory for reporting dashboard & feedback challenge (raw message is NOT stored)
    memoryStore.recordAnalysis(responsePayload);

    secLog.info('Analysis completed', {
      event: 'analyze_success',
      id: responsePayload.id,
      tier: responsePayload.risk_tier,
      signals: responsePayload.signals.map((s) => s.id),
      durationMs: Date.now() - startTime,
    });

    res.json(responsePayload);
  } catch (err: any) {
    secLog.error('Error during analysis', {
      event: 'analyze_error',
      errorCode: err?.code || 'UNKNOWN_ERROR',
      durationMs: Date.now() - startTime,
    });
    next(err);
  }
});

// 2. POST /api/feedback (Challenge false positive with deduplication and 404/409 handling)
app.post('/api/feedback', feedbackLimiter, (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = FeedbackRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: errorMsg,
        },
      });
      return;
    }

    const { analysis_id, verdict, reason } = parseResult.data;
    const clientKey = String(req.ip || 'anonymous-client');

    const result = memoryStore.recordFeedback(analysis_id, verdict, reason, clientKey);
    res.status(result.status).json(result.body);
  } catch (err: any) {
    secLog.error('Error recording feedback', {
      event: 'feedback_error',
      errorCode: err?.code || 'UNKNOWN_ERROR',
    });
    next(err);
  }
});

// 3. GET /api/stats (Anonymized dashboard statistics - real operational metrics)
app.get('/api/stats', (_req: Request, res: Response) => {
  res.json(memoryStore.getStats());
});

// 4. GET /api/samples (Curated synthetic dataset for test buttons)
app.get('/api/samples', (_req: Request, res: Response) => {
  res.json(SYNTHETIC_DATASET);
});

// 5. POST /api/compare (Live before vs after demo: naive baseline vs TrustLens)
app.post('/api/compare', compareLimiter, (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e) => e.message).join(', ');
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: errorMsg,
        },
      });
      return;
    }

    const { message, channel, language, sender, claimed_identity } = parseResult.data;
    const sanitizedText = sanitizeHtml(message);

    // Run naive keyword baseline
    const naiveResult = runNaiveKeywordFilter(sanitizedText);

    // Run TrustLens deterministic rules
    const ruleResult = runRuleEngine(sanitizedText, channel, language, sender, claimed_identity);

    let comparison_insight = '';
    if (naiveResult.tier === 'HIGH_RISK' && ruleResult.risk_tier === 'SAFE') {
      comparison_insight =
        'The naive keyword filter triggered a FALSE POSITIVE because it matched words like "bank" or "verify". verifAI recognized legitimate DLT headers, absence of untrusted URLs, and benign context.';
    } else if (naiveResult.tier === 'SAFE' && ruleResult.risk_tier === 'HIGH_RISK') {
      comparison_insight =
        'The naive keyword filter MISSED this attack (False Negative) because the message used a polite, non-urgent tone. verifAI successfully detected lookalike domains and credential solicitation.';
    } else if (ruleResult.risk_tier === 'HIGH_RISK') {
      comparison_insight =
        'Both flagged the message, but verifAI provides exact evidence offsets, cites lookalike domain mechanics, and provides actionable verification guidance.';
    } else {
      comparison_insight =
        'Both evaluated the message as low risk, but verifAI verified institutional domain provenance rather than just scanning for keywords.';
    }

    const comparePayload: CompareResponse = {
      id: generateId(),
      naive_baseline: naiveResult,
      trustlens: {
        risk_tier: ruleResult.risk_tier,
        risk_score: ruleResult.risk_score,
        signals_count: ruleResult.signals.length,
        top_signals: ruleResult.signals.map((s) => s.label),
        summary: ruleResult.summary,
        advantage:
          'Inspects full URL entropy, homoglyphs, and Indian institutional provenance without executing code.',
      },
      comparison_insight,
    };

    res.json(comparePayload);
  } catch (err: any) {
    secLog.error('Error during compare', {
      event: 'compare_error',
      errorCode: err?.code || 'UNKNOWN_ERROR',
    });
    next(err);
  }
});

// 6. GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    llm_configured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Global Error Handler: Clean JSON 500 without stack trace
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  secLog.error('Unhandled server error', {
    event: 'internal_error',
    errorCode: err?.code || 'INTERNAL_SERVER_ERROR',
  });
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'A secure processing error occurred. Please try again.',
    },
  });
});

// ================= FRONTEND SERVING =================
async function startServer() {
  if (!isProd) {
    // Development mode: Mount Vite middlewares for hot editing and SPA serving
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for non-API routes to ensure "/" and all client routes return index.html
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          const template = fs.readFileSync(indexPath, 'utf-8');
          const html = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production mode: Serve built dist directory with fallback to index.html
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      const distIndex = path.join(distPath, 'index.html');
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.sendFile(path.resolve(process.cwd(), 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => console.log("Server running on " + PORT));
}

startServer().catch((err) => {
  secLog.error('Failed to start verifAI server', {
    event: 'startup_failure',
    errorCode: err?.code || 'STARTUP_ERROR',
  });
  process.exit(1);
});
