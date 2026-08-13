(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`


      <!-- 推广自动化（旧页保留为兼容，不再由菜单进入） -->
      <section class="page" id="page-promotion">
        <div class="promo-page">
          <div class="page-head">
            <div>
              <h1>千川智能投放 · 计划总览</h1>
              <p>查看全账户或单账户的计划、素材、申诉情况，支持自动关停规则与白名单管理。</p>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="ghost-btn" id="gotoRules">⚙ 关停规则</button>
              <button class="primary-btn" id="gotoBatch">＋ 批量建计划</button>
            </div>
          </div>

          <!-- 顶部 4 个指标卡 -->
          <div class="metric-grid" id="promoMetricGrid">
            <div class="metric-card"><span>今日消耗</span><strong>¥ 286,430</strong><small id="metricCostTrend">较昨日 +8.6%</small></div>
            <div class="metric-card"><span>综合 ROI</span><strong>2.74</strong><small>高于保本线 0.42</small></div>
            <div class="metric-card"><span>运行中素材</span><strong id="metricRunning">1,248</strong><small>今日新增 86</small></div>
            <div class="metric-card"><span>待处理异常</span><strong style="color:var(--orange);" id="metricAbnormal">12</strong><small style="color:var(--orange);">需投手确认</small></div>
          </div>

          <!-- 二级 Tab：计划/素材/申诉 -->
          <div class="promo-tabs" id="promoMainTabs">
            <button class="promo-tab active" data-promo-tab="plan">计划列表<span class="count" id="planTabCount">8</span></button>
            <button class="promo-tab" data-promo-tab="material">素材列表<span class="count" id="materialTabCount">132</span></button>
            <button class="promo-tab" data-promo-tab="appeal">申诉中心<span class="count" id="appealTabCount">12</span></button>
          </div>

          <!-- 计划列表 Tab 内容 -->
          <div class="promo-panel" data-promo-panel="plan">
            <div class="promo-toolbar">
              <div class="seg" id="accountViewSeg">
                <button class="active" data-view="all">全部账户</button>
                <button data-view="single">单个账户 ▾</button>
              </div>
              <select id="planStatusFilter">
                <option>全部状态</option>
                <option>运行中</option>
                <option>已暂停</option>
                <option>已结束</option>
              </select>
              <select id="planRuleFilter">
                <option>全部规则</option>
                <option>继承账户</option>
                <option>独立计划</option>
                <option>白名单豁免</option>
              </select>
              <select id="planGoalFilter">
                <option>全部营销目标</option>
                <option>推直播间</option>
                <option>推商品</option>
              </select>
              <input type="text" id="planSearch" placeholder="搜索计划名称或账户">
              <div class="right">
                <label class="text-btn" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                  <input type="checkbox" id="planOnlyLow"> ⚠ 仅低效
                </label>
                <button class="ghost-btn" id="planBulkRule">批量配置规则</button>
                <button class="ghost-btn" id="planBulkWhitelist">批量加白名单</button>
              </div>
            </div>

            <div class="promo-table">
              <table id="planTable">
                <thead>
                  <tr>
                    <th><input type="checkbox" id="planCheckAll"></th>
                    <th>计划名</th>
                    <th>抖音号</th>
                    <th>主推产品</th>
                    <th>消耗(元)</th>
                    <th>广告 GMV</th>
                    <th>ROI</th>
                    <th>订单数</th>
                    <th>营销目标</th>
                    <th>广告账户<span class="info-icon" title="点击账户名可切换视图">?</span></th>
                    <th>计划状态</th>
                    <th>规则来源<span class="info-icon" title="单计划>单账户>全局模板，白名单永久豁免">?</span></th>
                    <th>关停<span class="info-icon" title="自动关停状态：每 5 分钟扫描，达到阈值自动关停">?</span></th>
                    <th>白名单<span class="info-icon" title="永久豁免自动关停，到期前 3 天通知">?</span></th>
                    <th>预警<span class="info-icon" title="低效预警：ROI 低/消耗快/CTR 下降/无订单">?</span></th>
                    <th>素材数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody id="planTbody"></tbody>
                <tfoot id="planTfoot">
                  <tr><td colspan="4">汇总</td><td id="sumCost">0</td><td id="sumGmv">0</td><td id="sumRoi">0</td><td id="sumOrders">0</td><td colspan="9"></td></tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- 素材列表 Tab 内容 -->
          <div class="promo-panel" data-promo-panel="material" hidden>
            <div class="promo-toolbar">
              <div class="seg" id="materialGoalSeg">
                <button class="active" data-mat-goal="live">推直播间</button>
                <button data-mat-goal="product">推商品</button>
              </div>
              <div class="seg" id="materialTypeSeg">
                <button class="active" data-mat-type="video">视频</button>
                <button data-mat-type="live">直播间画面</button>
                <button data-mat-type="other">其他创意</button>
                <button data-mat-type="title">标题</button>
              </div>
              <select id="matStatusFilter">
                <option>全部状态</option>
                <option>待申诉</option>
                <option>审核中</option>
                <option>已通过</option>
                <option>已驳回</option>
              </select>
              <input type="text" id="matSearch" placeholder="搜索素材名称或产品">
              <div class="right">
                <label class="text-btn" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                  <input type="checkbox" id="matOnlyRejected"> ⚠ 仅驳回
                </label>
                <button class="primary-btn" id="rpaStartBtn">🤖 一键 RPA 复审</button>
              </div>
            </div>

            <div class="promo-table">
              <table id="materialTable">
                <thead>
                  <tr>
                    <th>视频信息</th>
                    <th>主推产品</th>
                    <th>消耗(元)</th>
                    <th>广告 GMV</th>
                    <th>订单数</th>
                    <th>千展成本</th>
                    <th>点击率</th>
                    <th>转化数</th>
                    <th>素材状态<span class="info-icon" title="千川审核状态">?</span></th>
                    <th>复审状态<span class="info-icon" title="智投星 RPA 复审状态">?</span></th>
                    <th>违规标签</th>
                    <th>关联计划</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody id="materialTbody"></tbody>
              </table>
            </div>
          </div>

          <!-- 申诉中心 Tab 内容 -->
          <div class="promo-panel" data-promo-panel="appeal" hidden>
            <div class="quota-card-grid" id="appealTopCards">
              <div class="quota-card"><span class="label">今日剩余</span><strong class="value" id="quotaRemain">0</strong><small class="sub">距离 0 点重置 <span id="quotaReset">14h 32m</span></small></div>
              <div class="quota-card"><span class="label">已用</span><strong class="value" id="quotaUsed">0/30</strong><small class="sub">本账户额度</small></div>
              <div class="quota-card"><span class="label">本月累计申诉</span><strong class="value" id="quotaMonth">0</strong><small class="sub">全账户汇总</small></div>
              <div class="quota-card"><span class="label">本月成功率</span><strong class="value" id="quotaRate">0%</strong><small class="sub">成功 / (成功+失败)</small></div>
            </div>

            <div class="acc-list-card">
              <div class="acc-list-head">
                <strong>账户额度</strong>
                <span style="color:#8a8fa1;font-size:11px;">每个账户独立计算 30 次/天</span>
              </div>
              <table class="quota-table">
                <thead><tr><th>账户</th><th>今日已用</th><th>进度</th><th>状态</th><th style="width:140px;">操作</th></tr></thead>
                <tbody id="quotaTbody"></tbody>
              </table>
            </div>

            <div class="acc-list-card">
              <div class="acc-list-head">
                <strong>申诉记录</strong>
                <span style="color:#8a8fa1;font-size:11px;">仅显示最近 20 条</span>
              </div>
              <table class="appeal-table">
                <thead><tr><th>时间</th><th>账户</th><th>素材</th><th>结果</th><th>原因</th><th>占用</th><th>操作</th></tr></thead>
                <tbody id="appealLogTbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>`);})();
