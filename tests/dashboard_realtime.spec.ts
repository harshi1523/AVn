
import { test, expect } from '@playwright/test';

test('Real-time Dashboard Update Check', async ({ browser }) => {
    // --- Admin Session ---
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 1. Login Logic (matches admin_login_test.spec.ts)
    await adminPage.goto('http://localhost:5173/');
    await adminPage.click('button:has-text("Login")');
    await adminPage.fill('input[type="email"]', 'admin@example.com');
    await adminPage.fill('input[type="password"]', 'password'); // Assuming default mock password
    await adminPage.click('button:has-text("Login")');

    // 2. Go to Dashboard and Get Initial Revenue
    await expect(adminPage.locator('h3:has-text("AvN Admin")')).toBeVisible({ timeout: 10000 });
    const revenueLocator = adminPage.locator('[data-testid="stat-value-total-revenue"]');
    await expect(revenueLocator).toBeVisible();
    const initialRevenueText = await revenueLocator.innerText();
    console.log('Initial Revenue:', initialRevenueText);


    // --- Customer Session ---
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();

    // 3. Signup New User
    await userPage.goto('http://localhost:5173/');
    const timestamp = Date.now();
    await userPage.click('button:has-text("Login")');
    await userPage.click('text=Sign up');
    await userPage.fill('input[placeholder="Full Name"]', `Test User ${timestamp}`);
    await userPage.fill('input[type="email"]', `test${timestamp}@example.com`);
    await userPage.fill('input[type="password"]', 'password123');
    await userPage.click('button:has-text("Sign Up")');

    // 4. Place Order
    // Navigate to a product (first "Rent Now" or "Buy Now" button on homepage or products page)
    await userPage.waitForTimeout(2000); // Wait for login/redirect
    // Assuming homepage has products
    // Click first product card or Add to Cart
    // Check if we need to navigate to 'Explore' or similar. 
    // Let's assume standard flow: Home -> Click Product -> Add to Cart

    // Just go to specific product page often works better than random clicking?
    // Or "Explore"
    await userPage.goto('http://localhost:5173/explore');
    await userPage.click('.group', { position: { x: 10, y: 10 } }); // Tricky generic click

    // Better: Look for "Rent" or "Buy" button
    // Wait, the Store has `products`. I'll try finding "Add to Cart" or "Rent Now".
    // Assuming the UI has "Rent Now" buttons on product cards.
    const rentButtons = userPage.locator('button:has-text("Rent Now")');
    if (await rentButtons.count() > 0) {
        await rentButtons.first().click();
    } else {
        // Try finding a product link
        await userPage.click('a[href^="/product/"]', { timeout: 5000 }).catch(() => { });
        // On product page
        await userPage.click('button:has-text("Add to Cart")');
    }

    // Open Cart
    await userPage.click('button[aria-label="Cart"]', { timeout: 5000 }).catch(async () => {
        // Maybe header cart icon?
        await userPage.click('.material-symbols-outlined:has-text("shopping_cart")');
    });

    // Checkout
    await userPage.click('button:has-text("Checkout")');

    // Fill Address (if requested)
    if (await userPage.isVisible('input[placeholder="Address"]')) { // Heuristic
        await userPage.fill('input', '123 Test St'); // Fill first input
        // Or specific fields
    }

    // Place Order
    await userPage.click('button:has-text("Place Order")');

    // Wait for success message
    await expect(userPage.locator('text=Order Placed')).toBeVisible({ timeout: 10000 });


    // --- Verification ---
    // 5. Check Admin Dashboard Update
    console.log('Order placed. Verifying admin update...');
    // The revenue text should CHANGE.
    await expect(revenueLocator).not.toHaveText(initialRevenueText, { timeout: 10000 });
    const newRevenueText = await revenueLocator.innerText();
    console.log('New Revenue:', newRevenueText);
});
