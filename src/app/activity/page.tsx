import { Bot, Cpu, Clock } from 'lucide-react'
import { Card, Badge } from '@/components'
import {
  mockDecisions,
  formatRelativeTime,
  sourceDisplayName,
} from '@/lib/mock-data'

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-slate-400">
          Every decision the keeper makes is logged and transparent.
        </p>
      </div>

      <Card>
        <div className="divide-y divide-slate-700">
          {mockDecisions.map((decision) => (
            <div key={decision.id} className="flex gap-4 py-6 first:pt-0 last:pb-0">
              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  decision.aiInvolved ? 'bg-sky-500/10' : 'bg-slate-700'
                }`}>
                  {decision.aiInvolved
                    ? <Bot className="h-5 w-5 text-sky-400" />
                    : <Cpu className="h-5 w-5 text-slate-400" />
                  }
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge level={decision.vault} />
                  <span className="rounded-lg bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200">
                    {decision.action}
                  </span>
                  {decision.aiInvolved && (
                    <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400 border border-sky-500/20">
                      <Bot className="h-3 w-3" />
                      AI
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(decision.timestamp)}
                  </span>
                </div>

                <p className="text-slate-200">{decision.summary}</p>
                <p className="text-sm text-slate-400">{decision.reason}</p>

                {decision.weightChanges.length > 0 && (
                  <div className="flex flex-wrap gap-4 rounded-lg bg-slate-900/50 px-4 py-3">
                    {decision.weightChanges.map((change, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">{sourceDisplayName(change.source)}</span>
                        <span className="font-mono text-red-400">{change.from}%</span>
                        <span className="text-slate-600">&rarr;</span>
                        <span className="font-mono text-emerald-400">{change.to}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
