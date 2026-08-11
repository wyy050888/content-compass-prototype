(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 素材监控 -->
      <section class="page" id="page-material-monitor">
        <div class="promo-page">
          <div class="page-head">
            <div>
              <h1>低效素材监控</h1>
              <p>双轨清理机制：投放账户按<span id="mmDayLabel">7</span>天零展现零消耗规则，过审账户按审核状态规则自动扫描清理。</p>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="ghost-btn" id="mmRuleBtn">⚙ 规则设置</button>
              <button class="primary-btn" id="mmScanBtn">手动扫描</button>
            </div>
          </div>
          <div class="metric-grid">
            <div class="metric-card"><span>扫描素材总数</span><strong>3,247</strong><small>覆盖全账户</small></div>
            <div class="metric-card"><span>低效素材数</span><strong style="color:var(--orange);">186</strong><small style="color:var(--orange);">待清理</small></div>
            <div class="metric-card"><span>已清理数</span><strong>162</strong><small>今日已执行</small></div>
            <div class="metric-card"><span>待人工确认</span><strong style="color:var(--orange);">24</strong><small style="color:var(--orange);">需运营确认</small></div>
          </div>
          <div class="promo-tabs" id="mmTabs">
            <button class="promo-tab active" data-mm-tab="placement">投放账户低效素材<span class="count">128</span></button>
            <button class="promo-tab" data-mm-tab="review">过审账户待清理<span class="count">58</span></button>
          </div>
          <div data-mm-panel="placement">
            <div class="promo-toolbar">
              <select id="mmProductFilter"><option>全部产品</option><option>生活电器</option><option>厨具</option></select>
              <select id="mmAccountFilter"><option>全部账户</option><option>ZB_3344</option><option>ZB_7788</option><option>TW_8821</option></select>
              <select id="mmTypeFilter"><option>全部类型</option><option>视频</option><option>图片</option></select>
              <input type="text" id="mmSearch" placeholder="搜索素材名称">
              <div class="right"><button class="ghost-btn" id="mmBulkDelete">批量删除</button></div>
            </div>
            <div class="promo-table">
              <table>
                <thead><tr>
                  <th><input type="checkbox" id="mmCheckAll"></th>
                  <th>素材名称</th><th>类型</th><th>店铺</th><th>计划名称</th><th>上传时间</th><th id="mmThImp">7天展现</th><th>7天点击</th><th id="mmThCost">7天消耗(元)</th><th>CTR</th><th>CPA</th><th>所属账户</th><th>状态</th><th>操作</th>
                </tr></thead>
                <tbody id="mmPlacementTbody"></tbody>
              </table>
            </div>
            <div class="ai-suggestion">
              <span style="font-size:18px;">💡</span>
              <span style="flex:1;color:#4647c8;font-size:13px;font-weight:600;">AI建议：检测到128条投放账户低效素材，预计释放容量可上传25条新视频</span>
              <button class="primary-btn" id="mmCleanAll">一键清理全部低效素材</button>
            </div>
          </div>
          <div data-mm-panel="review" hidden>
            <div class="promo-toolbar">
              <select id="mmReviewProductFilter"><option>全部产品</option><option>生活电器</option><option>厨具</option></select>
              <select id="mmReviewAccountFilter"><option>全部过审账户</option><option>SF_8821</option><option>SF_5567</option></select>
              <select id="mmReviewStatusFilter"><option>全部状态</option><option>已通过</option><option>复审不通过</option></select>
              <div class="right"><button class="ghost-btn" id="mmReviewBulkClean">批量清理</button></div>
            </div>
            <div class="promo-table">
              <table>
                <thead><tr>
                  <th><input type="checkbox" id="mmReviewCheckAll"></th>
                  <th>素材名称</th><th>店铺</th><th>过审账户</th><th>审核提交</th><th>审核耗时</th><th>审核状态</th><th>清理原因</th><th>操作</th>
                </tr></thead>
                <tbody id="mmReviewTbody"></tbody>
              </table>
            </div>
            <div class="ai-suggestion">
              <span style="font-size:18px;">💡</span>
              <span style="flex:1;color:#4647c8;font-size:13px;font-weight:600;">58条素材可安全清理（已通过42条 + 复审不通过16条），释放过审账户容量</span>
            </div>
          </div>
        </div>
      </section>`);})();
