'use client'

import { ShieldCheck, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

interface Guardrail {
  label: string
  value: string
  color?: string
}

interface GuardrailCardProps {
  guardrails: Guardrail[]
  programId?: string
  className?: string
}

const DEFAULT_PROGRAM_ID =
  process.env.NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID ?? '2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P'

function truncateId(id: string): string {
  if (id.length <= 10) return id
  return `${id.slice(0, 6)}...${id.slice(-4)}`
}

export function GuardrailCard({
  guardrails,
  programId = DEFAULT_PROGRAM_ID,
  className,
}: GuardrailCardProps) {
  const solscanUrl = `https://solscan.io/account/${programId}?cluster=devnet`

  return (
    <GlassCard className={['p-6 bg-[#111622]/40', className].filter(Boolean).join(' ')}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
          On-Chain Guardrails
        </h3>
      </div>

      {/* Guardrail rows */}
      <div className="space-y-0">
        {guardrails.map((g, i) => (
          <div
            key={g.label}
            className={[
              'flex items-center justify-between py-3',
              i < guardrails.length - 1 ? 'border-b border-dashed border-white/5' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="text-sm text-slate-400">{g.label}</span>
            <span className={`font-mono text-sm ${g.color ?? 'text-slate-200'}`}>
              {g.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer — program link */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <a
          href={solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Enforced by program {truncateId(programId)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </GlassCard>
  )
}
