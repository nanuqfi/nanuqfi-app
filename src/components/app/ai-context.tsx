import { Sparkles } from 'lucide-react'

interface AIContextProps {
  text: string
  className?: string
}

export function AIContext({ text, className }: AIContextProps) {
  return (
    <div
      className={[
        'flex items-start gap-1.5',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Sparkles className="h-3 w-3 shrink-0 text-slate-500 mt-0.5" />
      <p className="text-[11px] text-slate-500 italic leading-relaxed">
        {text}
      </p>
    </div>
  )
}
