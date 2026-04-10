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

    // Desktop nav items hidden at mobile — they're in hidden sm:flex container
    // The pill nav div has `hidden sm:flex` so nav links inside are not visible
    const desktopDashboard = page.locator('nav .hidden.sm\\:flex >> text=Dashboard')
    await expect(desktopDashboard).not.toBeVisible()

    // Click hamburger — mobile dropdown appears
    await hamburger.click()

    // Mobile menu has role="menu" with Dashboard/Vaults/Activity links
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

    // Desktop pill nav is visible at 1280px (sm breakpoint = 640px)
    const pillNav = page.locator('nav .hidden.sm\\:flex')
    await expect(pillNav).toBeVisible()
    await expect(pillNav.locator('text=Dashboard')).toBeVisible()
    await expect(pillNav.locator('text=Vaults')).toBeVisible()
    await expect(pillNav.locator('text=Activity')).toBeVisible()

    // Hamburger should NOT be visible — it has `sm:hidden` class
    const hamburger = page.locator('[aria-label="Open navigation menu"]')
    await expect(hamburger).not.toBeVisible()
  })
})
