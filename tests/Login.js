// login.js

/**
 * Reusable login function for SauceDemo
 * @param {import('@playwright/test').Page} page
 */
async function login(page, username = 'standard_user', password = 'secret_sauce') {
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', username);
    await page.waitForTimeout(1000); // Wait for 1 second before filling password
    await page.fill('#password', password);
    await page.waitForTimeout(1000);
    await page.click('#login-button');
    await page.waitForSelector('.inventory_list'); // Wait until inventory page loads
  }
  
  module.exports = { login };
  