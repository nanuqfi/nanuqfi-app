import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('RPC proxy route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('HELIUS_RPC_URL', 'https://devnet.helius-rpc.com/?api-key=test-key')
  })

  it('forwards valid JSON-RPC POST to Helius and returns response', async () => {
    const rpcResponse = { jsonrpc: '2.0', result: 'ok', id: 1 }
    mockFetch.mockResolvedValueOnce({
      status: 200,
      text: () => Promise.resolve(JSON.stringify(rpcResponse)),
    })

    const { POST } = await import('../route')
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getHealth', id: 1 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(rpcResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://devnet.helius-rpc.com/?api-key=test-key',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('returns 503 when HELIUS_RPC_URL is not configured', async () => {
    vi.stubEnv('HELIUS_RPC_URL', '')

    // Re-import to pick up new env
    vi.resetModules()
    const { POST } = await import('../route')
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      body: '{}',
    })

    const response = await POST(request as any)
    expect(response.status).toBe(503)
  })
})
