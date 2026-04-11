'use client'

import { useState } from 'react'
import { OnboardingGuide } from './onboarding-guide'

export function DevnetBanner() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-mono text-center py-1.5">
        ⚠ Devnet Mode — Transactions use test USDC, not real funds
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors ml-2"
        >
          {showGuide ? 'Hide guide' : 'New here? Get started →'}
        </button>
      </div>
      {showGuide && (
        <>
          {/* Backdrop — dims content behind guide, click to close */}
          <div
            className="fixed inset-0 top-8 z-[54] bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-8 z-[55] pt-2">
            <OnboardingGuide onClose={() => setShowGuide(false)} />
          </div>
        </>
      )}
    </>
  )
}
