// Timeout, retry and escalation wrappers.
//
// Operational budget: a tool call gets 3s, two retries at 500ms. When the
// budget is spent the call resolves to an escalation rather than throwing, so
// a slow channel API degrades into "a human will confirm" instead of a stack
// trace or an invented answer.

import type { EngineResult, EscalationPayload } from "./types";

export const TOOL_TIMEOUT_MS = Number(process.env.BOOKING_TOOL_TIMEOUT_MS ?? 3000);
export const TOOL_RETRIES = Number(process.env.BOOKING_TOOL_RETRIES ?? 2);
export const TOOL_RETRY_DELAY_MS = Number(process.env.BOOKING_TOOL_RETRY_DELAY_MS ?? 500);

class TimeoutError extends Error {
  constructor(ms: number) {
    super(`operation exceeded ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ResilienceOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Runs `operation` under the timeout/retry budget. On exhaustion the result is
 * an escalation built by `escalate`, never a rejected promise.
 */
export async function withResilience<T>(
  operation: () => Promise<T>,
  escalate: (error: Error) => EscalationPayload,
  options: ResilienceOptions = {}
): Promise<EngineResult<T>> {
  const timeoutMs = options.timeoutMs ?? TOOL_TIMEOUT_MS;
  const retries = options.retries ?? TOOL_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? TOOL_RETRY_DELAY_MS;

  let lastError: Error = new Error("operation never ran");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return { ok: true, data: await withTimeout(operation(), timeoutMs) };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) await sleep(retryDelayMs);
    }
  }

  return { ok: false, escalation: escalate(lastError) };
}

export function isTimeout(error: Error): boolean {
  return error.name === "TimeoutError";
}
