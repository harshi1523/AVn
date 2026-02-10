
import { test, expect } from '@playwright/test';

test('Verify Admin Dashboard Key Metrics', async ({ page }) => {
    // 1. Login as Admin
    await page.goto('http://localhost:5173/');

    await page.click('button:has-text("Login")');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Login")');

    // 2. Navigation Verification
    await expect(page).toHaveURL(/.*dashboard/);
    // Explicitly wait for Dashboard header to ensure full load
    await expect(page.locator('h3:has-text("AvN Admin")')).toBeVisible();

    // 3. Verify Metrics Presence and Formatting

    // Total Revenue
    const revenueCard = page.locator('[data-testid="stat-card-total-revenue"]');
    const revenueValue = page.locator('[data-testid="stat-value-total-revenue"]');

    await expect(revenueCard).toBeVisible();
    await expect(revenueValue).toBeVisible();
    await expect(revenueValue).not.toBeEmpty();
    // Regex for Currency format: Starts with ₹, ends with M (e.g. ₹1.23M)
    await expect(revenueValue).toHaveText(/^₹[\d,.]+[BMK]?$/);

    // Monthly Growth
    const growthCard = page.locator('[data-testid="stat-card-growth"]');
    const growthValue = page.locator('[data-testid="stat-value-growth"]');

    await expect(growthCard).toBeVisible();
    await expect(growthValue).toBeVisible();
    // Regex for percentage format with indicator (e.g. +10.0%, -5%, 0%)
    // The implementation uses +${finance.monthlyGrowth}%
    await expect(growthValue).toHaveText(/^[+-]?\d+(\.\d+)?%$/);

    // Active Rentals
    const rentalsCard = page.locator('[data-testid="stat-card-active-rentals"]');
    const rentalsValue = page.locator('[data-testid="stat-value-active-rentals"]');

    await expect(rentalsCard).toBeVisible();
    await expect(rentalsValue).toBeVisible();
    // Should be a number
    await expect(rentalsValue).toHaveText(/^\d+$/);

    // Open Support Tickets
    const ticketsCard = page.locator('[data-testid="stat-card-support-tickets"]');
    const ticketsValue = page.locator('[data-testid="stat-value-support-tickets"]');

    await expect(ticketsCard).toBeVisible();
    await expect(ticketsValue).toBeVisible();
    // Should be a number
    await expect(ticketsValue).toHaveText(/^\d+$/);

    // 4. Verify Labels
    await expect(page.locator('text=Total Revenue').first()).toBeVisible();
    await expect(page.locator('text=Growth').first()).toBeVisible();
    await expect(page.locator('text=Active Rentals').first()).toBeVisible();
    await expect(page.locator('text=Support Tickets').first()).toBeVisible();

});
