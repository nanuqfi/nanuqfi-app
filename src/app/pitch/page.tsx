import { Hero } from '@/components/pitch/Hero'
import { Architecture } from '@/components/pitch/Architecture'
import { StrategyEngine } from '@/components/pitch/StrategyEngine'

function Divider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
  )
}

export default function PitchPage() {
  return (
    <main>
      <Hero />
      <Divider />
      <Architecture />
      <Divider />
      <StrategyEngine />
    </main>
  )
}
