import { test, expect } from '@playwright/test';

test.describe('Package Detail Page', () => {

    test('Package details load correctly', async ({ page }) => {
        const pkgId = '1';

        // Mock the API response for a specific package
        await page.route(`**/api/packages/${pkgId}`, async route => {
            await route.fulfill({
                json: {
                    id: pkgId,
                    title: "Majestic Rajasthan",
                    price: 25000,
                    days: 5,
                    category: ["Cultural", "Heritage"],
                    imageUrl: "/images/rajasthan.jpg",
                    description: "Experience the royal heritage.",
                    imageUrls: ["/images/rajasthan.jpg"],
                    itineraries: [
                        { day: 1, description: "Arrival in Jaipur" }
                    ],
                    attractionTags: ["Forts", "Palaces"],
                    placeTags: ["Jaipur", "Udaipur"],
                    duration: "5 Days"
                }
            });
        });

        await page.goto(`/#/packages/${pkgId}`);

        await expect(page.getByRole('heading', { name: 'Majestic Rajasthan' })).toBeVisible();
        await expect(page.getByText('₹25,000')).toBeVisible();
        await expect(page.getByText('Experience the royal heritage')).toBeVisible();

        // Check for "Book This Trip Now" button
        await expect(page.getByRole('button', { name: 'Book This Trip Now' })).toBeVisible();
    });

    test('Back link works', async ({ page }) => {
        // Mock API for package fetch (needed even for just checking the back link presence if the page errors out without data)
        await page.route(`**/api/packages/1`, async route => {
            await route.fulfill({
                json: { id: "1", title: "Test", price: 100, days: 1, category: [], imageUrl: "", description: "", imageUrls: [], itineraries: [], attractionTags: [], placeTags: [], duration: "1 Day" }
            });
        });

        await page.goto('/#/packages/1');
        await expect(page.getByRole('link', { name: 'Back to Packages' })).toBeVisible();
    });
});
