import { test, expect } from '@playwright/test';

test.describe('Global Discovery Trigger', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForSelector('#zipCode');
    });

    test('should trigger AI discovery from sidebar and show results in chat', async ({ page }) => {
        // 1. Setup profile context (Zip + Child)
        const zipInput = page.locator('#zipCode');
        await zipInput.fill('94110');

        await page.getByRole('button', { name: /Add Child/i }).click();
        await page.getByPlaceholder(/e.g. Alex/i).fill('Discovery Kid');
        await page.getByRole('button', { name: /Save Child/i }).click();

        // 2. Click "Find Suggestions" in Sidebar
        const findBtn = page.getByRole('button', { name: /Find Suggestions/i });
        await expect(findBtn).toBeVisible();
        await findBtn.click();

        // 3. Verify AI starts thinking
        await expect(page.getByText(/Assistant is thinking/i)).toBeVisible();

        // 4. Verify results appear in chat (mocked in tests usually, but here we expect real or at least the start of a response)
        // Since we are running against real/dev, we wait for a message with "found" 
        // Or at least check that the system responded
        await expect(page.locator('.bg-white.text-slate-700').first()).toBeVisible({ timeout: 30000 });

        // 5. Verify the user message was automatically sent
        await expect(page.getByText(/Find some great summer camps near 94110 for my children: Discovery Kid/i)).toBeVisible();
    });
});
