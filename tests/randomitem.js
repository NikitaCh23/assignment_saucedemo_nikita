const { chromium } = require('playwright');
const { login } = require('./login'); // Import reusable login function

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the reusable login
  await login(page);

  // Wait for inventory page
  await page.waitForSelector('.inventory_list');

  // Define specific item names you want to add
  const itemsToAdd = [
    'Sauce Labs Backpack',
    'Sauce Labs Bolt T-Shirt'
  ];
  await page.waitForTimeout(1000);
  for (const itemName of itemsToAdd) {
    // Find the container for the item by text, then click the Add to Cart button inside it
    const itemLocator = page.locator(`.inventory_item:has-text("${itemName}")`);
    await page.waitForTimeout(1000);

    const addButton = itemLocator.locator('button.btn_inventory');
    await addButton.click();
  }

  // Go to cart
  await page.click('.shopping_cart_link');
  await page.waitForTimeout(1000);

  await page.waitForSelector('.cart_item');

  // Validate correct items are in the cart
  const cartItemNames = await page.$$eval('.inventory_item_name', items =>
    items.map(i => i.textContent.trim())
  );

  const missingItems = itemsToAdd.filter(item => !cartItemNames.includes(item));
  if (missingItems.length === 0) {
    console.log('✅ All specified items are in the cart.');
  } else {
    console.error('❌ Missing items in cart:', missingItems);
  }

  // checkout
  await page.click('#checkout');
  await page.fill('#first-name', 'John');
  await page.fill('#last-name', 'Doe');
  await page.fill('#postal-code', '411001');
  await page.click('#continue');

  // Verify items on the overview page
  const overviewNames = await page.$$eval('.inventory_item_name', items =>
    items.map(i => i.textContent.trim())
  );

  const overviewMismatch = itemsToAdd.filter(item => !overviewNames.includes(item));
  if (overviewMismatch.length === 0) {
    console.log('✅ All items correctly displayed on overview page.');
  } else {
    console.error('❌ Mismatch on overview page:', overviewMismatch);
  }

  // Finish and confirm
  await page.click('#finish');
  const confirmation = await page.locator('.complete-header').textContent();

  if (confirmation.includes('Thank you for your order!')) {
    console.log('✅ Checkout completed successfully.');
  } else {
    console.error('❌ Checkout confirmation message not found.');
  }

  // Pause for inspection
  await page.pause();
  // await browser.close();
})();
