import { Nav } from "@/components";
import { SolanaProvider } from "@/providers/solana-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <Nav />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        {children}
      </main>
    </SolanaProvider>
  );
}
