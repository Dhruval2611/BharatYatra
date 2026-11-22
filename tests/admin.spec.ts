import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Admin Session
        await page.addInitScript(() => {
            window.sessionStorage.setItem('isAdminAuthenticated', 'true');
        });
        // Mock API responses
        await page.route('**/api/packages', async route => route.fulfill({ json: [] }));
        await page.route('**/api/users', async route => route.fulfill({ json: [] }));
        await page.route('**/api/bookings', async route => route.fulfill({ json: [] }));

        await page.goto('/#/admin/dashboard');
    });

    test('Dashboard loads with stats', async ({ page }) => {
        await expect(page).toHaveURL(/.*\/#\/admin\/dashboard/);
        await expect(page.getByText('Total Packages')).toBeVisible();
        await expect(page.getByText('Registered Users')).toBeVisible();
        await expect(page.getByText('Total Bookings')).toBeVisible();
    });

    test('Admin Navigation works', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Manage Packages' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Manage Users' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Manage Bookings' })).toBeVisible();
    });
});
