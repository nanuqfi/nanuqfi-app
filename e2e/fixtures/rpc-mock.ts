import type { Page } from '@playwright/test'
import { rpcResponses } from './data/rpc-responses'

export async function mockRpc(page: Page) {
  await page.route('**/api/rpc', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')

    // Handle batch requests
    if (Array.isArray(body)) {
      const results = body.map((req) => ({
        jsonrpc: '2.0',
        id: req.id,
        result: rpcResponses[req.method]?.(req.params) ?? null,
      }))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(results) })
    }

    const handler = rpcResponses[body.method]
    if (!handler) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jsonrpc: '2.0', id: body.id, result: null }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jsonrpc: '2.0', id: body.id, result: handler(body.params) }),
    })
  })
}
