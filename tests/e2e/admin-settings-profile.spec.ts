import { test, expect } from '@playwright/test';
import { loginToAdminDashboard, TEST_USERS } from './e2e-test-config';

// ============================================================================
// E2E Tests: Admin Profile & Settings
// Tests for Profile Management and Global Platform Settings
// ============================================================================

test.describe('Admin Profile & Settings', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as super admin to have access to everything
    await loginToAdminDashboard(page, TEST_USERS.superAdmin);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Profile Management', () => {
    test('Should navigate to profile via user menu', async ({ page }) => {
      // Open user menu
      // The user is Super Admin, so the button should contain that text
      const userMenuTrigger = page.locator('header button:has-text("Super Admin")');
      
      // Fallback if specific text selector fails (e.g. mobile view or name change)
      if (await userMenuTrigger.isVisible()) {
        await userMenuTrigger.click();
      } else {
        // Try clicking the avatar specifically (last button in header usually)
        await page.locator('header .relative button:has(.rounded-full)').click();
      }

      // Click Profile option
      await expect(page.locator('button:has-text("Profile")')).toBeVisible();
      await page.click('button:has-text("Profile")');

      // Verify URL and Title
      await expect(page).toHaveURL(/\/profile/);
      await expect(page.locator('h2:has-text("Your Profile")')).toBeVisible();
    });

    test('Should update general profile information', async ({ page }) => {
      await page.goto('/profile');

      // Check initial state (assuming default or previous test state, but inputs should be there)
      await expect(page.locator('input[placeholder="Your full name"]')).toBeVisible();

      const newName = `Admin Updated ${Date.now()}`;
      
      // Update Name
      await page.fill('input[placeholder="Your full name"]', newName);
      await page.click('button:has-text("Save Changes")');

      // Verify Success Notification
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
      
      // Verify name updated in header (might require reload or if it's immediate)
      // The implementation dispatched a storage event, but window-to-window storage events don't trigger in the same window usually.
      // However, let's just check if the form value persisted after reload for robustness
      await page.reload();
      await expect(page.locator('input[placeholder="Your full name"]')).toHaveValue(newName);
    });

    test('Should handle password update validation', async ({ page }) => {
      await page.goto('/profile');

      // Switch to Security Tab
      await page.click('button:has-text("Security & Password")');
      await expect(page.locator('h3:has-text("Change Password")')).toBeVisible();

      // Case 1: Mismatched passwords
      await page.fill('input[type="password"] >> nth=1', 'newpass123'); // New Password
      await page.fill('input[type="password"] >> nth=2', 'mismatch123'); // Confirm Password
      await page.click('button:has-text("Update Password")');
      
      await expect(page.locator('text=New passwords do not match')).toBeVisible();

      // Case 2: Short password
      await page.fill('input[type="password"] >> nth=1', '123'); 
      await page.fill('input[type="password"] >> nth=2', '123');
      await page.click('button:has-text("Update Password")');
      
      await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
    });

    test('Should successfully update password', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button:has-text("Security & Password")');

      await page.fill('input[type="password"] >> nth=0', 'oldpassword'); // Current
      await page.fill('input[type="password"] >> nth=1', 'newsecurepass'); // New
      await page.fill('input[type="password"] >> nth=2', 'newsecurepass'); // Confirm

      await page.click('button:has-text("Update Password")');
      await expect(page.locator('text=Password updated successfully')).toBeVisible();
      
      // inputs should be cleared
      await expect(page.locator('input[type="password"] >> nth=1')).toHaveValue('');
    });
  });

  test.describe('Platform Settings & GDPR', () => {
    test('Should update platform global configuration', async ({ page }) => {
      await page.goto('/settings');
      
      // Update Platform Name
      const newPlatformName = `wcollective Core ${Date.now()}`;
      // Finds input inside the label "Platform Name"
      // Based on FormField implementation it likely labels the input or is adjacent.
      // Using generic locator logic:
      await page.fill('text=Platform Name >> .. >> input', newPlatformName);
      
      await page.click('button:has-text("Save Configuration")');
      
      await expect(page.locator('text=Platform settings saved successfully')).toBeVisible();
    });

    test('Should handle GDPR deletion request validation', async ({ page }) => {
      await page.goto('/settings');
      
      // Scroll to GDPR section if needed, though playwright usually auto-scrolls
      
      // Try invalid submit
      await page.click('button:has-text("Request Data Deletion")');
      await expect(page.locator('text=Please maintain both App and User Email')).toBeVisible();
    });

    test('Should submit valid GDPR deletion request', async ({ page }) => {
      await page.goto('/settings');
      
      // Select App
      // There are multiple selects on the page (Maintenance Mode is first). 
      // We need specifically the one for Application in the GDPR section.
      
      // Option 1: Select by index (GDPR is the second form)
      // await page.selectOption('select >> nth=1', 'habbit_app');
      
      // Option 2 (Better): Locate by label "Select Application"
      // The FormField structure is Label -> Select. 
      // We can find the label and get the select within the same container, but standard DOM traversal is tricky.
      // Playwright's `locator('label:has-text("Select Application")').fill(...)` works for inputs associated by id, 
      // but here we might not have ids.
      
      // Using n-th match for safety or better selector
      const gdprSection = page.locator('section:has-text("GDPR & Data Compliance")');
      await gdprSection.locator('select').selectOption('habbit_app');

      // Enter Email
      await page.fill('input[placeholder="user@example.com"]', 'delete_me@test.com');

      // Submit
      await page.click('button:has-text("Request Data Deletion")');

      // Check success message
      await expect(page.locator('text=GDPR Removal Request initiated')).toBeVisible();
      await expect(page.locator('text=delete_me@test.com')).toBeVisible();
    });
  });

});
