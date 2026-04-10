import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Marketing pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('homepage loads with all sections', async ({ page }) => {
    await page.goto('/')
    // Hero headline — "Yield," is in its own gradient span
    await expect(page.locator('text=Yield,').first()).toBeVisible()
    await expect(page.locator('text=Routed.').first()).toBeVisible()
    await expect(page.locator('text=How It Works').first()).toBeVisible()
    await expect(page.locator('text=Choose Your Risk Level').first()).toBeVisible()
    await expect(page.locator('text=Launch App').first()).toBeVisible()
  })

  test('strategy page renders', async ({ page }) => {
    await page.goto('/strategy')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('main')).not.toBeEmpty()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Launch App')
    await expect(page).toHaveURL(/\/app/)
  })
})
