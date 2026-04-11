'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="fixed inset-x-0 top-8 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left — Logo */}
        <Link href="/app" className="flex items-center gap-2.5">
          <img src="/assets/logo.png" alt="NanuqFi" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-semibold">
            <span className="text-white">Nanuq</span>
            <span className="text-sky-500">Fi</span>
          </span>
        </Link>

        {/* Center — Pill Nav (desktop) */}
        <div className="hidden sm:flex items-center bg-slate-900/50 p-1 rounded-full border border-white/5">
          {NAV_ITEMS.map(({ label, href }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
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

        {/* Right — Strategy + Status + Wallet + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/strategy"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Strategy
          </Link>

          <SystemStatus />

          {connected && publicKey ? (
            <button
              type="button"
              onClick={() => disconnect()}
              aria-label={`Disconnect wallet ${truncateAddress(publicKey.toBase58())}`}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 border border-white/5 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              {truncateAddress(publicKey.toBase58())}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisible(true)}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors cursor-pointer"
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile hamburger — visible below sm breakpoint */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMobileOpen(prev => !prev)}
            className="sm:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-white/5 bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          id="mobile-nav-menu"
          role="menu"
          className="sm:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map(({ label, href }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                aria-current={active ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/strategy"
            role="menuitem"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Strategy Docs
          </Link>
        </div>
      )}
    </nav>
  )
}
