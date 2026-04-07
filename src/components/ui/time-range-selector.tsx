'use client'

import { useState } from 'react'

export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'All'

const ranges: TimeRange[] = ['1W', '1M', '3M', '1Y', 'All']

interface TimeRangeSelectorProps {
  defaultRange?: TimeRange
  onChange?: (range: TimeRange) => void
  className?: string
}

export function TimeRangeSelector({
  defaultRange = '1M',
  onChange,
  className,
}: TimeRangeSelectorProps) {
  const [active, setActive] = useState<TimeRange>(defaultRange)

  function handleSelect(range: TimeRange) {
    setActive(range)
    onChange?.(range)
  }

  return (
    <div
      className={[
        'bg-slate-900/60 p-1 rounded-xl border border-white/5 inline-flex gap-0.5',
        className,
      ].filter(Boolean).join(' ')}
    >
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => handleSelect(range)}
          className={[
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150',
            active === range
              ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800',
          ].join(' ')}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
