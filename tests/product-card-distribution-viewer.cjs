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
    await page.locator('[data-wizard-task]').first().check();
    const imageId = await page.locator('[data-wizard-preview]').first().getAttribute('data-wizard-preview');
    const prompt = '保留商品主体与原有中文文字，仅调整背景光线。\n保持结构和配件不变，不增加参数或促销信息。\n'.repeat(20);
    await page.evaluate(({ imageId, prompt }) => {
      const image = ProductCardApp.data.images.find(image => image.id === imageId);
      image.promptSnapshot = prompt;
      image.referenceImagesSnapshot = [{ id: 'snapshot-reference', order: 0 }];
    }, { imageId, prompt });
    await page.locator('[data-wizard-preview]').first().click();
    const viewer = page.locator('.pc-screen-viewer');
    assert(await viewer.isVisible());
    assert.equal(await page.locator('#pcScreenViewerStatus').isVisible(), false);
    assert.equal(await page.locator('.pc-screen-distribution-count dd span').innerText(), '0');
    assert.equal(await page.locator('.pc-screen-viewer-prompt').textContent(), prompt);
    assert.equal(await page.locator('[data-screen-reference]').count(), 1);
    await page.locator('[data-screen-reference]').hover();
    assert(await page.locator('.pc-screen-reference-preview').isVisible());
    await page.locator('#pcScreenViewerTitle').hover();
    assert.equal(await page.locator('.pc-screen-reference-preview').isVisible(), false);
    assert(await page.locator('.pc-screen-prompt-scroll').evaluate(node => node.scrollHeight > node.clientHeight));
    assert.equal(await page.locator('[data-screen-viewer-status]').count(), 0);
    assert.doesNotMatch(await viewer.innerText(), /展开全文|复制|本次分发|分发详情|重试分发|成功记录/);
    const footer = await page.locator('.pc-screen-viewer-footer').evaluate(node => {
      const bounds = node.getBoundingClientRect();
      const previous = node.querySelector('[data-screen-viewer-nav="prev"]').getBoundingClientRect();
      const next = node.querySelector('[data-screen-viewer-nav="next"]').getBoundingClientRect();
      const hint = node.querySelector('.pc-screen-shortcuts').getBoundingClientRect();
      return { left: previous.left - bounds.left, right: bounds.right - next.right, center: (hint.left + hint.right - bounds.left - bounds.right) / 2 };
    });
    assert(footer.left < 30 && footer.right < 30 && Math.abs(footer.center) < 1);
    await page.locator('[data-screen-viewer-nav="next"]').click();
    assert.match(await page.locator('#pcScreenViewerIndex').innerText(), /^2\s*\//);
    await page.keyboard.press('ArrowLeft');
    assert.match(await page.locator('#pcScreenViewerIndex').innerText(), /^1\s*\//);
    await page.keyboard.press('Delete');
    assert.equal(await page.evaluate(id => ProductCardApp.data.images.find(image => image.id === id).screenStatus, imageId), 'selected');
    assert.equal(await page.locator(`[data-wizard-image="${imageId}"]`).isChecked(), false);

    // 产品与分发预览的正文一致，均显示累计成功分发次数。
    const sameMarkup = await page.evaluate(id => {
      const app = ProductCardApp;
      const body = document.querySelector('#pcScreenViewerBody').cloneNode(true);
      const images = [...document.querySelectorAll('[data-wizard-preview]')].map(node => app.data.images.find(image => image.id === node.dataset.wizardPreview));
      app.openProductImageViewer(id, images);
      return body.innerHTML === document.querySelector('#pcScreenViewerBody').innerHTML;
    }, imageId);
    assert(sameMarkup);
    assert(await page.locator('#pcScreenViewerStatus').isVisible());
    assert.equal(await page.locator('#pcScreenViewerStatus').innerText(), '已选用');
    assert(await page.locator('.pc-screen-distribution-count').isVisible());
    assert.equal(await page.locator('.pc-screen-distribution-count dd span').innerText(), '0');
    await page.keyboard.press('Escape');
    await page.locator('[data-wizard-preview]').first().click();
    if (process.env.VIEWER_SCREENSHOT) await page.screenshot({ path: process.env.VIEWER_SCREENSHOT });
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => ProductCardApp.isDistributionImageViewerOpen()), false);
    assert(await page.locator('#pcDrawerLayer').evaluate(node => node.classList.contains('show')));

    const expected = await page.evaluate(() => {
      const app = ProductCardApp, dist = app.distribution;
      const task = app.data.distributionTasks.find(task => task.success > 0);
      const record = dist.ensureImageResults(task).find(record => record.status === 'success');
      const image = app.data.images.find(image => image.id === record.imageId);
      app.openDistributionImageViewer(record.id, [record.id]);
      return dist.distributionCount(image);
    });
    assert(expected > 0);
    assert.equal(await page.locator('#pcScreenViewerStatus').isVisible(), false);
    assert.equal(Number(await page.locator('.pc-screen-distribution-count dd span').innerText()), expected);
    for (const width of [1280, 760, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await viewer.evaluate(node => node.scrollWidth <= node.clientWidth));
    }
    assert.deepEqual(errors, []);
    console.log('PASS shared generation/distribution viewer: identical layout, successful counts, reference preview, full prompt, readonly navigation, responsive layout');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
