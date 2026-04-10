import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Activity page', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('decision feed loads with entries', async ({ page }) => {
    await page.goto('/app/activity')

    // Wait for decisions to load — keeper mock returns decisions with action "rebalance" and "hold"
    await expect(page.locator('text=/rebalance|hold/i').first()).toBeVisible({ timeout: 10_000 })

    // Page title visible
    await expect(page.locator('text=AI Activity').first()).toBeVisible()
  })

  test('decision detail panel opens on click', async ({ page }) => {
    await page.goto('/app/activity')

    // Wait for feed to load
    await expect(page.locator('text=/rebalance|hold/i').first()).toBeVisible({ timeout: 10_000 })

    // First decision is auto-selected by default — DecisionDetail panel shows "Reasoning" heading
    // or the decision reason text. The detail renders a GlassCard with decision info.
    // Click a decision feed item button to select it explicitly
    const feedButtons = page.locator('button').filter({ hasText: /rebalance|hold/i })
    if (await feedButtons.count() > 0) {
      await feedButtons.first().click()
    }

    // DecisionDetail shows reasoning — the mock reason contains "AI confidence" or "Algorithm"
    await expect(
      page.locator('text=/AI confidence|Algorithm|Kamino|range-bound/i').first()
    ).toBeVisible({ timeout: 5_000 })
  })
})
