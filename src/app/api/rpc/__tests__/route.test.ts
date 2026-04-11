import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn<[...unknown[]], Promise<Response>>()
vi.stubGlobal('fetch', mockFetch)

describe('RPC proxy route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
    vi.stubEnv('HELIUS_RPC_URL', 'https://devnet.helius-rpc.com/?api-key=test-key')
  })

  it('forwards valid JSON-RPC POST to Helius and returns response', async () => {
    const rpcResponse = { jsonrpc: '2.0', result: 'ok', id: 1 }
    mockFetch.mockResolvedValueOnce({
      status: 200,
      text: () => Promise.resolve(JSON.stringify(rpcResponse)),
    })

    const { POST } = await import('../route')
    const requestBody = JSON.stringify({ jsonrpc: '2.0', method: 'getAccountInfo', id: 1 })
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    })

    const response = await POST(request as unknown as Request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(rpcResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://devnet.helius-rpc.com/?api-key=test-key',
      expect.objectContaining({
        method: 'POST',
        body: requestBody,
      }),
    )
  })

  it('returns 503 when HELIUS_RPC_URL is not configured', async () => {
    vi.stubEnv('HELIUS_RPC_URL', '')

    const { POST } = await import('../route')
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      body: '{}',
    })

    const response = await POST(request as unknown as Request)
    expect(response.status).toBe(503)
  })

  it('returns 400 for disallowed JSON-RPC method', async () => {
    const { POST } = await import('../route')
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getHealth', id: 1 }),
    })

    const response = await POST(request as unknown as Request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe(-32601)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON body', async () => {
    const { POST } = await import('../route')
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })

    const response = await POST(request as unknown as Request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe(-32700)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 502 when upstream fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network failure'))

    const { POST } = await import('../route')
    const request = new Request('http://localhost:3000/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getBalance', id: 2 }),
    })

    const response = await POST(request as unknown as Request)
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error.code).toBe(-32603)
  })
})
