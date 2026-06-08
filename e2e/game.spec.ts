import { test, expect } from '@playwright/test'

test.describe('playing vs the computer', () => {
  test('starts a game and shows the board', async ({ page }) => {
    await page.goto('/')

    // The start screen appears first.
    const startBtn = page.getByRole('button', { name: 'Start Game' })
    await expect(startBtn).toBeVisible()

    // Start with the defaults (vs computer, medium, white).
    await startBtn.click()

    // The real board renders and it's the player's turn.
    await expect(page.locator('[data-square="e1"]')).toBeVisible()
    await expect(page.getByText('Your turn')).toBeVisible()
  })

  test('player can move and the REAL engine replies', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Start Game' }).click()

    // Click-to-move: select e2, then e4.
    await page.locator('[data-square="e2"]').click()
    await page.locator('[data-square="e4"]').click()

    // Our move shows up in the move history.
    const history = page.locator('.move-history')
    await expect(history.getByText('e4')).toBeVisible()

    // The real Stockfish worker computes a reply (~1–2s). Wait for the turn
    // to come back to us, and for a black reply to appear in the history.
    await expect(page.getByText('Your turn')).toBeVisible({ timeout: 15000 })
    await expect(history.locator('.move-black')).not.toHaveText('', {
      timeout: 15000,
    })
  })
})
