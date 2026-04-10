'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { reportError } from '@/lib/error-reporting'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { domain: 'render', extra: { digest: error.digest, boundary: 'app' } })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
        <p className="text-sm text-slate-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/app"
            className="px-4 py-2 bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
