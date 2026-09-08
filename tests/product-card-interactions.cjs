const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/嗡嗡/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack));
    await page.goto(`file:///${path.resolve(__dirname, '../index.html').replaceAll('\\', '/')}`);
    await page.waitForTimeout(700);

    await page.locator('[data-pc-nav="generation"]').click();
    await page.locator('#pcPrimaryAction').click();
    assert.equal(await page.locator('#pcTaskName').getAttribute('maxlength'), '50');
    assert.equal(await page.locator('#pcTaskNameCount').textContent(), '0/50');
    await page.locator('#pcTaskName').fill('测试任务');
    assert.equal(await page.locator('#pcTaskNameCount').textContent(), '4/50');
    assert.equal(await page.locator('#pcSourceLocalInput').getAttribute('accept'), '.png,.jpg,.jpeg,image/png,image/jpeg');
    assert.equal(await page.locator('#pcSourceLocalInput').getAttribute('multiple'), null);
    assert.equal(await page.locator('#pcRuleLocalInput').getAttribute('multiple'), null);

    await page.locator('#pcSourceLocalInput').setInputFiles({ name: '错误格式.webp', mimeType: 'image/webp', buffer: Buffer.from('not-an-image') });
    assert.match(await page.locator('#pcUploadFeedback').innerText(), /仅支持 PNG、JPG、JPEG/);
    await page.locator('#pcSourceLocalInput').setInputFiles({ name: '超大图片.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
    assert.match(await page.locator('#pcUploadFeedback').innerText(), /不能超过 10 MB/);
    const rectanglePng = await page.screenshot({ clip: { x: 0, y: 0, width: 2, height: 1 } });
    await page.locator('#pcSourceLocalInput').setInputFiles({ name: '非正方形.png', mimeType: 'image/png', buffer: rectanglePng });
    await page.waitForFunction(() => document.querySelector('#pcUploadFeedback')?.textContent.includes('必须为 1:1'));
    assert.match(await page.locator('#pcUploadFeedback').innerText(), /必须为 1:1/);
    const squarePng = await page.screenshot({ clip: { x: 0, y: 0, width: 2, height: 2 } });
    await page.locator('#pcSourceLocalInput').setInputFiles({ name: '商品主图.png', mimeType: 'image/png', buffer: squarePng });
    await page.waitForFunction(() => document.querySelectorAll('.pc-rule-row').length === 50);
    assert.equal(await page.locator('.pc-rule-row').count(), 50);
    await page.waitForTimeout(2200);
    assert.match(await page.locator('#pcPromptStatus').innerText(), /失败 1 条/);
    await page.locator('.pc-rule-row').first().locator('[data-rule-action="retry-prompt"]').click();
    await page.waitForTimeout(2200);
    assert.doesNotMatch(await page.locator('#pcPromptStatus').innerText(), /失败/);
    assert.equal(await page.locator('.pc-rule-row').first().locator('[data-rule-action="retry-prompt"]').count(), 0);

    const generationDraftName = '关闭前保存的生图草稿';
    await page.locator('#pcTaskName').fill(generationDraftName);
    await page.locator('.pc-drawer-head [data-pc-close-drawer]').click();
    const confirm = page.locator('#pcConfirmLayer');
    await expectVisible(confirm);
    assert.deepEqual(await visibleButtons(confirm), ['放弃修改', '继续编辑', '保存草稿']);
    await confirm.getByRole('button', { name: '保存草稿' }).click();
    await page.locator('#pcDrawerLayer').waitFor({ state: 'hidden' });
    assert(await page.evaluate(name => ProductCardApp.data.generationTasks.some(task => task.name === name && task.status === 'draft'), generationDraftName));
    assert.equal(await page.locator('#pcGenerationStatus .active').getAttribute('data-status'), 'draft');
    const savedGenerationRow = page.locator('[data-generation-task-id]').filter({ hasText: generationDraftName });
    await expectVisible(savedGenerationRow);
    assert(await savedGenerationRow.evaluate(row => row.classList.contains('pc-saved-task-highlight')));

    await page.locator('[data-pc-nav="distribution"]').click();
    await page.locator('#pcPrimaryAction').click();
    const initialName = await page.locator('#pcDistributionTaskName').inputValue();
    assert.match(initialName, /^图片分发_\d{12}$/);
    await page.locator('[data-wizard-task]').first().check();
    const generatedName = await page.locator('#pcDistributionTaskName').inputValue();
    assert.match(generatedName, /-图片分发_\d{12}$/);
    if (process.env.PC_VISUAL_OUTPUT) await page.screenshot({ path: `${process.env.PC_VISUAL_OUTPUT}-wizard.png`, fullPage: true });
    const distributionDraftName = '用户修改后的分发任务';
    await page.locator('#pcDistributionTaskName').fill(distributionDraftName);
    await page.locator('[data-image-bulk="all"]').click();
    await page.locator('[data-wizard-action="next"]').click();
    assert.equal(await page.locator('#pcDistributionTaskName').inputValue(), distributionDraftName);
    await page.locator('[data-wizard-shop]').first().check();
    await page.locator('[data-plan-bulk="all"]').click();
    await page.locator('[data-wizard-action="next"]').click();
    assert.equal(await page.locator('#pcDistributionTaskName').inputValue(), distributionDraftName);
    await page.locator('[data-pc-close-drawer]').last().click();
    await expectVisible(confirm);
    if (process.env.PC_VISUAL_OUTPUT) await page.screenshot({ path: `${process.env.PC_VISUAL_OUTPUT}-confirm.png`, fullPage: true });
    await confirm.getByRole('button', { name: '继续编辑' }).click();
    await expectVisible(page.locator('#pcDrawerLayer'));
    await page.locator('[data-pc-close-drawer]').last().click();
    await confirm.getByRole('button', { name: '保存草稿' }).click();
    await page.locator('#pcDrawerLayer').waitFor({ state: 'hidden' });
    assert(await page.evaluate(name => ProductCardApp.data.distributionTasks.some(task => task.name === name && task.status === 'draft'), distributionDraftName));

    await page.locator('[data-pc-nav="distribution"]').click();
    await page.locator('#pcPrimaryAction').click();
    await page.locator('[data-wizard-task]').first().check();
    await page.locator('[data-image-bulk="all"]').click();
    await page.locator('[data-wizard-action="next"]').click();
    const missingDefaultAccount = page.locator('.pc-target-shop.disabled').filter({ hasText: '吹风机专营店' });
    await expectVisible(missingDefaultAccount);
    assert(await missingDefaultAccount.locator('input[type="checkbox"]').isDisabled());
    assert.match(await missingDefaultAccount.innerText(), /缺少有效默认千川广告账户/);
    await missingDefaultAccount.getByRole('button', { name: '去授权配置' }).click();
    await expectVisible(confirm);
    await confirm.getByRole('button', { name: '放弃修改' }).click();
    await page.locator('#page-account-config.active').waitFor();
    assert.equal(await page.locator('#acAccountShopSearch').inputValue(), '吹风机专营店');
    assert.equal(await page.locator('#acAccountPlatformFilter').inputValue(), 'qianchuan');
    assert.equal(await page.locator('#acAccountAppliedFilter').innerText(), '已筛选店铺\n吹风机专营店\n清除');
    assert.match(await page.locator('#acAccountBody').innerText(), /吹风机千川投放[\s\S]*设为店铺默认账户/);

    await page.evaluate(() => {
      const app = ProductCardApp;
      for (let index = 0; index < 25; index += 1) app.data.products.push({ id: `PAGE-PRODUCT-${index}`, name: `分页产品${index}` });
      const shopId = app.data.shops[0].id;
      const accountId = app.data.accounts[0].id;
      const productId = app.data.products[0].id;
      for (let index = 0; index < 25; index += 1) {
        app.data.accounts.push({ id: `PAGE-ACCOUNT-${index}`, name: `分页账户${index}`, shopId, authorizationStatus: 'enabled' });
        app.data.plans.push({ id: `PAGE-PLAN-${index}`, name: `分页计划${index}`, shopId, accountId, productId, status: 'active', canUpload: true, current: 10, spend: 1, orders: 1, gmv: 1, roi: 1 });
      }
    });
    await page.locator('[data-pc-nav="generation"]').click();
    await page.locator('[data-generation-view="product"]').click();
    assert.match(await page.locator('#pcProductFooter').innerText(), /1 \/ 2/);
    await page.locator('#pcProductFooter [data-product-page="next"]').click();
    assert.match(await page.locator('#pcProductFooter').innerText(), /2 \/ 2/);

    await page.locator('[data-pc-nav="distribution"]').click();
    await page.locator('#pcDistributionView [data-view="account"]').click();
    assert.match(await page.locator('#pcDistributionPagination').innerText(), /1 \/ 2/);
    await page.locator('#pcDistributionPagination [data-dist-page="next"]').click();
    assert.match(await page.locator('#pcDistributionPagination').innerText(), /2 \/ 2/);
    await page.locator('#pcDistributionView [data-view="plan"]').click();
    assert.match(await page.locator('#pcDistributionPagination').innerText(), /1 \/ 2/);
    await page.locator('#pcDistributionPagination [data-dist-page="next"]').click();
    assert.match(await page.locator('#pcDistributionPagination').innerText(), /2 \/ 2/);

    assert.deepEqual(errors, []);
    console.log('PASS unsaved choices/task names/upload validation/product-account-plan pagination');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });

async function expectVisible(locator) {
  await locator.waitFor({ state: 'visible' });
  assert(await locator.isVisible());
}

async function visibleButtons(locator) {
  return locator.getByRole('button').evaluateAll(buttons => buttons.filter(button => button.getBoundingClientRect().width > 0).map(button => button.textContent.trim()).filter(Boolean));
}
