import { test, expect } from '@playwright/test';

test.describe('CampSync Enterprise E2E', () => {
    test('should load the dashboard and allow demo data loading', async ({ page }) => {
        // Navigate to the local dev server
        await page.goto('http://localhost:3000');

        // Check for the main title
        await expect(page.locator('h1')).toContainText('CampSync');

        // Click "Load Demo Data"
        const loadDemoBtn = page.getByRole('button', { name: /Load Demo Data/i });
        if (await loadDemoBtn.isVisible()) {
            await loadDemoBtn.click();
        }

        // Verify children profiles header is visible after interaction (if they were added by demo)
        await expect(page.getByRole('heading', { name: 'Children Profiles', exact: true })).toBeVisible();

        // Verify the Export button exists
        await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible();
    });

    test('should allow adding a child profile', async ({ page }) => {
        await page.goto('http://localhost:3000');

        await page.getByRole('button', { name: /Add Child/i }).click();
        await page.getByPlaceholder(/e.g. Alex/i).fill('Test Child');
        await page.getByRole('button', { name: /Save Child/i }).click();

        await expect(page.getByText('Test Child').first()).toBeVisible();
    });
});
