/**
 * Error reporting module — foundation for Sentry integration.
 *
 * Currently logs to console with structured context. When NEXT_PUBLIC_SENTRY_DSN
 * is set and @sentry/nextjs is installed, swap the console calls for
 * Sentry.captureException / Sentry.captureMessage.
 *
 * SENTRY INTEGRATION CHECKLIST:
 * 1. pnpm add @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs  (generates sentry.*.config.ts + next.config update)
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in .env.local and Vercel env vars
 * 4. Replace console.error calls below with Sentry.captureException(error, { extra: context })
 * 5. Remove the DSN guard — Sentry SDK handles missing DSN gracefully
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ErrorContext {
  /** Logical area of the app where the error occurred. */
  domain?: 'rpc' | 'keeper-api' | 'transaction' | 'render' | 'unknown'
  /** Any extra key-value pairs for debugging. */
  extra?: Record<string, unknown>
  /** User's wallet address if connected — helps correlate on-chain errors. */
  user?: string
}

// ─── Core ────────────────────────────────────────────────────────────────────

/**
 * Report an error with optional context.
 *
 * In development: always logs to console.
 * In production without DSN: logs to console (won't lose errors, just no aggregation).
 * In production with DSN (once Sentry is wired): sends to Sentry.
 */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error))
  const { domain = 'unknown', extra, user } = context

  if (process.env.NODE_ENV !== 'production' || !SENTRY_DSN) {
    // Development / no-DSN: structured console output for traceability.
    console.error('[NanuqFi Error]', {
      domain,
      message: err.message,
      stack: err.stack,
      user,
      ...extra,
    })
    return
  }

  // TODO: replace with Sentry.captureException after integration:
  // Sentry.captureException(err, { extra: { domain, user, ...extra } })

  // Fallback until Sentry is wired — never silently drop errors.
  console.error('[NanuqFi Error]', domain, err.message)
}

/**
 * Report a non-fatal warning or informational event.
 * Useful for keeper API degradation, stale data, or guardrail triggers.
 */
export function reportWarning(message: string, context: ErrorContext = {}): void {
  const { domain = 'unknown', extra } = context

  if (process.env.NODE_ENV !== 'production' || !SENTRY_DSN) {
    console.warn('[NanuqFi Warning]', { domain, message, ...extra })
    return
  }

  // TODO: replace with Sentry.captureMessage after integration:
  // Sentry.captureMessage(message, { level: 'warning', extra: { domain, ...extra } })
  console.warn('[NanuqFi Warning]', domain, message)
}
