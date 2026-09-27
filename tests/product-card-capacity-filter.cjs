const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/嗡嗡/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.locator('[data-pc-nav="distribution"]').click();
    await page.locator('#pcDistributionView [data-view="plan"]').click();
    const warning = page.locator('[data-dist-toggle="planCapacityWarning"]');
    const rows = page.locator('#pcDistributionBody tr:not(:has(.pc-empty))');
    const ids = () => rows.locator('td:first-child .pc-cell-sub').allTextContents();

    // Controlled boundaries verify capacity filtering and account-name searches.
    const fixture = await page.evaluate(() => {
      const app = ProductCardApp;
      const [account, other] = app.data.accounts;
      const template = app.data.plans[0];
      const plans = [449, 450, 499, 500].map((current, index) => ({
        ...template, id: `CAP-${index}`, name: `容量测试 ${current}`, current,
        status: index === 3 ? 'paused' : 'active', accountId: account.id, shopId: account.shopId
      }));
      plans.push({ ...template, id: 'CAP-other', current: 470, accountId: other.id, shopId: other.shopId });
      app.data.plans = plans;
      app.distribution.filters.planStatus = 'all';
      app.renderDistribution();
      return { accountId: account.id, accountName: account.name, otherId: other.id, otherName: other.name };
    });
    assert.equal(await rows.count(), 5);
    await warning.check();
    assert.deepEqual((await ids()).sort(), ['CAP-1', 'CAP-2', 'CAP-3', 'CAP-other']);
    await page.locator('[data-dist-plan-status="paused"]').click();
    assert.deepEqual(await ids(), ['CAP-3']);
    await page.locator('[data-dist-plan-status="all"]').click();
    await warning.uncheck();
    assert.equal(await rows.count(), 5);

    // Drilldown must not inherit stale filters or a later page.
    await page.evaluate(() => {
      Object.assign(ProductCardApp.distribution.filters, { planSearch: '不存在', planStatus: 'rejected', planOnlyActive: true });
      ProductCardApp.distribution.page = 9;
    });
    await page.locator('#pcDistributionView [data-view="account"]').click();
    await page.locator(`[data-plan-capacity-warning][data-account-plans="${fixture.accountId}"]`).click();
    assert(await warning.isChecked());
    assert.deepEqual((await ids()).sort(), ['CAP-1', 'CAP-2', 'CAP-3']);
    assert.equal(await page.locator('[data-dist-filter="planSearch"]').inputValue(), fixture.accountName);
    assert.equal(await page.locator('[data-clear-plan-account]').count(), 0);
    assert.equal(await page.locator('[data-dist-toggle="planOnlyActive"]').isChecked(), false);
    assert.equal(await page.evaluate(() => ProductCardApp.distribution.page), 1);
    assert(await page.locator('#pcDistributionView [data-view="plan"]').evaluate(node => node.classList.contains('active')));
    await page.locator('[data-dist-filter="planSearch"]').fill('');
    assert.deepEqual((await ids()).sort(), ['CAP-1', 'CAP-2', 'CAP-3', 'CAP-other']);

    // The warning badge and full badge both open all warning plans in their own account.
    await page.locator('#pcDistributionView [data-view="account"]').click();
    await page.locator(`[data-plan-capacity-warning][data-account-plans="${fixture.otherId}"]`).click();
    assert.equal(await page.locator('[data-dist-filter="planSearch"]').inputValue(), fixture.otherName);
    assert.deepEqual(await ids(), ['CAP-other']);
    await warning.uncheck();
    assert.deepEqual(await ids(), ['CAP-other']);
    await page.locator('#pcDistributionView [data-view="account"]').click();
    await page.locator(`[data-account-plans="${fixture.accountId}"][data-plan-status="active"]`).click();
    assert.equal(await warning.isChecked(), false);
    assert.deepEqual((await ids()).sort(), ['CAP-0', 'CAP-1', 'CAP-2']);

    // Combining filters can produce a valid empty result, and clearing it restores plans.
    await warning.check();
    await page.locator('[data-dist-filter="planSearch"]').fill('不存在');
    assert(await page.locator('#pcDistributionBody .pc-empty').isVisible());
    await page.locator('[data-dist-filter="planSearch"]').fill('');
    assert.deepEqual((await ids()).sort(), ['CAP-1', 'CAP-2', 'CAP-other']);
    assert.deepEqual(errors, []);
    console.log('PASS capacity boundaries, account drilldown, stale filters, scope clearing, status and search combinations');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
