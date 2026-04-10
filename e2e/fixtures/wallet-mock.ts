import type { Page } from '@playwright/test'

const MOCK_PUBKEY = 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr'

/** Inject a fake Phantom wallet into the browser before page loads */
export async function mockWallet(page: Page) {
  await page.addInitScript(`
    window.solana = {
      isPhantom: true,
      isConnected: false,
      publicKey: null,

      async connect() {
        this.isConnected = true;
        this.publicKey = {
          toBase58: () => '${MOCK_PUBKEY}',
          toBuffer: () => new Uint8Array(32),
          toBytes: () => new Uint8Array(32),
          equals: (other) => other?.toBase58?.() === '${MOCK_PUBKEY}',
          toString: () => '${MOCK_PUBKEY}',
        };
        if (this._connectListener) this._connectListener(this.publicKey);
        return { publicKey: this.publicKey };
      },

      async disconnect() {
        this.isConnected = false;
        this.publicKey = null;
        if (this._disconnectListener) this._disconnectListener();
      },

      async signTransaction(tx) { return tx; },
      async signAllTransactions(txs) { return txs; },

      _listeners: {},
      on(event, cb) {
        this._listeners[event] = cb;
        if (event === 'connect') this._connectListener = cb;
        if (event === 'disconnect') this._disconnectListener = cb;
      },
      off(event, cb) {
        delete this._listeners[event];
      },
    };
  `)
}

export { MOCK_PUBKEY }
