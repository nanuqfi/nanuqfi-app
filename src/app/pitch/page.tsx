import { Hero } from '@/components/pitch/Hero'
import { Architecture } from '@/components/pitch/Architecture'
import { StrategyEngine } from '@/components/pitch/StrategyEngine'
import { BacktestResults } from '@/components/pitch/BacktestResults'

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
      <Divider />
      <BacktestResults />
    </main>
  )
}
