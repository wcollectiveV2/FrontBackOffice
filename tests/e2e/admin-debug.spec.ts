import { test, expect } from '@playwright/test';
import { loginToAdminDashboard, TEST_USERS } from './e2e-test-config';
import { goToAdminPanel } from './test-helpers';

test.describe('Admin Panel Debug', () => {

  test.beforeEach(async ({ page }) => {
     await loginToAdminDashboard(page, TEST_USERS.superAdmin);
  });

  test('DEBUG: Verify User Row Locators', async ({ page }) => {
    await goToAdminPanel(page);
    await page.click('button:has-text("Users")');
    await page.waitForTimeout(2000);

    const rows = page.locator('tr');
    console.log(`Found ${await rows.count()} rows`);
    if(await rows.count() > 1) {
        const firstRow = rows.nth(1); 
        await firstRow.hover();
        await page.waitForTimeout(1000);
        // Look for the More button
        const btn = firstRow.locator('.lucide-more-horizontal');
        console.log(`Generic search for .lucide-more-horizontal in row: ${await btn.count()}`);
        console.log(`Visible? ${await btn.isVisible()}`);
        
        // Look for parent button
        const parentBtn = firstRow.locator('button').filter({ has: page.locator('.lucide-more-horizontal') });
        console.log(`Parent button count: ${await parentBtn.count()}`);
        console.log(`Parent button visible: ${await parentBtn.isVisible()}`);
    }
  });

  test('DEBUG: Verify Protocol More Button', async ({ page }) => {
    await goToAdminPanel(page);
    await page.click('button:has-text("Protocols")');
    await page.waitForTimeout(2000);
    
    // Select first protocol
    const firstProto = page.locator('h3').first();
    console.log(`First protocol: ${await firstProto.textContent()}`);
    await firstProto.click();
    
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check header More button
    const moreBtn = page.locator('button').filter({ has: page.locator('.lucide-more-horizontal') }).first();
    console.log(`Header More button visible: ${await moreBtn.isVisible()}`);
  });

  test('DEBUG: Verify Assignment Modal', async ({ page }) => {
    await goToAdminPanel(page);
    await page.click('button:has-text("Protocols")');
    await page.waitForTimeout(2000);
    
    const firstProto = page.locator('h3').first();
    await firstProto.click();
    
    await page.click('button:has-text("Assignments")');
    
    await page.click('button:has-text("Assign Protocol")');
    await page.waitForTimeout(1000);
    
    const dialogs = page.locator('div[role="dialog"]');
    console.log(`Dialogs found: ${await dialogs.count()}`);
  });
});
