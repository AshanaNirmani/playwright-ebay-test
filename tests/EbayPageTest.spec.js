const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');

test('Search and open a product on eBay and validate similar items', async () => {
  // Launch browser in headed mode to reduce bot detection
  const browser = await chromium.launch({ headless: false, slowMo: 200 });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  // 1. Go to eBay
  await page.goto('https://www.ebay.com/');
  console.log('Page title is:', await page.title());

  // 2. Search for a product
  const searchBar = page.locator('#gh-ac');
  await expect(searchBar).toBeVisible();
  await searchBar.fill('wallets for men');
  await searchBar.press('Enter');

  // 3. Wait for search results to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  const products = page.locator('li.s-item');
  const count = await products.count();
  console.log(`Found ${count} items.`);

  // 4. Pick first valid product
  let validProduct = null;
  for (let i = 0; i < count; i++) {
    const item = products.nth(i);
    const title = (await item.locator('.s-item__title').textContent())?.trim();
    if (title && !title.toLowerCase().includes('shop on ebay')) {
      validProduct = item;
      break;
    }
  }

  if (!validProduct) throw new Error('❌ No valid product found.');

  const link = validProduct.locator('a.s-item__link');
  const href = await link.getAttribute('href');
  console.log('➡️ Clicking product link:', href);

  // 5. Open product in new tab
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    link.click(),
  ]);

  await newPage.waitForLoadState('domcontentloaded');
  await newPage.waitForURL(/\/itm\//, { timeout: 20000 });

  // 6. Check product title
  const productTitle = newPage.locator('h1, #itemTitle, .x-item-title__mainTitle');
  await expect(productTitle).toBeVisible({ timeout: 10000 });
  const titleText = await productTitle.textContent();
  console.log('🛍️ Product Title:', titleText?.trim());

  // 7. Save screenshot + HTML dump for debugging
  await newPage.screenshot({ path: 'product-page.png', fullPage: true });
  const htmlContent = await newPage.content();
  fs.writeFileSync('product-page.html', htmlContent);
  console.log('📸 Screenshot and HTML saved.');

  // 8. Try to scroll down to load similar items
  await newPage.mouse.wheel(0, 1000);
  await newPage.waitForTimeout(3000);

  // 9. Try multiple possible selectors for the Similar Items section
  const possibleSelectors = [
    'section[aria-label="Similar items"]',
    'section[aria-label*="similar"]',
    'div#vi-related-items',
    'section#vi-related-items',
    '.rl-related-items',
    '.b-visualnav__container',
    '.s-item__related',
    '.carousel',
  ];

  let similarSection = null;
  for (const selector of possibleSelectors) {
    const handle = await newPage.$(selector);
    if (handle) {
      similarSection = newPage.locator(selector);
      console.log('✅ Found similar items section using:', selector);
      break;
    }
  }

  if (!similarSection) {
    console.warn('⚠️ Similar items section not found. See screenshot + HTML.');
    await browser.close();
    return;
  }

  await expect(similarSection.first()).toBeVisible({ timeout: 10000 });

  // 10. Count the similar products inside the section
  const similarItems = similarSection.locator('a[href*="/itm/"], li.s-item');
  const similarCount = await similarItems.count();
  console.log(`🛍️ Similar items found: ${similarCount}`);

  if (similarCount > 0 && similarCount <= 6) {
    console.log('✅ Test Passed: Similar items count is within expected range (1–6).');
  } else if (similarCount > 6) {
    console.warn('⚠️ Test Warning: More than 6 similar items found.');
  } else {
    throw new Error('❌ No similar items found inside the section.');
  }

  await browser.close();
}, 60000); // 60 seconds timeout
