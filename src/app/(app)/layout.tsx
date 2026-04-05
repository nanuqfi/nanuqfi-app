import { Nav } from "@/components";
import { SystemStatus } from "@/components/system-status";
import { SolanaProvider } from "@/providers/solana-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <Nav />
      <SystemStatus />
      <main className="mx-auto max-w-7xl px-6 pt-[7.5rem] pb-16">
        {children}
      </main>
    </SolanaProvider>
  );
}
