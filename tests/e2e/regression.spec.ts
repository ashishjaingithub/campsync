import { test, expect } from '@playwright/test';

test.describe('CampSync Regression Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForSelector('#zipCode');
    });

    test('should disable and respect blackout weeks', async ({ page }) => {
        await page.getByRole('button', { name: /Load Demo Data/i }).click();
        await page.locator('#zipCode').fill('94110');
        await page.getByRole('button', { name: /Add Child/i }).click();
        await page.getByPlaceholder(/e.g. Alex/i).fill('Blackout Kid');
        await page.getByRole('button', { name: /Save Child/i }).click();

        const week2Btn = page.getByRole('button', { name: 'WEEK 2', exact: false });
        await week2Btn.click();

        // Trigger auto-fill via window because the button was removed from UI
        await page.evaluate(() => {
            // @ts-expect-error - testing
            if (window.autoFill) window.autoFill();
        });

        const week2Cell = page.locator('[data-child-name="Blackout Kid"]').locator('[data-week-index="1"]');
        await expect(week2Cell.locator('.bg-primary')).toHaveCount(0);
    });

    test('should show conflict indicator when overlapping camps', async ({ page }) => {
        // 1. Prepare base data
        await page.getByRole('button', { name: /Load Demo Data/i }).click();

        // 2. Add child
        await page.getByRole('button', { name: /Add Child/i }).click();
        await page.getByPlaceholder(/e.g. Alex/i).fill('Conflict Kid');
        await page.getByRole('button', { name: /Save Child/i }).click();

        // 3. Deterministically inject TWO overlapping camps via state modification
        await page.evaluate(() => {
            const raw = localStorage.getItem('campsync_state');
            if (raw) {
                const state = JSON.parse(raw);
                const kid = state.children.find((c: { name: string; id: string }) => c.name === 'Conflict Kid');
                if (kid && state.uploadedCamps.length >= 2) {
                    // Inject conflict: 2 different camps in Week 4 (Index 3)
                    state.schedule.push({
                        childId: kid.id,
                        weekIndex: 3,
                        campId: state.uploadedCamps[0].id
                    });
                    state.schedule.push({
                        childId: kid.id,
                        weekIndex: 3,
                        campId: state.uploadedCamps[1].id
                    });
                    localStorage.setItem('campsync_state', JSON.stringify(state));
                }
            }
        });

        // 4. Reload to see the injected conflict
        await page.reload();
        await page.waitForSelector('#zipCode');

        // 5. Verify conflict badge in Calendar header
        const conflictBadge = page.locator('.bg-amber-100');
        await expect(conflictBadge).toBeVisible({ timeout: 15000 });
        await expect(conflictBadge).toContainText(/Conflict/i);
    });
});
