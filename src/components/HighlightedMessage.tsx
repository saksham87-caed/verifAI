import React from 'react';
import { BackendSignal } from '../types/security';

interface HighlightedMessageProps {
  text: string;
  signals?: BackendSignal[];
  redactions?: string[];
}

interface SpanSegment {
  start: number;
  end: number;
  signal?: BackendSignal;
  isRedaction?: boolean;
}

export const HighlightedMessage: React.FC<HighlightedMessageProps> = ({
  text,
  signals = [],
  redactions = [],
}) => {
  if (!text) return null;

  // Collect highlight spans
  const spans: SpanSegment[] = [];

  // 1. Collect valid spans from signals
  for (const sig of signals) {
    let s = sig.start;
    let e = sig.end;

    // Fallback: If offsets are invalid or 0, try exact substring match
    if ((s === 0 && e === 0) || s < 0 || e > text.length || s >= e) {
      if (sig.evidence && sig.evidence.trim().length > 0) {
        const found = text.indexOf(sig.evidence);
        if (found !== -1) {
          s = found;
          e = found + sig.evidence.length;
        }
      }
    }

    if (s >= 0 && e <= text.length && s < e) {
      spans.push({ start: s, end: e, signal: sig });
    }
  }

  // 2. Collect redaction token spans (e.g. [PHONE], [EMAIL], [ID], [CARD], [OTP], [UPI])
  const redactionTokens = ['[PHONE]', '[EMAIL]', '[ID]', '[CARD]', '[OTP]', '[UPI]'];
  for (const token of redactionTokens) {
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const idx = text.indexOf(token, searchFrom);
      if (idx === -1) break;
      spans.push({ start: idx, end: idx + token.length, isRedaction: true });
      searchFrom = idx + token.length;
    }
  }

  // Sort spans by start offset
  spans.sort((a, b) => a.start - b.start);

  // Merge/resolve non-overlapping slices
  const segments: Array<{ text: string; signal?: BackendSignal; isRedaction?: boolean }> = [];
  let currentIdx = 0;

  for (const span of spans) {
    let s = span.start;
    const e = span.end;

    if (s < currentIdx) {
      if (e > currentIdx) {
        s = currentIdx;
      } else {
        continue;
      }
    }

    // Normal text before this highlight
    if (s > currentIdx) {
      segments.push({
        text: text.slice(currentIdx, s),
      });
    }

    // Highlighted segment
    segments.push({
      text: text.slice(s, e),
      signal: span.signal,
      isRedaction: span.isRedaction,
    });

    currentIdx = e;
  }

  // Trailing text
  if (currentIdx < text.length) {
    segments.push({
      text: text.slice(currentIdx),
    });
  }

  return (
    <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
      {segments.map((seg, i) => {
        if (seg.isRedaction) {
          return (
            <mark
              key={i}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-white/20 border border-white/40 text-white font-bold not-italic underline decoration-dotted"
              title="Redacted PII element: Never stored or sent to AI"
            >
              {seg.text}
            </mark>
          );
        }

        if (seg.signal) {
          const isHigh = seg.signal.severity === 'HIGH';
          const isMed = seg.signal.severity === 'MEDIUM';

          const markClasses = isHigh
            ? 'bg-white text-black font-extrabold px-1.5 py-0.5 rounded-xs underline decoration-solid decoration-2 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
            : isMed
            ? 'bg-white/25 border-b-2 border-white text-white font-semibold px-1 py-0.5 rounded-xs underline decoration-dashed'
            : 'bg-white/10 border-b border-white/40 text-white/90 font-medium px-1 py-0.5 rounded-xs underline decoration-wavy';

          return (
            <mark
              key={i}
              className={`${markClasses} not-italic transition-all duration-150 inline-block`}
              title={`[${seg.signal.label}]: ${seg.signal.explanation}`}
            >
              {seg.text}
            </mark>
          );
        }

        // Regular safe text - React escapes this automatically
        return <span key={i}>{seg.text}</span>;
      })}
    </div>
  );
};
