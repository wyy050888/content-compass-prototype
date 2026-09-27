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
    await page.locator('#pcPrimaryAction').click();
    const taskId = await page.locator('[data-wizard-task]').first().getAttribute('data-wizard-task');
    await page.locator('[data-wizard-task]').first().check();
    await page.locator('[data-wizard-image]').nth(0).check();
    await page.locator('[data-wizard-image]').nth(1).check();
    await page.locator('[data-wizard-image]').nth(2).check();
    const fixture = await page.evaluate(taskId => {
      const app = ProductCardApp, template = app.data.plans[0];
      const productId = app.data.generationTasks.find(task => task.id === taskId).productId;
      const values = [
        { spend: 3, orders: 8, gmv: 90, roi: 1.5, current: 100 },
        { spend: 10, orders: 2, gmv: 20, roi: 3, current: 300 },
        { spend: 1, orders: 4, gmv: 30, roi: 2, current: 200 }
      ];
      app.data.plans = values.map((values, i) => ({ ...template, ...values, id: `SORT-${i}`, name: `排序计划 ${i}`, productId, canUpload: true, status: 'active' }));
      return { plans: app.data.plans, shopId: template.shopId };
    }, taskId);
    await page.locator('[data-wizard-action="next"]').click();
    await page.locator(`[data-wizard-shop="${fixture.shopId}"]`).check();
    const ids = () => page.locator('[data-wizard-plan]').evaluateAll(nodes => nodes.map(node => node.dataset.wizardPlan));
    const sort = field => page.locator(`[data-wizard-plan-sort="${field}"]`);
    const original = fixture.plans.map(plan => plan.id);
    assert.equal(await page.locator('[data-wizard-plan-sort]').count(), 5);
    for (const field of ['spend', 'orders', 'gmv', 'roi', 'current']) {
      const first = field === 'current' ? 1 : -1;
      for (const direction of [first, -first]) {
        await sort(field).click();
        assert.deepEqual(await ids(), [...fixture.plans].sort((a, b) => (a[field] - b[field]) * direction).map(plan => plan.id));
        assert.equal(await sort(field).locator('..').getAttribute('aria-sort'), direction === 1 ? 'ascending' : 'descending');
      }
      await sort(field).click();
      assert.deepEqual(await ids(), original);
      assert.equal(await sort(field).locator('..').getAttribute('aria-sort'), 'none');
    }
    // New selections follow sorted rows. Later sorts preserve quantities and image assignment.
    await sort('roi').click();
    await page.locator('[data-plan-bulk="all"]').click();
    await page.locator('[data-wizard-action="next"]').click();
    const allocation = await page.locator('.pc-review-section').innerHTML();
    await page.locator('[data-wizard-action="prev"]').click();
    await sort('current').click();
    await page.locator('[data-wizard-action="next"]').click();
    assert.equal(await page.locator('.pc-review-section').innerHTML(), allocation);
    await page.locator('[data-wizard-action="prev"]').click();
    await page.locator('[data-wizard-action="save-draft"]').click();
    const draft = await page.evaluate(() => ProductCardApp.data.distributionTasks.find(task => task.id.startsWith('DT-') && task.draftState?.planSort === 'current-asc'));
    assert.deepEqual(draft.draftState.planOrder, ['SORT-1', 'SORT-2', 'SORT-0']);
    assert.deepEqual(draft.draftState.quantities, { 'SORT-1': 1, 'SORT-2': 1, 'SORT-0': 1 });
    await page.evaluate(id => ProductCardApp.openDistributionWizard('', id), draft.id);
    await page.locator('[data-wizard-action="next"]').click();
    assert.equal(await sort('current').locator('..').getAttribute('aria-sort'), 'ascending');

    // Metrics are resolved through the selected time range, with ties stable and missing values last.
    assert(await page.evaluate(() => {
      const dist = ProductCardApp.distribution, saved = dist.performanceForRange;
      const range = { marker: true }, seen = [];
      dist.performanceForRange = (plan, input) => { seen.push(input === range); return { spend: plan.metric }; };
      try {
        const plans = [{ id: 'missing' }, { id: 'a', metric: 2 }, { id: 'b', metric: 2 }, { id: 'c', metric: 10 }];
        return dist.wizardPlanSorting.apply(plans, 'spend-desc', range).map(plan => plan.id).join() === 'c,a,b,missing'
          && dist.wizardPlanSorting.apply(plans, 'spend-asc', range).map(plan => plan.id).join() === 'a,b,c,missing'
          && seen.every(Boolean) && plans[0].id === 'missing';
      } finally { dist.performanceForRange = saved; }
    }));
    assert.deepEqual(errors, []);
    console.log('PASS wizard sort: five fields, three states, sorted bulk selection, unchanged allocation, draft restore and range metrics');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
