'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Vault, Activity, Wallet } from 'lucide-react'
import { Button } from './button'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vaults', label: 'Vaults', icon: Vault },
  { href: '/activity', label: 'Activity', icon: Activity },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-50">
              Nanuq<span className="text-sky-500">Fi</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/'
                ? pathname === '/'
                : pathname.startsWith(href)

              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-slate-800 text-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        <Button variant="ghost" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </nav>
  )
}
