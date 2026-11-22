import { test, expect } from '@playwright/test';

test('Homepage loads and displays key sections', async ({ page }) => {
    await page.goto('/');

    // Verify Title
    await expect(page).toHaveTitle(/Bharat Yatra/);

    // Verify Hero Section
    await expect(page.getByRole('heading', { name: /Welcome to/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Packages' })).toBeVisible();

    // Verify Categories
    await expect(page.getByText('Explore Travel Categories')).toBeVisible();
    await expect(page.getByText('Cultural')).toBeVisible();
    await expect(page.getByText('Nature')).toBeVisible();

    // Verify Most Visited Places
    await expect(page.getByText('Most Visited Places')).toBeVisible();

    // Verify Footer (simple check)
    await expect(page.locator('footer')).toBeVisible();
});
