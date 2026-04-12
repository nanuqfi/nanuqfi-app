'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import '@solana/wallet-adapter-react-ui/styles.css'
import { DEVNET_GENESIS_HASH, DEVNET_RPC_FALLBACK } from '@/lib/network-config'

// ─── Constants ────────────────────────────────────────────────────────────────

const RPC_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/rpc`
  : (process.env.HELIUS_RPC_URL ?? DEVNET_RPC_FALLBACK)

// ─── Network Guard ────────────────────────────────────────────────────────────

/**
 * Inner component that has access to wallet + connection context.
 * Checks genesis hash on wallet connect and warns if not devnet.
 */
function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection()
  const { connected } = useWallet()
  const [wrongNetwork, setWrongNetwork] = useState(false)

  const checkNetwork = useCallback(async () => {
    try {
      const genesisHash = await connection.getGenesisHash()
      setWrongNetwork(genesisHash !== DEVNET_GENESIS_HASH)
    } catch {
      // If we can't reach the RPC, don't block the user — warn silently.
      setWrongNetwork(false)
    }
  }, [connection])

  useEffect(() => {
    if (connected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- async: setState runs after await, not synchronously
      checkNetwork()
    } else {
      setWrongNetwork(false)
    }
  }, [connected, checkNetwork])

  return (
    <>
      {wrongNetwork && (
        <div
          role="alert"
          className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-black text-sm font-semibold text-center py-2 px-4"
        >
          Wrong network — NanuqFi runs on Solana Devnet. Switch your wallet network to continue.
        </div>
      )}
      {children}
    </>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Phantom auto-registers as a Standard Wallet — no explicit adapter needed
  const wallets = useMemo(() => [
    new SolflareWalletAdapter(),
  ], [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: prevents hydration mismatch with wallet adapter
  useEffect(() => { setMounted(true) }, [])

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <NetworkGuard>
            {mounted ? children : null}
          </NetworkGuard>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
