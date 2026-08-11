(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 商品卡推广 -->
      <section class="page" id="page-product-card">
        <div class="promo-page">
          <div class="page-head">
            <div>
              <h1>商品卡推广自动化</h1>
              <p>每日扫描所有有效商品链接，自动补建缺失计划、重启可恢复计划、异常上报店铺负责人。</p>
            </div>
            <button class="primary-btn" id="pcScanBtn">立即扫描</button>
          </div>
          <div class="metric-grid">
            <div class="metric-card"><span>有效链接数</span><strong>246</strong><small>全店铺</small></div>
            <div class="metric-card"><span>已建计划</span><strong>246</strong><small style="color:var(--green);">覆盖率 100%</small></div>
            <div class="metric-card"><span>正常投放</span><strong>231</strong><small style="color:var(--green);">93.9%</small></div>
            <div class="metric-card"><span>异常待处理</span><strong style="color:var(--orange);">15</strong><small style="color:var(--orange);">6.1%</small></div>
          </div>
          <div class="promo-toolbar">
            <select id="pcStatusFilter"><option>全部状态</option><option>正常投放</option><option>已暂停</option><option>今日新建</option></select>
            <select id="pcShopFilter"><option>全部店铺</option><option>锦云生活电器专卖店</option><option>苏泊尔官方旗舰店</option></select>
            <input type="text" id="pcSearch" placeholder="搜索商品名称/链接ID">
          </div>
          <div class="promo-table">
            <table>
              <thead><tr>
                <th>商品名称</th><th>商品链接ID</th><th>店铺名称</th><th>店铺ID</th><th>计划名称</th><th>计划状态</th><th>7天展现</th><th>7天点击</th><th>7天消耗(元)</th><th>7天GMV</th><th>ROI</th><th>CTR</th><th>CPA</th><th>异常原因</th><th>操作</th>
              </tr></thead>
              <tbody id="pcTbody"></tbody>
            </table>
          </div>
          <section class="card" style="margin-top:16px;">
            <div class="card-title"><div><h3>今日操作日志</h3><small>自动巡检执行记录</small></div></div>
            <div id="pcLogList" style="padding:0 16px 16px;"></div>
          </section>
        </div>
      </section>`);})();
