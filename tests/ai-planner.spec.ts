import { test, expect } from '@playwright/test';

test.describe('AI Trip Planner', () => {
    test('Chat interface operates', async ({ page }) => {
        await page.goto('/#/ai-planner');

        await expect(page.getByRole('heading', { name: 'AI Trip Planner' })).toBeVisible();

        // Check input field
        const input = page.getByPlaceholder('Describe your dream trip...');
        await expect(input).toBeVisible();
        await input.fill('Trip to Goa');

        // Check send button is enabled after typing
        const sendButton = page.locator('button[type="submit"]');
        await expect(sendButton).toBeEnabled();
    });

    test('Pre-defined prompts work', async ({ page }) => {
        await page.goto('/#/ai-planner');

        const romantiTripBtn = page.getByRole('button', { name: 'Romantic honeymoon in Kerala' });
        await expect(romantiTripBtn).toBeVisible();
        await romantiTripBtn.click();

        // Input should be populated
        await expect(page.getByPlaceholder('Describe your dream trip...')).toHaveValue('Romantic honeymoon in Kerala');
    });
});
