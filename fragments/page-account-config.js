(function () {
  const script = document.currentScript;
  if (!script) return;
  script.insertAdjacentHTML("beforebegin", `
    <section class="page" id="page-account-config">
      <div class="ac-page">
        <header class="ac-page-head">
          <div><h1>授权配置</h1><p>管理店铺平台授权、广告账户及其授权抖音号</p></div>
          <button class="ac-primary ac-add-auth" id="acAddShopAuth" type="button">添加店铺授权</button>
        </header>
        <nav class="ac-view-tabs" id="acViewTabs" aria-label="授权配置视图">
          <button class="active" data-ac-view="shop">店铺授权</button>
          <button data-ac-view="account">广告账户</button>
          <button data-ac-view="douyin">广告账户授权抖音号</button>
        </nav>
        <section class="ac-panel" data-ac-panel="shop">
          <div class="ac-toolbar ac-toolbar-wrap">
            <label class="ac-search"><span>⌕</span><input id="acShopSearch" placeholder="搜索店铺名称或ID"></label>
            <label class="ac-filter"><span>千川授权状态</span><select id="acQianchuanFilter"><option value="all">全部</option><option value="authorized">已授权</option><option value="failed">授权失败</option><option value="exception">授权异常</option><option value="expired">已过期</option><option value="cancelled">已取消</option><option value="unauthorized">未授权</option></select></label>
            <label class="ac-filter"><span>随心推授权状态</span><select id="acSuixintuiFilter"><option value="all">全部</option><option value="authorized">已授权</option><option value="failed">授权失败</option><option value="exception">授权异常</option><option value="expired">已过期</option><option value="cancelled">已取消</option><option value="unauthorized">未授权</option></select></label>
            <label class="ac-filter"><span>巨量广告授权状态</span><select id="acJuliangFilter"><option value="all">全部</option><option value="authorized">已授权</option><option value="failed">授权失败</option><option value="exception">授权异常</option><option value="expired">已过期</option><option value="cancelled">已取消</option><option value="unauthorized">未授权</option></select></label>
            <span class="ac-result-count" id="acShopCount"></span>
          </div>
          <div class="ac-table-wrap"><table class="ac-table ac-shop-table"><thead><tr><th>店铺</th><th>千川</th><th>随心推</th><th>巨量广告</th><th>操作</th></tr></thead><tbody id="acShopBody"></tbody></table></div>
        </section>
        <section class="ac-panel" data-ac-panel="account" hidden>
          <div class="ac-toolbar ac-toolbar-wrap">
            <label class="ac-search"><span>⌕</span><input id="acAccountSearch" placeholder="搜索广告账户名称或ID"></label>
            <label class="ac-search ac-search-secondary"><span>⌕</span><input id="acAccountShopSearch" placeholder="搜索店铺名称或ID"></label>
            <label class="ac-filter"><span>账户平台</span><select id="acAccountPlatformFilter"><option value="all">全部</option><option value="qianchuan">千川</option><option value="suixintui">随心推</option><option value="juliang">巨量广告</option></select></label>
            <label class="ac-checkbox"><input type="checkbox" id="acDefaultOnly"><span>仅看店铺默认账户</span></label>
            <span class="ac-result-count" id="acAccountCount"></span>
          </div>
          <div class="ac-applied-filter" id="acAccountAppliedFilter" hidden><span>已筛选店铺</span><strong id="acAccountAppliedShop"></strong><button type="button" id="acAccountClearShop">清除</button></div>
          <div class="ac-table-wrap"><table class="ac-table ac-account-table"><thead><tr><th>广告账户</th><th>平台</th><th>店铺</th><th>授权抖音号数</th><th>操作</th></tr></thead><tbody id="acAccountBody"></tbody></table></div>
        </section>
        <section class="ac-panel" data-ac-panel="douyin" hidden>
          <div class="ac-toolbar">
            <label class="ac-search ac-search-wide"><span>⌕</span><input id="acDouyinSearch" placeholder="搜索抖音号、广告账户或店铺名称/ID"></label>
            <span class="ac-result-count" id="acDouyinCount"></span>
          </div>
          <div class="ac-table-wrap"><table class="ac-table ac-douyin-table"><thead><tr><th>抖音号</th><th>广告账户</th><th>店铺/主体</th><th>授权状态</th><th>更新时间</th></tr></thead><tbody id="acDouyinBody"></tbody></table></div>
        </section>
      </div>
      <div class="ac-guide-mask" id="acGuideMask" hidden>
        <section class="ac-guide" role="dialog" aria-modal="true" aria-labelledby="acGuideTitle">
          <header class="ac-guide-head">
            <div><h3 id="acGuideTitle">授权引导</h3><p>完成以下步骤，将店铺授权给内容罗盘</p></div>
            <button class="ac-guide-close" id="acGuideClose" type="button" aria-label="关闭授权引导">×</button>
          </header>
          <div class="ac-guide-targets">
            <label><span>授权店铺</span><select id="acGuideShop"></select></label>
          </div>
          <div class="ac-guide-steps">
            <article class="ac-guide-step">
              <span class="ac-guide-index">1</span>
              <div class="ac-guide-icon ac-guide-icon-browser" aria-hidden="true"><i></i></div>
              <h4>登录抖店账户</h4>
              <p>请在当前浏览器中，提前登录需要授权的抖店账户</p>
            </article>
            <article class="ac-guide-step">
              <span class="ac-guide-index">2</span>
              <div class="ac-guide-icon ac-guide-icon-click" aria-hidden="true"><i></i></div>
              <h4>发起授权</h4>
              <p>点击下方“去授权”，进入官方授权页面</p>
            </article>
            <article class="ac-guide-step">
              <span class="ac-guide-index">3</span>
              <div class="ac-guide-icon ac-guide-icon-check" aria-hidden="true"><i></i></div>
              <h4>选择平台及账户</h4>
              <p>在官方授权页面选择授权平台和账户并确认</p>
            </article>
          </div>
          <footer class="ac-guide-foot"><button class="ac-primary" id="acGuideAuthorize" type="button">去授权</button></footer>
        </section>
      </div>
      <div class="ac-confirm-mask" id="acConfirmMask" hidden><section class="ac-confirm" role="dialog" aria-modal="true" aria-labelledby="acConfirmTitle"><h3 id="acConfirmTitle"></h3><p id="acConfirmText"></p><div><button id="acConfirmCancel">取消</button><button class="ac-primary" id="acConfirmOk">确认</button></div></section></div>
      <div class="ac-toast" id="acToast" hidden></div>
    </section>`);
})();
