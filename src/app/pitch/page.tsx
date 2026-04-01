'use client'

import { useState } from 'react'
import { Hero } from '@/components/pitch/Hero'
import { TabBar } from '@/components/pitch/TabBar'
import { Architecture } from '@/components/pitch/Architecture'
import { StrategyEngine } from '@/components/pitch/StrategyEngine'
import { BacktestResults } from '@/components/pitch/BacktestResults'
import { LiveProof } from '@/components/pitch/LiveProof'
import { WhyNanuqfi } from '@/components/pitch/WhyNanuqfi'
import { LinksAndProof } from '@/components/pitch/LinksAndProof'

const TABS = ['Overview', 'Strategy', 'Performance', 'Live', 'Proof']

export default function PitchPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [fading, setFading] = useState(false)

  function handleTabChange(tab: string) {
    if (tab === activeTab) return
    setFading(true)
    setTimeout(() => {
      setActiveTab(tab)
      setFading(false)
    }, 200)
  }

  return (
    <main>
      <Hero />
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      <div className={`transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        {activeTab === 'Overview' && <Architecture />}
        {activeTab === 'Strategy' && <StrategyEngine />}
        {activeTab === 'Performance' && <BacktestResults />}
        {activeTab === 'Live' && <LiveProof />}
        {activeTab === 'Proof' && (
          <>
            <WhyNanuqfi />
            <LinksAndProof />
          </>
        )}
      </div>
    </main>
  )
}
