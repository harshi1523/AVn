
import { test, expect } from '@playwright/test';

test('Verify Admin Dashboard Elements', async ({ page }) => {
    // 1. Login as Admin (Presumes admin user exists or we are testing against a local dev environment with seeded data)
    // Since we cannot easily seed data here, we assume the user will run this against a state where admin login works.
    await page.goto('http://localhost:5173/');

    // NOTE: This test assumes standard login flow. If you use a different auth provider, adjust accordingly.
    await page.click('button:has-text("Login")');
    await page.fill('input[type="email"]', 'admin@example.com'); // Replace with valid admin email
    await page.fill('input[type="password"]', 'password'); // Replace with valid admin password
    await page.click('button:has-text("Login")');

    // 2. Verify Redirection to Dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h3:has-text("AvN Admin")')).toBeVisible();

    // 3. Verify Stats Cards
    await expect(page.locator('[data-testid="stat-card-total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-value-total-revenue"]')).not.toBeEmpty();

    await expect(page.locator('[data-testid="stat-card-active-rentals"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-card-support-tickets"]')).toBeVisible();

    // 4. Verify Sales Chart
    await expect(page.locator('[data-testid="sales-chart-container"]')).toBeVisible();

    // 5. Verify Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/.*home/); // Should redirect to home
});
