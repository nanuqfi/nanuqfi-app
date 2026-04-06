'use client'

import { FadeIn } from '@/components/pitch/FadeIn'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkItem {
  label: string
  href: string
  description?: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEVNET_TXS: LinkItem[] = [
  {
    label: 'Deposit',
    href: 'https://solscan.io/tx/2mC3NAxJ9oLMm1wLwoiKj32411DB1Ynf4pHCiW84ATtrVcKin9PKxMV4kp1PR9yTUt1QcmmYmP5ES98HrE2xEdYN?cluster=devnet',
  },
  {
    label: 'Withdrawal',
    href: 'https://solscan.io/tx/4bsJpDc7CrrzR75vMXqhZ2rTzsVGfcqnRHoivVDJkX5dmanikz7wcXDrSnSSxQrURkBaKrxNbCiYbGyWZVV4cv7H?cluster=devnet',
  },
  {
    label: 'Rebalance',
    href: 'https://solscan.io/tx/27QZekLfghLpMnXw6AMMbBbiszY4dpy8quyKhQ7e5kymrRBhxYX8cwPDMeuM5oatrQRwS7UQFLKPMPkDoN4rbFaU?cluster=devnet',
  },
  {
    label: 'Emergency Halt',
    href: 'https://solscan.io/tx/2Xc5qAzYcEJRFq7jMeK4Gm8yKvXDxTpewZZs2y6JMM4v7hwuApXdXByKY9NhAzGJEqb5Sza41428o7zNxFJdhDhf?cluster=devnet',
  },
]

const LIVE_LINKS: LinkItem[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/nanuqfi',
    description: '3 repos: core SDK, keeper, frontend',
  },
  {
    label: 'Live App',
    href: 'https://app.nanuqfi.com',
    description: 'Dashboard + vault management',
  },
  {
    label: 'Keeper API',
    href: 'https://keeper.nanuqfi.com/v1/health',
    description: 'Health, yields, decisions',
  },
  {
    label: 'Program (Solscan)',
    href: 'https://solscan.io/account/CDhkMBnc43wJQyVaSrreXk2ojvQvZMWrAWNBLSjaRJxq?cluster=devnet',
    description: '23 instructions, deployed',
  },
]

const ROADMAP_ITEMS = [
  'Mainnet deployment after security review',
  'Additional protocols: Mango, Marginfi, Kamino',
  'Governance + third-party strategy providers',
]

// ─── Reusable external link card ──────────────────────────────────────────────

function ExternalLinkCard({ label, href, description }: LinkItem) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center justify-between hover:border-slate-700 transition-colors group"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-500">{description}</span>
        )}
      </div>
      <span className="text-slate-500 group-hover:text-slate-300 transition-colors ml-3 shrink-0 text-sm">
        ↗
      </span>
    </a>
  )
}

// ─── Sub-section heading ─────────────────────────────────────────────────────

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-slate-400 uppercase tracking-wider mb-4">
      {children}
    </h3>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function LinksAndProof() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      {/* Heading */}
      <FadeIn>
        <h2 className="text-3xl font-bold text-white text-center">
          Verify Everything
        </h2>
        <p className="text-slate-400 text-center mt-3">
          Every claim is backed by on-chain proof and live infrastructure.
        </p>
      </FadeIn>

      {/* Devnet Transactions */}
      <div className="mt-12">
        <FadeIn delay={100}>
          <SubHeading>On-Chain Proof</SubHeading>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEVNET_TXS.map((tx, i) => (
            <FadeIn key={tx.label} delay={200 + i * 100}>
              <ExternalLinkCard {...tx} />
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Live Links */}
      <div className="mt-10">
        <FadeIn delay={400}>
          <SubHeading>Explore</SubHeading>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LIVE_LINKS.map((link, i) => (
            <FadeIn key={link.label} delay={500 + i * 100}>
              <ExternalLinkCard {...link} />
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Built By */}
      <FadeIn delay={500}>
        <div className="bg-slate-900/30 border border-sky-500/20 rounded-xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-xl text-slate-200">
            Built by{' '}
            <a
              href="https://github.com/rz1989s"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-sky-400 transition-colors"
            >
              RECTOR
            </a>
          </p>
          <p className="text-sm text-slate-400 mt-3">
            Solo builder. Devnet-validated, mainnet deployment pending security review.
          </p>
        </div>
      </FadeIn>

      {/* What's Next */}
      <FadeIn delay={600}>
        <ul className="text-slate-400 text-sm space-y-2 mt-6 text-center list-none">
          {ROADMAP_ITEMS.map((item) => (
            <li key={item} className="flex items-center justify-center gap-2">
              <span className="text-sky-500/70">→</span>
              {item}
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  )
}
