(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 账户配置 -->
      <section class="page" id="page-account-config">
        <div class="promo-page">
          <div class="page-head">
            <div>
              <h1>账户映射配置</h1>
              <p>维护产品 ↔ 过审账户 ↔ 直播投放账户 ↔ 图文投放账户 ↔ 默认端口的映射关系。</p>
            </div>
            <button class="primary-btn" id="acAddBtn">＋ 新增产品</button>
          </div>
          <div class="info-banner info" style="margin-bottom:14px;">
            <span>ℹ</span><span>每个产品至少配置4类账户：过审账户、直播投放账户、图文投放账户、默认端口账户。过审与图文投放可共用，直播投放必须独立。</span>
          </div>
          <div class="promo-table">
            <table>
              <thead><tr>
                <th>产品</th><th>过审账户</th><th>直播投放账户</th><th>图文投放账户</th><th>默认端口</th><th>状态</th><th>操作</th>
              </tr></thead>
              <tbody id="acTbody"></tbody>
            </table>
          </div>

          <!-- 子Tab：账户映射 / 任务调度 -->
          <div class="seg" style="margin-top:18px; margin-bottom:14px;">
            <button class="seg-item active" data-ac-tab="mapping">账户映射</button>
            <button class="seg-item" data-ac-tab="scheduler">任务调度</button>
          </div>

          <!-- 账户映射子Tab内容（默认显示） -->
          <div data-ac-panel="mapping">
            <div class="info-banner info">
              <span>ℹ</span><span>账户映射配置位于上方主表格，此处可继续维护产品 ↔ 账户的默认端口、负责人等扩展信息。</span>
            </div>
            <div class="promo-table">
              <table>
                <thead><tr><th>产品</th><th>默认端口</th><th>端口负责人</th><th>合作类型</th><th>更新时间</th><th>操作</th></tr></thead>
                <tbody id="acExtraTbody"></tbody>
              </table>
            </div>
          </div>

          <!-- 任务调度子Tab内容 -->
          <div data-ac-panel="scheduler" hidden>
            <section class="card" style="margin-bottom:16px;">
              <div class="card-title"><div><h3>每日执行时间线</h3><small>6个核心自动化任务的时序编排</small></div></div>
              <div style="padding:16px;">
                <div class="flow-card" id="tsFlowCard2">
                  <div class="flow-step"><b>1</b><strong>02:00 素材清理</strong><small>投放+过审双轨扫描</small></div>
                  <div class="flow-step"><b>2</b><strong>08:00 商品卡巡检</strong><small>补建/异常上报</small></div>
                  <div class="flow-step"><b>3</b><strong>09:00 图文推广巡检</strong><small>补建/更新/填充素材</small></div>
                  <div class="flow-step"><b>4</b><strong>全天 过审分发</strong><small>NAS扫描→上传→监听→分发</small></div>
                  <div class="flow-step"><b>5</b><strong>实时 审核监听</strong><small>通过→分发 / 不通过→申诉</small></div>
                  <div class="flow-step"><b>6</b><strong>全天 素材库同步</strong><small>过审状态标记更新</small></div>
                </div>
              </div>
            </section>
            <div class="two-col">
              <section class="card">
                <div class="card-title"><div><h3>任务执行状态</h3><small>今日运行情况</small></div></div>
                <div class="table-wrap">
                  <table>
                    <thead><tr><th>任务</th><th>触发时间</th><th>状态</th><th>上次执行</th><th>结果</th></tr></thead>
                    <tbody id="tsTaskTbody2"></tbody>
                  </table>
                </div>
              </section>
              <section class="card">
                <div class="card-title"><div><h3>异常处理策略</h3><small>自动重试与告警规则</small></div></div>
                <div class="table-wrap">
                  <table>
                    <thead><tr><th>异常场景</th><th>处理策略</th></tr></thead>
                    <tbody id="tsStrategyTbody2"></tbody>
                  </table>
                </div>
              </section>
            </div>
            <div style="margin-top:14px; text-align:right;">
              <button class="ghost-btn" id="tsTriggerBtn2">▶ 立即执行全部任务</button>
            </div>
          </div>
        </div>
      </section>`);})();
