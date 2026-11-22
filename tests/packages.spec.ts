import { test, expect } from '@playwright/test';

test.describe('Packages Page', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        // Mock the packages API response to ensure consistency
        await page.route('**/api/packages', async route => {
            console.log('Route matched!');
            const json = [
                {
                    id: "1",
                    title: "Majestic Rajasthan",
                    price: 25000,
                    days: 5,
                    category: ["Cultural", "Heritage"],
                    imageUrl: "/images/rajasthan.jpg",
                    description: "Experience the royal heritage.",
                    imageUrls: [],
                    itineraries: [],
                    attractionTags: [],
                    placeTags: ["Jaipur", "Udaipur"],
                    duration: "5 Days"
                },
                {
                    id: "2",
                    title: "Kerala Backwaters",
                    price: 15000,
                    days: 3,
                    category: ["Nature", "Relaxation"],
                    imageUrl: "/images/kerala.jpg",
                    description: "Relax in the backwaters.",
                    imageUrls: [],
                    itineraries: [],
                    attractionTags: [],
                    placeTags: ["Alleppey", "Munnar"],
                    duration: "3 Days"
                }
            ];
            await route.fulfill({ json });
        });

        await page.goto('/#/packages');
    });

    test('Packages list loads', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Explore Our/i })).toBeVisible();
        await expect(page.getByText('Majestic Rajasthan')).toBeVisible();
        await expect(page.getByText('Kerala Backwaters')).toBeVisible();
    });

    test('Category filter works', async ({ page }) => {
        await page.getByRole('button', { name: 'Cultural' }).click();

        // "Majestic Rajasthan" should be visible
        await expect(page.getByText('Majestic Rajasthan')).toBeVisible();

        // "Kerala Backwaters" should NOT be visible (it doesn't have Cultural tag)
        await expect(page.getByText('Kerala Backwaters')).toBeHidden();
    });

    test('Search functionality works', async ({ page }) => {
        await page.getByPlaceholder('Search for your dream destination...').fill('Kerala');

        await expect(page.getByText('Kerala Backwaters')).toBeVisible();
        await expect(page.getByText('Majestic Rajasthan')).toBeHidden();
    });
});
