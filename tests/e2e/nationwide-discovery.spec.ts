import { test, expect } from '@playwright/test';

test.describe('Nationwide Search & Rich Discovery Cards', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should display review summaries and deadlines on discovery cards', async ({ page }) => {
        // Intercept the chat API to return a mocked rich discovery response
        await page.route('/api/chat', async route => {
            const json = {
                role: 'assistant',
                tool_calls: [
                    {
                        name: 'display_discovery_results',
                        args: {
                            camps: [
                                {
                                    id: 'mock-camp-1',
                                    name: 'Texas Space Camp',
                                    price: 1500,
                                    location: 'Houston, TX',
                                    weeks: [2, 3],
                                    ageRange: { min: 10, max: 15 },
                                    tags: ['STEM', 'Space'],
                                    website: 'https://www.spacecamp.com',
                                    description: 'An amazing overnight camp in Texas.',
                                    reviewSummary: 'Parents on Reddit rave about the zero-G simulator. 5/5 stars.',
                                    applicationDeadline: 'May 1, 2026',
                                    earlyBirdDeadline: 'March 15, 2026'
                                }
                            ]
                        }
                    }
                ]
            };
            await route.fulfill({ json });
        });

        // Add a child so the UI works fully
        const zipInput = page.locator('#zipCode');
        await zipInput.fill('94110');
        await page.getByRole('button', { name: /Add Child/i }).click();
        await page.getByPlaceholder(/e.g. Alex/i).fill('Astronaut Kid');
        await page.getByRole('button', { name: /Save Child/i }).click();

        // Send a nationwide query
        const chatInput = page.getByPlaceholder(/e.g. Highly rated/i);
        await chatInput.fill('Find me a space camp in Texas');
        await page.locator('form button[type="submit"]').click();

        // Verify the Rich UI elements
        await expect(page.getByText('Texas Space Camp')).toBeVisible();

        // Check new fields
        await expect(page.getByText('Reviews')).toBeVisible();
        await expect(page.getByText('Parents on Reddit rave about the zero-G simulator. 5/5 stars.')).toBeVisible();

        await expect(page.getByText('Early Bird')).toBeVisible();
        await expect(page.getByText('Ends March 15, 2026')).toBeVisible();

        await expect(page.getByText('Due Date')).toBeVisible();
        await expect(page.getByText('May 1, 2026')).toBeVisible();
    });
});
