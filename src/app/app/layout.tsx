import { Nav } from '@/components/app/nav'
import { SolanaProvider } from '@/providers/solana-provider'
import { ToastProvider } from '@/components/ui/toast'
import { DevnetBanner } from '@/components/app/devnet-banner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <ToastProvider>
        <DevnetBanner />
        <Nav />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          {children}
        </main>
      </ToastProvider>
    </SolanaProvider>
  )
}
