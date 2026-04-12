import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_METHODS = new Set([
  'getAccountInfo', 'getBalance', 'getLatestBlockhash', 'getSlot',
  'getTokenAccountBalance', 'getTokenAccountsByOwner', 'getTransaction',
  'getSignatureStatuses', 'getMinimumBalanceForRentExemption',
  'sendTransaction', 'simulateTransaction', 'getRecentPrioritizationFees',
  'getMultipleAccounts', 'getProgramAccounts', 'getBlockHeight',
  'getGenesisHash', 'getEpochInfo', 'getVersion', 'getHealth', 'getFeeForMessage',
])

export async function POST(request: NextRequest) {
  const rpcUrl = process.env.HELIUS_RPC_URL

  if (!rpcUrl) {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'RPC endpoint not configured' }, id: null },
      { status: 503 },
    )
  }

  let body: string
  try {
    body = await request.text()
    const parsed = JSON.parse(body)

    // Support single and batch requests
    const requests = Array.isArray(parsed) ? parsed : [parsed]
    for (const req of requests) {
      if (!req.method || !ALLOWED_METHODS.has(req.method)) {
        return NextResponse.json(
          { jsonrpc: '2.0', error: { code: -32601, message: 'Method not allowed' }, id: req.id ?? null },
          { status: 400 },
        )
      }
    }
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'Upstream RPC error' }, id: null },
      { status: 502 },
    )
  }
}
