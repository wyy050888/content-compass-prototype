(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 图文推广 -->
      <section class="page" id="page-content-promo">
        <div class="promo-page">
          <div class="page-head">
            <div>
              <h1>图文推广自动化</h1>
              <p>链接×抖音号组合管理，基于过审视频库循环填充，配额自动分配与轮替。</p>
            </div>
            <button class="primary-btn" id="cpScanBtn">立即扫描</button>
          </div>
          <div class="metric-grid">
            <div class="metric-card"><span>链接×号组合数</span><strong>180</strong><small>全产品</small></div>
            <div class="metric-card"><span>已建计划</span><strong>156</strong><small>覆盖率 86.7%</small></div>
            <div class="metric-card"><span>今日更新素材</span><strong>42</strong><small>自动填充</small></div>
            <div class="metric-card"><span>配额使用率</span><strong>78%</strong><small>剩余113条容量</small></div>
          </div>
          <div class="promo-tabs" id="cpTabs">
            <button class="promo-tab active" data-cp-tab="plan">推广计划列表</button>
            <button class="promo-tab" data-cp-tab="quota">配额看板</button>
          </div>
          <div data-cp-panel="plan">
            <div class="promo-toolbar">
              <select id="cpProductFilter"><option>全部产品</option><option>生活电器</option><option>厨具</option></select>
              <select id="cpStatusFilter"><option>全部状态</option><option>正常</option><option>暂停</option><option>待填充</option></select>
              <input type="text" id="cpSearch" placeholder="搜索商品/抖音号">
              <div class="right"><button class="primary-btn" id="cpFillAll">一键填充待补充计划</button></div>
            </div>
            <div class="promo-table">
              <table>
                <thead><tr>
                  <th>商品</th><th>抖音号</th><th>投放账户</th><th>计划名称</th><th>计划状态</th><th>视频数</th><th>7天消耗</th><th>7天GMV</th><th>ROI</th><th>互动率</th><th>配额人</th><th>上次更新</th><th>操作</th>
                </tr></thead>
                <tbody id="cpTbody"></tbody>
              </table>
            </div>
          </div>
          <div data-cp-panel="quota" hidden>
            <div style="margin-bottom:12px;display:flex;justify-content:flex-end;">
              <button class="primary-btn" id="cpAddMemberBtn">＋ 新增协作人员</button>
            </div>
            <div id="cpQuotaBoard"></div>
          </div>
        </div>
      </section>`);})();
