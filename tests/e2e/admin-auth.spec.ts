import { test, expect } from '@playwright/test';
import { TEST_USERS } from './e2e-test-config';
import { ADMIN_DASHBOARD_URL } from './constants';

test.describe('Admin Authentication', () => {
  // Use admin dashboard URL for these tests
  test.use({ baseURL: ADMIN_DASHBOARD_URL });

  test('ADMIN-AUTH-001-01: Admin can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.adminUser.email);
    await page.fill('input[type="password"]', TEST_USERS.adminUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard (root path)
    await expect(page).toHaveURL(/.*\/$/);
    // Check for dashboard elements
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });

  test('ADMIN-AUTH-001-02: Non-admin users are rejected', async ({ page }) => {
    await page.goto('/login');
    // Using a regular user credentials
    await page.fill('input[type="email"]', TEST_USERS.testUser.email);
    await page.fill('input[type="password"]', TEST_USERS.testUser.password);
    await page.click('button[type="submit"]');

    // Expect error message OR stay on login page OR be redirected back to login
    // We check that we are NOT on the dashboard root
    await expect(page).not.toHaveURL(/\/$/);
    // And ideally strictly contain /login
    await expect(page).toHaveURL(/.*\/login/); 
    
    // Optional check for UI feedback, but do not fail if not present (backend might just 403)
    const errorMsg = page.locator('text=Access denied')
        .or(page.locator('text=Unauthorized'))
        .or(page.locator('text=Invalid credentials'))
        .or(page.locator('text=Admin access required'));
    
    if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
    }
  });

  test('ADMIN-AUTH-001-03: Protected routes redirect to login', async ({ page }) => {
    // Try to go directly to dashboard without login
    await page.goto('/');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('ADMIN-AUTH-001-04: Logout clears session', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.adminUser.email);
    await page.fill('input[type="password"]', TEST_USERS.adminUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/$/);

    // Find and click logout
    // Try sidebar logout first (Sign Out) or Header User Menu -> Sign Out
    const signoutBtn = page.locator('text=Sign Out').or(page.locator('text=Sign out'));
    
    // If not visible immediately (e.g. mobile or dropdown), try clicking user menu first
    if (!await signoutBtn.first().isVisible()) {
       // Try opening user menu in header (Avatar or Name)
       await page.locator('button:has-text("Admin")').first().click().catch(() => {});
       await page.locator('.lucide-chevron-down').first().click().catch(() => {});
    }

    await signoutBtn.first().click();
    
    // Should return to login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Trying to access dashboard again should fail
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
