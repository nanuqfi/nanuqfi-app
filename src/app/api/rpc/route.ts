import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const rpcUrl = process.env.HELIUS_RPC_URL

  if (!rpcUrl) {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'RPC endpoint not configured' }, id: null },
      { status: 503 },
    )
  }

  const body = await request.text()

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
}
