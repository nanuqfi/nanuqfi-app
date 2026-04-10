/** Mock JSON-RPC responses for Solana RPC methods */

export const MOCK_BLOCKHASH = '4xKmR8vNqJ3pTfW9bLcD2hYs6eAoUg5mXnZ7rQaBcDe'
export const MOCK_BLOCK_HEIGHT = 200_000_000
export const MOCK_SLOT = 350_000_000
export const MOCK_TX_SIGNATURE = '5wHu1qwD7q4k3fN8tPvR2jYh6cAsUg5mXnZ7rQaBcDeF9gH2iJ3kL4mN5oP6qR7sT8u'

export const rpcResponses: Record<string, (params?: unknown[]) => unknown> = {
  getLatestBlockhash: () => ({
    value: {
      blockhash: MOCK_BLOCKHASH,
      lastValidBlockHeight: MOCK_BLOCK_HEIGHT,
    },
    context: { slot: MOCK_SLOT },
  }),

  getBalance: () => ({
    value: 5_000_000_000, // 5 SOL
    context: { slot: MOCK_SLOT },
  }),

  getSlot: () => MOCK_SLOT,

  getTokenAccountBalance: () => ({
    value: {
      amount: '1000000000', // 1000 USDC (6 decimals)
      decimals: 6,
      uiAmount: 1000,
      uiAmountString: '1000',
    },
    context: { slot: MOCK_SLOT },
  }),

  getAccountInfo: () => ({
    value: {
      data: [Buffer.alloc(512).toString('base64'), 'base64'],
      executable: false,
      lamports: 10_000_000,
      owner: '11111111111111111111111111111111',
      rentEpoch: 0,
    },
    context: { slot: MOCK_SLOT },
  }),

  getTokenAccountsByOwner: () => ({
    value: [
      {
        pubkey: 'MockUsdcTokenAccount111111111111111111111111',
        account: {
          data: [Buffer.alloc(165).toString('base64'), 'base64'],
          executable: false,
          lamports: 2_039_280,
          owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          rentEpoch: 0,
        },
      },
    ],
    context: { slot: MOCK_SLOT },
  }),

  sendTransaction: () => MOCK_TX_SIGNATURE,

  getSignatureStatuses: () => ({
    value: [{ confirmationStatus: 'confirmed', err: null }],
    context: { slot: MOCK_SLOT },
  }),

  getMultipleAccounts: (params?: unknown[]) => {
    const keys = (params?.[0] as string[]) ?? []
    return {
      value: keys.map(() => ({
        data: [Buffer.alloc(512).toString('base64'), 'base64'],
        executable: false,
        lamports: 10_000_000,
        owner: '11111111111111111111111111111111',
        rentEpoch: 0,
      })),
      context: { slot: MOCK_SLOT },
    }
  },

  getRecentPrioritizationFees: () => [],

  getMinimumBalanceForRentExemption: () => 2_039_280,

  simulateTransaction: () => ({
    value: { err: null, logs: [] },
    context: { slot: MOCK_SLOT },
  }),

  getBlockHeight: () => MOCK_BLOCK_HEIGHT,

  getGenesisHash: () => 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG', // devnet
}
