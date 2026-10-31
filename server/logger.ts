/**
 * Privacy-Preserving Security Logger
 * Hard rule: Never log message text, evidence substrings, sender names, or reasons.
 * Log only IDs, risk tiers, signal IDs, timestamps, timings, and error codes.
 */

export interface LogEvent {
  event: string;
  id?: string;
  tier?: string;
  signals?: string[];
  durationMs?: number;
  errorCode?: string;
  status?: number;
}

export const secLog = {
  info(msg: string, meta?: LogEvent): void {
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.log(`[verifAI][INFO] ${msg}${metaStr}`);
  },

  warn(msg: string, meta?: LogEvent): void {
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.warn(`[verifAI][WARN] ${msg}${metaStr}`);
  },

  error(msg: string, meta?: LogEvent): void {
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.error(`[verifAI][ERROR] ${msg}${metaStr}`);
  },
};
