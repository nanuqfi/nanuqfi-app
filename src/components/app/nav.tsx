'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

import { SystemStatus } from '@/components/app/system-status'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/app' },
  { label: 'Vaults', href: '/app/vaults' },
  { label: 'Activity', href: '/app/activity' },
] as const

function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app'
  return pathname.startsWith(href)
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function Nav() {
  const pathname = usePathname()
  const { publicKey, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()

  return (
    <nav className="fixed inset-x-0 top-8 z-50 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left — Logo */}
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-lg font-semibold">
            <span className="text-white">Nanuq</span>
            <span className="text-sky-500">Fi</span>
          </span>
        </Link>

        {/* Center — Pill Nav */}
        <div className="hidden sm:flex items-center bg-slate-900/50 p-1 rounded-full border border-white/5">
          {NAV_ITEMS.map(({ label, href }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right — Status + Wallet */}
        <div className="flex items-center gap-3">
          <SystemStatus />

          {connected && publicKey ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 border border-white/5 hover:bg-slate-700 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {truncateAddress(publicKey.toBase58())}
            </button>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
