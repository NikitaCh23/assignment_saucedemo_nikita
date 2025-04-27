const { chromium } = require('playwright');
const { login } = require('./login'); // Import reusable login function

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use the reusable login
  await login(page);

  // Login page for site
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.waitForTimeout(1000);
  await page.fill('#password', 'secret_sauce');
  await page.waitForTimeout(1000);
  await page.click('#login-button');
  await page.waitForTimeout(1000);

  // Wait and let it load inventory page
  await page.waitForSelector('.inventory_list');
  await page.waitForTimeout(1000);

  // Adding multiple items to cart
  const addButtons = await page.$$('.inventory_item .btn_inventory');
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(1000);
    await addButtons[i].click();
    await page.waitForTimeout(1000);
  }

  // Going to cart
  await page.click('.shopping_cart_link');
  await page.waitForTimeout(1000);
  await page.waitForSelector('.cart_item');
  await page.waitForTimeout(1000);

  // Validate items in cart
  const cartItems = await page.$$('.cart_item');
  if (cartItems.length === 3) {
    console.log('✅ 3 items successfully added to cart.');
  } else {
    console.error(`❌ Expected 3 items, but found ${cartItems.length}`);
  }
  await page.waitForTimeout(1000);
  // Click Checkout button
  await page.click('#checkout');

  // Fill in checkout form
  await page.fill('#first-name', 'John');
  await page.fill('#last-name', 'Doe');
  await page.fill('#postal-code', '12345');
  await page.waitForTimeout(1000);
  await page.click('#continue');
  await page.waitForTimeout(2000);

  // Validation of overview page
  await page.waitForSelector('.summary_info');
  await page.waitForTimeout(2000);
  const overviewItems = await page.$$('.cart_item');

  if (overviewItems.length === 3) {
    console.log('✅ Checkout overview displays correct number of items.');
  } else {
    console.error('❌ Checkout overview item count mismatch.');
  }
  await page.waitForTimeout(1000);
  // Finish
  await page.click('#finish');

  // Validate thank you message
  const confirmation = await page.locator('.complete-header').textContent();
  if (confirmation.includes('Thank you for your order!')) {
    console.log('✅ Checkout completed successfully.');
  } else {
    console.error('❌ Checkout confirmation not found.');
  }

  // Pause for inspection
  await page.pause();

  // await browser.close(); 
})();

