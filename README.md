Playwright Automation: eBay Product & Similar Items Test

This project is an automated end-to-end test suite using **Playwright** to simulate user behavior on [eBay](https://www.ebay.com/). It performs a product search, selects a real product, navigates to the product page, and verifies the presence of a **Similar Items** section.

🚀 Technologies Used

- [Playwright](https://playwright.dev/)
- Node.js (v18+ recommended)
- JavaScript (ES6)
- Git & GitHub

📁 Project Structure

PLAYWRIGHTAUTOMATION/
node_modules/
tests/ EbayPageTest.spec.js # Main test script
tests-examples/demo-todo-app.spec.js # Default example from Playwright
playwright.config.js # Playwright test configuration
package.json # Project dependencies and scripts
.gitignore # Git ignore rules
product-page.html # (Optional) Static HTML for demo
product-page.png # Screenshot or visual ref
README.md Project documentation


🧪 What This Test Does

1. Navigates to eBay homepage  
2. Searches for _"wallets for men"_  
3. Selects a real product (not a sponsored/shop banner)  
4. Opens product in a new tab  
5. Validates product title visibility  
6. Detects and verifies similar/recommended items section



⚙️ How to Run the Tests

npx playwright test tests/EbayPageTest.spec.js
