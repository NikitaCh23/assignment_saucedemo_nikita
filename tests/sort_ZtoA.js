const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Set headless: true for CI
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the login page
  await page.goto('https://www.saucedemo.com/');

  // Login
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  // Wait for the inventory page to load
  await page.waitForSelector('.inventory_list');

  // Select Z-A from the sorting dropdown
  await page.selectOption('.product_sort_container', 'za');

  // Wait for items to reorder
  await page.waitForTimeout(2000); // small delay to let DOM update (can also use event-based wait)

  // Get all item names
  const itemNames = await page.$$eval('.inventory_item_name', nodes =>
    nodes.map(n => n.textContent.trim())
  );

  // Create a sorted copy (Z-A)
  const sortedDescending = [...itemNames].sort((a, b) => b.localeCompare(a));

  // Check if items are sorted correctly
  const isSorted = JSON.stringify(itemNames) === JSON.stringify(sortedDescending);

  if (isSorted) {
    console.log('✅ Items are correctly sorted from Z to A.');
  } else {
    console.error('❌ Items are NOT sorted correctly. Found order:', itemNames);
  }
  await page.pause();
  //await browser.close();
  
})();
