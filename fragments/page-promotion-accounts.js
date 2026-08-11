(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 广告主管理 -->
      <section class="page" id="page-promotion-accounts">
        <div class="accounts-page">
          <div class="page-head">
            <div>
              <h1>账户与素材 · 广告主管理</h1>
              <p>统一管理所有千川广告主授权、账户级关停规则、白名单概览。</p>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="primary-btn" id="accAddBtn">＋ 新增授权</button>
              <button class="ghost-btn" id="accRefreshBtn">🔄 刷新同步</button>
            </div>
          </div>

          <nav class="promotion-config-tabs" aria-label="推广配置">
            <button class="promotion-config-tab" data-page="promotion-rules">低效规则</button>
            <button class="promotion-config-tab active" data-page="promotion-accounts">账户映射</button>
            <button class="promotion-config-tab" data-page="promotion-sync">素材同步</button>
          </nav>

          <div class="accounts-stats" id="accStats">
            <div class="stat"><span class="l">授权账户</span><strong class="v" id="accStatTotal">8</strong></div>
            <div class="stat"><span class="l">活跃</span><strong class="v" id="accStatActive">6</strong></div>
            <div class="stat"><span class="l">即将到期</span><strong class="v" id="accStatSoon">1</strong></div>
            <div class="stat"><span class="l">已收藏</span><strong class="v" id="accStatStar">2</strong></div>
          </div>

          <div class="promo-toolbar" style="margin-bottom:14px;">
            <input type="text" id="accSearch" placeholder="搜索账户名/ID">
            <select id="accStatusFilter"><option>全部状态</option><option>已授权</option><option>即将到期</option><option>已过期</option></select>
            <label class="text-btn" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="accStarFilter"> ⭐仅看星标
            </label>
          </div>

          <div class="acc-list-card">
            <div class="acc-list-head"><strong>账户列表</strong><span style="color:#8a8fa1;font-size:11px;">8 个账户</span></div>
            <div id="accListRows"></div>
          </div>

          <!-- 白名单概览 -->
          <div class="wl-block">
            <div class="wl-head" id="wlHead">
              <strong>白名单概览</strong>
              <span style="color:#8a8fa1;font-size:11px;" id="wlCount">3 个计划</span>
            </div>
            <div id="wlBody" style="display:none;">
              <table class="wl-table">
                <thead><tr><th>计划名</th><th>账户</th><th>原因</th><th>到期时间</th><th>状态</th><th>操作</th></tr></thead>
                <tbody id="wlTbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>`);})();
