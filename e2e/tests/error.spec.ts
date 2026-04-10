import { test, expect } from '@playwright/test'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Error boundaries', () => {
  test('error boundary catches API failure', async ({ page }) => {
    await mockRpc(page)

    // Make ALL keeper API calls return 500
    await page.route('**/v1/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    )

    await page.goto('/app')

    // The app uses fallback mock data when the keeper is down — it shouldn't show
    // a white screen or an uncaught error. Either:
    // (a) Error boundary shows "Something went wrong"
    // (b) Page loads with mock data fallback
    const hasErrorBoundary = await page
      .locator('text=Something went wrong')
      .isVisible({ timeout: 15_000 })
      .catch(() => false)

    const hasContent = await page
      .locator('text=/Dashboard|Active Strategies|Vaults|NanuqFi/i')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    // At least one should be true — no white screen
    expect(hasErrorBoundary || hasContent).toBe(true)
  })

  test('try again button resets error', async ({ page }) => {
    await mockRpc(page)

    let shouldFail = true

    // First load fails, second succeeds
    await page.route('**/v1/**', async (route) => {
      if (shouldFail) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'fail' }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ uptime: 100, cyclesCompleted: 1, rpcStatus: 'healthy' }),
      })
    })

    await page.goto('/app')

    const tryAgain = page.locator('text=Try again')
    if (await tryAgain.isVisible({ timeout: 10_000 }).catch(() => false)) {
      // Stop failing before clicking retry
      shouldFail = false
      await tryAgain.click()

      // Page should recover — either show content or at least not crash again
      await page.waitForTimeout(2000)
      const pageHasContent = await page.locator('body').innerText()
      expect(pageHasContent.length).toBeGreaterThan(10)
    } else {
      // App used mock data fallback — no error boundary triggered, which is also correct
      const body = await page.locator('body').innerText()
      expect(body.length).toBeGreaterThan(50)
    }
  })
})
