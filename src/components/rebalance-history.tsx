'use client'

import { useState } from 'react'
import { History, CheckCircle, XCircle, Hash, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/card'
import { useRebalanceRecords, type RebalanceRecordAccount } from '@/hooks/use-allocator'
import { sourceDisplayName } from '@/lib/mock-data'

// ─── Constants ─────────────────────────────────────────────────────────────

const DISPLAY_LIMIT = 10

/** Strategy slugs indexed by weight position (matches on-chain allocator order). */
const WEIGHT_INDEX_SOURCES = [
  'kamino-lending',
  'marginfi-lending',
  'lulo-lending',
  'lulo-lending',   // index 3 — spare slot
  'kamino-lending', // index 4 — spare slot
]

// ─── Helpers ───────────────────────────────────────────────────────────────

function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`
}

function truncateHash(hash: Uint8Array): string {
  if (hash.length === 0) return 'n/a'
  const hex = Array.from(hash.slice(0, 6))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `0x${hex}...`
}

/**
 * Approximate a Solana slot to a timestamp.
 * Solana averages ~400ms per slot. Devnet launched around slot 0 at epoch 0.
 * This is a rough approximation — acceptable for UI display.
 */
function slotToApproxDate(slot: bigint): string {
  // Use a known reference: assume current slot ~ Date.now()
  // This is imprecise but useful for relative display.
  // A more accurate approach would query getBlockTime, but that's an extra RPC call per record.
  const slotNum = Number(slot)
  if (slotNum === 0) return 'Genesis'

  // Approximate: 2.5 slots/sec = 400ms/slot
  // We'll show the raw slot number + a "~X ago" estimate
  return `Slot ${slotNum.toLocaleString()}`
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function RecordSkeleton() {
  return (
    <div className="flex gap-4 py-4">
      <div className="animate-pulse rounded bg-slate-700 h-8 w-8 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="animate-pulse rounded bg-slate-700 h-4 w-48" />
        <div className="animate-pulse rounded bg-slate-700 h-3 w-full" />
        <div className="animate-pulse rounded bg-slate-700 h-3 w-3/4" />
      </div>
    </div>
  )
}

// ─── Weight Change Row ─────────────────────────────────────────────────────

function WeightChanges({
  previousWeights,
  newWeights,
}: {
  previousWeights: number[]
  newWeights: number[]
}) {
  const maxLen = Math.max(previousWeights.length, newWeights.length)
  if (maxLen === 0) return null

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
      {Array.from({ length: maxLen }, (_, i) => {
        const prev = previousWeights[i] ?? 0
        const next = newWeights[i] ?? 0
        if (prev === 0 && next === 0) return null
        const sourceName = WEIGHT_INDEX_SOURCES[i] ?? `Source ${i}`
        const changed = prev !== next

        return (
          <span key={i} className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400">{sourceDisplayName(sourceName)}</span>
            <span className={changed ? 'text-red-400' : 'text-slate-500'}>
              {bpsToPercent(prev)}
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className={changed ? 'text-emerald-400' : 'text-slate-500'}>
              {bpsToPercent(next)}
            </span>
          </span>
        )
      })}
    </div>
  )
}

// ─── Weight Bar Visualization ──────────────────────────────────────────────

function WeightBar({ weights, label }: { weights: number[]; label: string }) {
  const total = weights.reduce((s, w) => s + w, 0)
  if (total === 0) return null

  const colors = [
    'bg-sky-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-sky-400',
    'bg-emerald-500',
  ]

  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
        {weights.map((w, i) => {
          if (w === 0) return null
          return (
            <div
              key={i}
              className={`${colors[i % colors.length]} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(w / total) * 100}%`, opacity: 0.5 + (w / total) * 0.5 }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Single Record Row ─────────────────────────────────────────────────────

function RecordRow({ record }: { record: RebalanceRecordAccount }) {
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            record.approved ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}>
            {record.approved
              ? <CheckCircle className="h-4 w-4 text-emerald-400" />
              : <XCircle className="h-4 w-4 text-red-400" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-200">
                Rebalance #{record.counter}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                record.approved
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {record.approved ? 'Approved' : 'Rejected'}
              </span>
            </div>
            <span className="text-xs text-slate-500">{slotToApproxDate(record.slot)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Hash className="h-3 w-3" />
          <span className="font-mono">{truncateHash(record.aiReasoningHash)}</span>
        </div>
      </div>

      {/* Weight bars */}
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-900/50 px-4 py-3">
        <WeightBar weights={record.previousWeights} label="Before" />
        <WeightBar weights={record.newWeights} label="After" />
      </div>

      {/* Detailed weight changes */}
      <WeightChanges
        previousWeights={record.previousWeights}
        newWeights={record.newWeights}
      />
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700">
        <History className="h-6 w-6 text-slate-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-300">No on-chain rebalances yet</p>
        <p className="max-w-sm text-xs text-slate-500">
          On-chain rebalance records will appear here after the keeper submits its first
          rebalance transaction. Each record is permanently stored on Solana.
        </p>
      </div>
    </div>
  )
}

// ─── Error State ───────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <XCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

interface RebalanceHistoryProps {
  riskLevel: number
}

export function RebalanceHistory({ riskLevel }: RebalanceHistoryProps) {
  const { data, loading, error } = useRebalanceRecords(riskLevel)
  const [showAll, setShowAll] = useState(false)

  const records = data ?? []
  const hasMore = records.length > DISPLAY_LIMIT
  const displayRecords = showAll ? records : records.slice(0, DISPLAY_LIMIT)

  return (
    <Card header={
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-sky-400" />
          On-Chain Rebalance Audit
        </h2>
        {records.length > 0 && (
          <span className="text-xs text-slate-500 font-mono">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    }>
      {loading ? (
        <div className="divide-y divide-slate-700">
          <RecordSkeleton />
          <RecordSkeleton />
          <RecordSkeleton />
        </div>
      ) : error ? (
        <ErrorState message="Failed to fetch on-chain rebalance records. Check RPC connection." />
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="divide-y divide-slate-700">
            {displayRecords.map((record) => (
              <RecordRow key={record.counter} record={record} />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-900/50 py-2 text-sm text-sky-400 hover:bg-slate-900/80 transition-colors cursor-pointer"
            >
              {showAll ? (
                <>Show less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>View all {records.length} records <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          )}
        </>
      )}
    </Card>
  )
}
