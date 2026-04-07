import { Nav } from '@/components/app/nav'
import { SolanaProvider } from '@/providers/solana-provider'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <Nav />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {children}
      </main>
    </SolanaProvider>
  )
}
