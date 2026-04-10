import { FadeIn } from '@/components/ui/fade-in'

const items = [
  { highlight: '526', text: 'tests' },
  { highlight: '27', text: 'on-chain instructions' },
  { highlight: 'Open', text: 'source' },
  { highlight: '3', text: 'protocols' },
]

export function TrustBar() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <FadeIn>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {items.map((item, i) => (
            <div key={item.text} className="flex items-center gap-6">
              <span className="text-sm font-mono text-slate-400">
                <span className="text-white font-semibold">
                  {item.highlight}
                </span>{' '}
                {item.text}
              </span>
              {i < items.length - 1 && (
                <span
                  className="hidden sm:block w-px h-6 bg-slate-700"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  )
}
