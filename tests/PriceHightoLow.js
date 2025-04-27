const { chromium } = require('playwright');
const { login } = require('./login'); // Import reusable login function

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the reusable login
  await login(page);

  //inventory list
  await page.waitForSelector('.inventory_list');

  // Select "Price (high to low)" option
  await page.selectOption('.product_sort_container', 'hilo');

  // Give the page a moment to reorder (optional but safe)
  await page.waitForTimeout(1000);

  // Extract all prices
  const prices = await page.$$eval('.inventory_item_price', nodes =>
    nodes.map(n => parseFloat(n.textContent.replace('$', '')))
  );

  // Verify the prices are in descending order
  const sorted = [...prices].sort((a, b) => b - a);
  const isDescending = JSON.stringify(prices) === JSON.stringify(sorted);

  if (isDescending) {
    console.log('✅ Prices are correctly sorted from High to Low:', prices);
  } else {
    console.error('❌ Price sorting is incorrect. Found order:', prices);
  }
  await page.pause(); // <--for keeping the browser open until you manually close it

  // await browser.close();
})();
