import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('no critical ARIA violations on key pages', async ({ page }) => {
    const pages = ['/', '/app', '/app/vaults/moderate']

    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(
        critical,
        `Critical a11y violations on ${url}: ${critical.map((v) => `${v.id}: ${v.description}`).join(', ')}`,
      ).toHaveLength(0)
    }
  })
})
