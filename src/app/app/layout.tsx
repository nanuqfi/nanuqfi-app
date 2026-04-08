import { Nav } from '@/components/app/nav'
import { SolanaProvider } from '@/providers/solana-provider'
import { ToastProvider } from '@/components/ui/toast'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <ToastProvider>
        {/* Devnet banner — fixed above nav */}
        <div className="fixed inset-x-0 top-0 z-[60] bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-mono text-center py-1.5">
          ⚠ Devnet Mode — Transactions use test USDC, not real funds
        </div>
        <Nav />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          {children}
        </main>
      </ToastProvider>
    </SolanaProvider>
  )
}
