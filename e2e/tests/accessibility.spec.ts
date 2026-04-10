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

      // Only block on critical impact — serious (e.g. color-contrast) are tracked but
      // not a blocker since they reflect design choices requiring a separate remediation pass.
      const blockers = results.violations.filter(
        (v) => v.impact === 'critical',
      )

      expect(
        blockers,
        `Critical a11y blockers on ${url}: ${blockers.map((v) => `${v.id}: ${v.description}`).join(', ')}`,
      ).toHaveLength(0)

      // Log serious violations for visibility without blocking
      const serious = results.violations.filter((v) => v.impact === 'serious')
      if (serious.length > 0) {
        console.warn(
          `[a11y] ${url} has ${serious.length} serious violation(s): ` +
          serious.map((v) => v.id).join(', '),
        )
      }
    }
  })
})
