import type { Page } from '@playwright/test'
import {
  healthResponse,
  vaultModerate,
  vaultAggressive,
  vaultConservative,
  mockDecisions,
  yieldsResponse,
  aiResponse,
} from './data/keeper-responses'

export async function mockKeeper(page: Page) {
  await page.route('**/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    let body: unknown

    if (path.endsWith('/v1/health')) {
      body = healthResponse
    } else if (path.endsWith('/v1/status')) {
      body = { ...healthResponse, version: '1.0.0' }
    } else if (path.match(/\/v1\/vaults\/moderate\/decisions/)) {
      body = mockDecisions.filter((d) => d.vault === 'moderate')
    } else if (path.match(/\/v1\/vaults\/aggressive\/decisions/)) {
      body = mockDecisions.filter((d) => d.vault === 'aggressive')
    } else if (path.endsWith('/v1/vaults/moderate')) {
      body = vaultModerate
    } else if (path.endsWith('/v1/vaults/aggressive')) {
      body = vaultAggressive
    } else if (path.endsWith('/v1/vaults/conservative')) {
      body = vaultConservative
    } else if (path.endsWith('/v1/vaults')) {
      body = [vaultConservative, vaultModerate, vaultAggressive]
    } else if (path.endsWith('/v1/decisions')) {
      body = mockDecisions
    } else if (path.endsWith('/v1/yields')) {
      body = yieldsResponse
    } else if (path.endsWith('/v1/ai')) {
      body = aiResponse
    } else if (path.endsWith('/v1/market-scan')) {
      body = { protocols: [], totalScanned: 0 }
    } else {
      return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not found"}' })
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}
