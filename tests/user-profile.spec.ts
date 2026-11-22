import { test, expect } from '@playwright/test';

test.describe('User Profile', () => {

    test.beforeEach(async ({ page }) => {
        // Mock User Session
        await page.addInitScript(() => {
            const user = {
                id: '1',
                username: 'Test User',
                email: 'test@example.com',
                password: 'password',
                profileImageUrl: ''
            };
            window.sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        });
        // Mock API responses
        await page.route('**/api/bookings', async route => route.fulfill({ json: [] }));
        await page.route('**/api/users/*', async route => route.fulfill({ json: {} })); // For profile updates if any

        await page.goto('/#/profile');
    });

    test('Profile page displays user info', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Edit Your Profile' })).toBeVisible();
        // The profile page uses input fields for user info, so we check values
        await expect(page.locator('input[name="username"]')).toHaveValue('Test User');
        await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
    });

    test('Navigation to My Bookings', async ({ page }) => {
        // Open Profile Dropdown
        await page.getByRole('button', { name: /Test User/i }).click();
        await page.getByRole('link', { name: 'Your Bookings' }).click();
        await expect(page).toHaveURL(/.*\/#\/my-bookings/);
        await expect(page.getByRole('heading', { name: 'Your Bookings' })).toBeVisible();
    });
});
