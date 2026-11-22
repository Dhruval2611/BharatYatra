import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/#/signin');
    });

    test('Login page loads correctly', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
        await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
        await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    });

    test('Login failure with invalid credentials', async ({ page }) => {
        await page.getByPlaceholder('Enter your email').fill('invalid@example.com');
        await page.getByPlaceholder('Enter your password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Sign in' }).click();

        await expect(page.getByText('Invalid email or password.')).toBeVisible();
    });

    test('Navigation links work', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Forgot Password?' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Admin Login' })).toBeVisible();
    });
});
