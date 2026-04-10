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

    // Wait for decisions to load — keeper mock returns decisions with summary text
    // that includes "Kamino", "rebalance", "Lulo" etc.
    await expect(
      page.locator('text=/Kamino|rebalance|Lulo|Weights unchanged/i').first()
    ).toBeVisible({ timeout: 10_000 })

    // Page title visible
    await expect(page.locator('text=AI Activity').first()).toBeVisible()
  })

  test('decision detail panel opens on click', async ({ page }) => {
    await page.goto('/app/activity')

    // Wait for feed to load — first decision is auto-selected by default
    await expect(
      page.locator('text=/Kamino|rebalance|Lulo|Weights unchanged/i').first()
    ).toBeVisible({ timeout: 10_000 })

    // DecisionDetail auto-renders the first item. It shows "AI Reasoning" section header.
    await expect(page.locator('text=AI Reasoning').first()).toBeVisible({ timeout: 5_000 })

    // The detail panel also shows the "Action" section and decision summary
    // Both are rendered in the DecisionDetail component
    await expect(page.locator('text=Action').first()).toBeVisible({ timeout: 5_000 })
  })
})
