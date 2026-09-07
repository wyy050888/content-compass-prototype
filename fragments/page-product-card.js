(function () {
  const script = document.currentScript;
  if (!script) return;
  script.insertAdjacentHTML("beforebegin", `
    <section class="page" id="page-product-card">
      <div class="pc-page">
        <header class="pc-page-head">
          <div>
            <h1 id="pcPageTitle">图片生成</h1>
            <p id="pcPageSubtitle">生成并管理商品卡图片</p>
          </div>
          <button class="pc-btn pc-btn-primary" id="pcPrimaryAction">新建生图任务</button>
        </header>

        <section class="pc-section active" data-pc-panel="generation">
          <div class="pc-generation-mode-row pc-primary-view-row">
            <div class="pc-segmented pc-generation-mode pc-primary-view-tabs" id="pcGenerationViewMode" aria-label="图片生成视图">
              <button class="active" data-generation-view="task">任务视图</button>
              <button data-generation-view="product">产品视图</button>
            </div>
          </div>
          <div class="pc-generation-subview active" id="pcGenerationTaskView" data-generation-subview="task">
            <div class="pc-view-row">
              <div class="pc-segmented" id="pcGenerationScope">
                <button class="active" data-scope="all">全部任务</button>
                <button data-scope="personal">个人任务</button>
                <button data-scope="team">团队任务</button>
              </div>
            </div>
            <div class="pc-metrics" id="pcGenerationMetrics"></div>
            <div class="pc-card pc-table-card">
              <div class="pc-toolbar pc-generation-toolbar">
                <div class="pc-toolbar-main">
                  <div class="pc-query-row">
                    <label class="pc-search"><span>⌕</span><input id="pcGenerationSearch" placeholder="搜索任务名称、产品名称或任务ID"></label>
                    <label class="pc-search pc-creator-search" id="pcGenerationCreatorWrap" hidden><span>⌕</span><input id="pcGenerationCreator" placeholder="搜索创建人"></label>
                    <div id="pcGenerationDateRange"></div>
                  </div>
                </div>
                <div class="pc-status-filters" id="pcGenerationStatus" aria-label="筛选任务状态">
                  <button class="active" data-status="all">全部</button>
                  <button data-status="draft">草稿</button>
                  <button data-status="pending">待生成</button>
                  <button data-status="running">生成中</button>
                  <button data-status="paused">已暂停</button>
                  <button data-status="success">生成成功</button>
                  <button data-status="partial">部分成功</button>
                  <button data-status="failed">生成失败</button>
                  <button data-status="cancelled">已取消</button>
                </div>
              </div>
              <div class="pc-table-scroll">
                <table class="pc-table pc-generation-table">
                  <colgroup id="pcGenerationCols"></colgroup>
                  <thead id="pcGenerationHead"></thead>
                  <tbody id="pcGenerationBody"></tbody>
                </table>
              </div>
              <div class="pc-pagination" id="pcGenerationPagination"></div>
            </div>
          </div>
          <div class="pc-generation-subview" id="pcGenerationProductView" data-generation-subview="product">
            <div class="pc-metrics" id="pcProductMetrics"></div>
            <div class="pc-card pc-table-card">
              <div class="pc-toolbar pc-product-toolbar">
                <label class="pc-search"><span>⌕</span><input id="pcProductSearch" placeholder="搜索产品名称或产品ID"></label>
                <div class="pc-status-filters" id="pcProductStatus" aria-label="筛选产品状态">
                  <button class="active" data-product-status="all">全部产品</button>
                  <button data-product-status="active">进行中</button>
                  <button data-product-status="screening">待筛选</button>
                  <button data-product-status="completed">已完成</button>
                </div>
              </div>
              <div class="pc-table-scroll">
                <table class="pc-table pc-product-table">
                  <thead><tr><th>产品</th><th>产品状态</th><th>生成任务</th><th>生成图片</th><th>筛选进度</th><th>最近生成</th><th>操作</th></tr></thead>
                  <tbody id="pcProductBody"></tbody>
                </table>
              </div>
              <div class="pc-pagination pc-product-footer" id="pcProductFooter"></div>
            </div>
          </div>
        </section>

        <section class="pc-section" data-pc-panel="distribution">
          <div class="pc-view-row pc-primary-view-row">
            <div class="pc-segmented pc-primary-view-tabs" id="pcDistributionView">
              <button class="active" data-view="task">任务视图</button>
              <button data-view="account">广告账户视图</button>
              <button data-view="plan">计划视图</button>
            </div>
          </div>
          <div class="pc-view-row pc-distribution-task-scope-row" id="pcDistributionTaskScopeRow">
            <div class="pc-segmented" id="pcDistributionTaskScope" aria-label="任务范围">
              <button data-dist-scope="all" class="active">全部任务</button>
              <button data-dist-scope="personal">个人任务</button>
              <button data-dist-scope="team">团队任务</button>
            </div>
          </div>
          <div class="pc-metrics" id="pcDistributionMetrics"></div>
          <div class="pc-card pc-table-card">
            <div class="pc-toolbar" id="pcDistributionToolbar"></div>
            <div class="pc-table-scroll">
              <table class="pc-table">
                <colgroup id="pcDistributionCols"></colgroup>
                <thead id="pcDistributionHead"></thead>
                <tbody id="pcDistributionBody"></tbody>
              </table>
            </div>
            <div class="pc-pagination" id="pcDistributionPagination"></div>
          </div>
        </section>
      </div>

      <div class="pc-drawer-layer" id="pcDrawerLayer" aria-hidden="true">
        <button class="pc-drawer-mask" type="button" aria-label="关闭抽屉" data-pc-close-drawer></button>
        <aside class="pc-drawer" role="dialog" aria-modal="true" aria-labelledby="pcDrawerTitle">
          <header class="pc-drawer-head">
            <div><small id="pcDrawerEyebrow"></small><h2 id="pcDrawerTitle"></h2><p id="pcDrawerSubtitle"></p></div>
            <button class="pc-icon-btn" type="button" aria-label="关闭" data-pc-close-drawer>×</button>
          </header>
          <div class="pc-drawer-body" id="pcDrawerBody"></div>
          <footer class="pc-drawer-foot" id="pcDrawerFoot"></footer>
        </aside>
      </div>

      <div class="pc-confirm-layer" id="pcConfirmLayer" aria-hidden="true">
        <button class="pc-confirm-mask" type="button" aria-label="取消" data-pc-confirm="cancel"></button>
        <section class="pc-confirm" role="alertdialog" aria-modal="true" aria-labelledby="pcConfirmTitle">
          <h3 id="pcConfirmTitle"></h3>
          <p id="pcConfirmMessage"></p>
          <div><button class="pc-btn pc-confirm-secondary" data-pc-confirm="secondary" hidden>放弃修改</button><button class="pc-btn" data-pc-confirm="cancel">取消</button><button class="pc-btn pc-btn-primary" data-pc-confirm="ok">确认</button></div>
        </section>
      </div>
    </section>`);
})();
