import { test, expect } from '@playwright/test';

test('About Page loads correctly', async ({ page }) => {
    await page.goto('/#/about');

    await expect(page.getByRole('heading', { name: /We Craft/i })).toBeVisible();
    await expect(page.getByText('Memories', { exact: true })).toBeVisible();

    await expect(page.getByText('Meet the Visionary')).toBeVisible();
    await expect(page.getByText('Dhruval Gondaliya')).toBeVisible();

    // Verify Stats
    await expect(page.getByText('Happy Travelers')).toBeVisible();
});
