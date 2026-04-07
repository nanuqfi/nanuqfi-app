import { Hero } from '@/components/marketing/hero'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { TierShowcase } from '@/components/marketing/tier-showcase'
import { AITransparency } from '@/components/marketing/ai-transparency'
import { PerformanceProof } from '@/components/marketing/performance-proof'
import { TrustBar } from '@/components/marketing/trust-bar'
import { Footer } from '@/components/marketing/footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TierShowcase />
      <AITransparency />
      <PerformanceProof />
      <TrustBar />
      <Footer />
    </>
  )
}
