const { chromium } = require('playwright');
const { login } = require('./login'); // Import reusable login function

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the reusable login
  await login(page);

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
