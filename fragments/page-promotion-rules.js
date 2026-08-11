(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 千川·关停规则库 -->
      <section class="page" id="page-promotion-rules">
        <div class="rules-page">
          <div class="page-head">
            <div>
              <h1>千川智能投放 · 关停规则库</h1>
              <p>统一管理规则模板 / 执行日志 / 通知设置，三层规则优先级（单计划 > 单账户 > 全局模板）。</p>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="primary-btn" id="ruleAddBtn">＋ 新增模板</button>
              <button class="ghost-btn" id="ruleHelpBtn">? 优先级说明</button>
            </div>
          </div>

          <nav class="promotion-config-tabs" aria-label="推广配置">
            <button class="promotion-config-tab active" data-page="promotion-rules">低效规则</button>
            <button class="promotion-config-tab" data-page="promotion-accounts">账户映射</button>
            <button class="promotion-config-tab" data-page="promotion-sync">素材同步</button>
          </nav>

          <div class="rules-tabs" id="rulesTabs">
            <button class="rules-tab active" data-rules-tab="template">规则模板</button>
            <button class="rules-tab" data-rules-tab="log">执行日志</button>
            <button class="rules-tab" data-rules-tab="notify">通知设置</button>
          </div>

          <!-- 规则模板 -->
          <div class="rules-panel" data-rules-panel="template">
            <div class="rule-template-list" id="ruleTemplateList"></div>
          </div>

          <!-- 执行日志 -->
          <div class="rules-panel" data-rules-panel="log" hidden>
            <div class="promo-toolbar" style="margin-bottom:14px;">
              <select id="logOpFilter">
                <option>全部操作</option>
                <option>自动操作</option>
                <option>人工操作</option>
              </select>
              <select id="logAccountFilter">
                <option>全部账户</option>
              </select>
              <input type="date" id="logStartDate">
              <input type="date" id="logEndDate">
              <input type="text" id="logSearch" placeholder="搜索计划名">
            </div>
            <div class="acc-list-card">
              <table class="appeal-table">
                <thead><tr><th>执行时间</th><th>广告主</th><th>计划名</th><th>触发规则</th><th>触发数据</th><th>执行动作</th><th>操作人</th></tr></thead>
                <tbody id="logTbody"></tbody>
              </table>
            </div>
          </div>

          <!-- 通知设置 -->
          <div class="rules-panel" data-rules-panel="notify" hidden>
            <div class="rule-template-list">
              <div class="rule-template" style="grid-template-columns:1fr;">
                <div class="meta">
                  <strong>企微 / 钉钉机器人 Webhook</strong>
                  <p style="margin:8px 0 0;color:#6b7088;font-size:12px;">支持添加多个 Webhook URL，系统将按顺序推送告警。</p>
                  <input type="text" id="webhookUrl" placeholder="https://oapi.dingtalk.com/robot/send?access_token=..." style="width:100%;margin-top:10px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;">
                </div>
              </div>
              <div class="rule-template" style="grid-template-columns:1fr auto;">
                <div class="meta">
                  <strong>计划自动关停告警</strong>
                  <p style="margin:4px 0 0;color:#6b7088;font-size:11px;">系统自动关停计划时通知</p>
                </div>
                <div class="toggle-switch on" data-notify="stop"></div>
              </div>
              <div class="rule-template" style="grid-template-columns:1fr auto;">
                <div class="meta">
                  <strong>素材审核驳回通知</strong>
                  <p style="margin:4px 0 0;color:#6b7088;font-size:11px;">千川驳回素材时通知</p>
                </div>
                <div class="toggle-switch on" data-notify="reject"></div>
              </div>
              <div class="rule-template" style="grid-template-columns:1fr auto;">
                <div class="meta">
                  <strong>RPA 复审结果通知</strong>
                  <p style="margin:4px 0 0;color:#6b7088;font-size:11px;">智投星 RPA 复审完成时通知</p>
                </div>
                <div class="toggle-switch on" data-notify="rpa"></div>
              </div>
              <div class="rule-template" style="grid-template-columns:1fr auto;">
                <div class="meta">
                  <strong>账户授权过期提醒</strong>
                  <p style="margin:4px 0 0;color:#6b7088;font-size:11px;">授权到期前 3 天提醒</p>
                </div>
                <div class="toggle-switch on" data-notify="expire"></div>
              </div>
            </div>
          </div>
        </div>
      </section>`);})();
