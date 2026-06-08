import { test, expect } from '@playwright/test'

test.describe('app UI', () => {
  test('toggles between light and dark theme', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'the sidebar (with the theme toggle) is always open only on desktop',
    )

    await page.goto('/')
    await page.getByRole('button', { name: 'Close dialog' }).click() // dismiss start screen

    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.getByRole('button', { name: 'Dark Mode' }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: 'Light Mode' }).click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })

  test('opens the slide-out menu on mobile', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'the hamburger menu only appears on small screens',
    )

    await page.goto('/')
    await page.getByRole('button', { name: 'Close dialog' }).click() // dismiss start screen
    // Open the hamburger menu, then trigger New Game from inside it.
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('button', { name: 'New Game', exact: true }).click()

    // New Game from the menu brings the start screen back.
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible()
  })
})
