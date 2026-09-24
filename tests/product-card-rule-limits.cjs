const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/嗡嗡/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});
  try {
    const page = await browser.newPage({viewport:{width:1600,height:1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    await page.waitForFunction(() => window.ProductCardApp?.openNewGeneration);
    await page.locator('[data-pc-nav="generation"]').click();
    const openNew = () => page.evaluate(() => ProductCardApp.openNewGeneration(ProductCardApp.data.products[0].id));
    await openNew();
    await page.locator('#pcAddRule').click();
    assert.equal(await page.locator('[data-rule-qty]').first().inputValue(), '1');
    await page.locator('[data-rule-qty]').first().fill('4');
    await page.locator('[data-rule-qty]').first().blur();
    await page.locator('[data-rule-action="copy"]').first().click();
    assert.equal(await page.locator('[data-rule-qty]').nth(1).inputValue(), '4');
    await page.locator('[data-rule-action="insert"]').first().click();
    assert.equal(await page.locator('[data-rule-qty]').nth(1).inputValue(), '1');

    await openNew();
    await page.locator('[data-source-library]').click();
    await page.locator('[data-library-image]').first().click();
    await page.locator('#pcLibraryConfirm').click();
    assert.equal(await page.locator('[data-rule-qty]').count(), 50);
    assert(await page.locator('[data-rule-qty]').evaluateAll(nodes => nodes.every(node => node.value === '1')));
    assert.match(await page.locator('#pcRuleSummary').innerText(), /50\/200 张/);

    await openNew();
    await page.locator('#pcAddRule').click();
    await page.locator('[data-rule-image-action="add-library"]').click();
    await page.locator('[data-library-image]').nth(0).click();
    await page.locator('[data-library-image]').nth(1).click();
    await page.locator('[data-library-image]').nth(2).click();
    assert.equal(await page.locator('.pc-library-card.selected').count(), 2);
    await page.locator('#pcLibraryConfirm').click();
    assert.equal(await page.locator('.pc-rule-thumb').count(), 2);
    assert.equal(await page.locator('[data-rule-image-action="add-local"]').count(), 0);
    assert.equal(await page.locator('[data-rule-image-action="replace"]').count(), 2);

    await openNew();
    await page.locator('#pcAddRule').click();
    const chooserPromise = page.waitForEvent('filechooser');
    await page.locator('[data-rule-image-action="add-local"]').first().click();
    const chooser = await chooserPromise;
    await chooser.setFiles({name:'local.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')});
    await page.locator('.pc-rule-thumb').waitFor();
    await page.locator('[data-rule-image-action="add-library"]').click();
    await page.locator('[data-library-image]').nth(0).click();
    await page.locator('[data-library-image]').nth(1).click();
    assert.equal(await page.locator('.pc-library-card.selected').count(), 1);
    assert.match(await page.locator('#pcLibrarySelected').innerText(), /最多 1 张/);
    await page.locator('#pcLibraryConfirm').click();
    assert.equal(await page.locator('.pc-rule-thumb').count(), 2);

    for (const action of ['add', 'insert']) {
      await page.evaluate(() => {
        const app = ProductCardApp, source = structuredClone(app.data.generationTasks.find(task => task.rules?.length));
        source.id = 'LIMIT-199'; source.status = 'draft'; source.target = 199;
        source.rules = Array.from({length:10}, (_, index) => ({...structuredClone(source.rules[0]),id:`LIMIT-${index}`,quantity:index === 9 ? 19 : 20}));
        app.openGenerationStrategy(source);
      });
      if (action === 'add') await page.locator('#pcAddRule').click();
      else await page.locator('[data-rule-action="insert"]').first().click();
      assert.match(await page.locator('#pcRuleSummary').innerText(), /200\/200 张/);
      assert(await page.locator('#pcAddRule').isDisabled());
    }

    await page.evaluate(() => {
      const app = ProductCardApp, source = structuredClone(app.data.generationTasks.find(task => task.rules?.length));
      source.id = 'LEGACY-THREE'; source.status = 'draft'; source.target = 6;
      source.rules = [{...source.rules[0],quantity:6,promptState:'ready',images:app.data.imageLibrary.slice(0,3).map(image => ({...image,source:'library'}))}];
      app.openGenerationStrategy(source);
    });
    assert.equal(await page.locator('.pc-rule-thumb').count(), 3, 'legacy references must not be silently deleted');
    assert.equal(await page.locator('[data-rule-qty]').inputValue(), '6');
    assert.match(await page.locator('.pc-prompt-error').innerText(), /最多 2 张垫图/);
    await page.locator('#pcSubmitGeneration').click();
    assert.equal(await page.locator('#pcConfirmLayer').isVisible(), false, 'over-limit rules must not submit');
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS default quantity, initialization, copy, insertion, mixed image limits, remaining capacity and legacy rules');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
