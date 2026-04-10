'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/error-reporting'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, { domain: 'render', extra: { digest: error.digest, boundary: 'root' } })
  }, [error])

  return (
    <div className="min-h-screen bg-[#080B11] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
        <p className="text-sm text-slate-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
