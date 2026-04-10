import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('mobile hamburger menu toggles navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/app')

    // Hamburger button: aria-label="Open navigation menu" (from nav.tsx)
    const hamburger = page.locator('[aria-label="Open navigation menu"]')
    await expect(hamburger).toBeVisible()

    // Click hamburger — mobile dropdown appears with role="menu"
    await hamburger.click()

    const mobileMenu = page.locator('[role="menu"]')
    await expect(mobileMenu).toBeVisible()
    await expect(mobileMenu.locator('text=Dashboard')).toBeVisible()
    await expect(mobileMenu.locator('text=Vaults')).toBeVisible()
    await expect(mobileMenu.locator('text=Activity')).toBeVisible()

    // Click a nav item — navigates and closes menu
    await mobileMenu.locator('text=Vaults').click()
    await expect(page).toHaveURL(/\/app\/vaults/)
  })

  test('desktop nav shows all items without hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/app')

    // Desktop pill nav — the first hidden sm:flex container in nav (the pill nav with links)
    // Use more specific selector: the div with rounded-full that wraps nav links
    const pillNav = page.locator('nav .hidden.sm\\:flex.rounded-full').first()
    await expect(pillNav).toBeVisible()
    await expect(pillNav.locator('text=Dashboard')).toBeVisible()
    await expect(pillNav.locator('text=Vaults')).toBeVisible()
    await expect(pillNav.locator('text=Activity')).toBeVisible()

    // Hamburger should NOT be visible — it has `sm:hidden` class
    const hamburger = page.locator('[aria-label="Open navigation menu"]')
    await expect(hamburger).not.toBeVisible()
  })
})
