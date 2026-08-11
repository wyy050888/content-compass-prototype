(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`
  <div class="modal-backdrop" id="planRuleModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal">
      <div class="modal-head">
        <div><span class="badge">最高优先级</span><h3>配置关停规则</h3></div>
        <button class="close-btn" id="closePlanRule" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>计划</label>
            <div id="planRulePlanName" style="color:#5b5ce2;font-weight:600;">—</div>
          </div>
          <div class="row">
            <label>规则模式 *</label>
            <div class="seg" id="planRuleMode">
              <button data-m="inherit" class="active">继承账户</button>
              <button data-m="global">套用全局模板</button>
              <button data-m="custom">自定义本计划</button>
            </div>
          </div>
          <div class="row" id="planRuleGlobalPicker" hidden>
            <label>选择模板</label>
            <select id="planRuleTemplate">
              <option>默认规则（消耗 5000 / ROI 1.5）</option>
              <option>严格规则（消耗 3000 / ROI 2.0）</option>
              <option>宽松规则（消耗 8000 / ROI 1.2）</option>
            </select>
          </div>
          <div class="row" id="planRuleCustomFields" hidden>
            <label>消耗阈值</label>
            <div><input type="number" id="planRuleCost" value="5000" min="100" step="100"><span class="hint">元/日，建议预算的 1.2 倍</span></div>
          </div>
          <div class="row" id="planRuleCustomFields2" hidden>
            <label>ROI 最低</label>
            <div><input type="number" id="planRuleRoi" value="1.5" step="0.1"><span class="hint">基于历史 7 天建议值 <b style="color:#5b5ce2;">1.4</b></span></div>
          </div>
          <div class="row t">
            <label>自动关停</label>
            <div><div class="toggle-switch on" id="planRuleAutoStop"></div><span class="hint">开启后系统每 5 分钟扫描，达到阈值自动关停</span></div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelPlanRule">取消</button>
          <button class="primary-btn" id="savePlanRule">保存</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·账户级关停规则配置弹窗 -->
  <div class="modal-backdrop" id="accountRuleModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal">
      <div class="modal-head">
        <div><span class="badge">账户级</span><h3>配置账户关停规则</h3></div>
        <button class="close-btn" id="closeAccountRule" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>账户</label>
            <div id="accRuleAccName" style="color:#5b5ce2;font-weight:600;">—</div>
          </div>
          <div class="row">
            <label>规则模式 *</label>
            <div class="seg" id="accRuleMode">
              <button data-m="inherit" class="active">继承全局模板</button>
              <button data-m="custom">自定义账户规则</button>
            </div>
          </div>
          <div class="row t" id="accRuleCustomWrap" hidden>
            <label>自动关停</label>
            <div><div class="toggle-switch on" id="accRuleAutoStop"></div><span class="hint">应用到该账户所有「未单独配置计划级规则」的计划</span></div>
          </div>
          <div class="row" id="accRuleCustomWrap2" hidden>
            <label>消耗阈值</label>
            <div><input type="number" id="accRuleCost" value="5000" min="100" step="100"><span class="hint">元/日</span></div>
          </div>
          <div class="row" id="accRuleCustomWrap3" hidden>
            <label>ROI 最低</label>
            <div><input type="number" id="accRuleRoi" value="1.5" step="0.1"></div>
          </div>
          <div class="row" id="accRuleCustomWrap4" hidden>
            <label>检测频率</label>
            <div><select id="accRuleFreq"><option>每 5 分钟</option><option>每 10 分钟</option><option>每 30 分钟</option></select></div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelAccountRule">取消</button>
          <button class="primary-btn" id="saveAccountRule">保存</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·白名单开关弹窗 -->
  <div class="modal-backdrop" id="whitelistModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal">
      <div class="modal-head">
        <div><span class="badge">白名单</span><h3 id="whitelistTitle">加入白名单</h3></div>
        <button class="close-btn" id="closeWhitelist" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>计划</label>
            <div id="whitelistPlanName" style="color:#5b5ce2;font-weight:600;">—</div>
          </div>
          <div class="row">
            <label>原因 *</label>
            <select id="whitelistReason">
              <option>测试期（新品冷启动）</option>
              <option>品牌活动（大促节点）</option>
              <option>品宣账户</option>
              <option>其他备注</option>
            </select>
          </div>
          <div class="row">
            <label>到期时间 *</label>
            <div><input type="date" id="whitelistExpire"><span class="hint">默认 30 天，到期前 3 天通知</span></div>
          </div>
          <div class="row t">
            <label>备注</label>
            <div><textarea id="whitelistNote" rows="2" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font:inherit;" placeholder="可选，填写豁免理由"></textarea></div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelWhitelist">取消</button>
          <button class="primary-btn" id="saveWhitelist">保存</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·规则优先级说明弹窗 -->
  <div class="modal-backdrop" id="priorityModal" role="dialog" aria-modal="true">
    <div class="modal" style="width:min(560px,100%);">
      <div class="modal-head">
        <div><span class="badge">说明</span><h3>关停规则优先级</h3></div>
        <button class="close-btn" id="closePriority" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <p style="color:#555a6d;line-height:1.7;">系统每 5 分钟执行一次全量计划扫描，按以下优先级判断使用哪条规则：</p>
        <ol style="line-height:2;padding-left:20px;color:#202231;">
          <li>若计划开启【白名单】→ <b style="color:#19855d;">不执行任何关停</b></li>
          <li>否则若计划存在【自定义独立规则】→ <b style="color:#7a3eaf;">执行计划级规则</b></li>
          <li>否则若账户存在【自定义账户规则】→ <b style="color:#4647c8;">执行账户级规则</b></li>
          <li>否则执行【全局默认模板规则】</li>
          <li>无任何配置 → 自动关停功能不生效</li>
        </ol>
        <p style="margin-top:14px;color:#555a6d;line-height:1.7;background:#fafbff;padding:10px 12px;border-radius:8px;">
          ❓ <b>为什么我改了规则没生效？</b><br>
          请检查：① 是否该计划开启了白名单；② 是否该计划有自定义规则覆盖了账户规则；③ 刷新等待 5 分钟。
        </p>
      </div>
    </div>
  </div>

  <!-- 千川·启动 RPA 弹窗 -->
  <div class="modal-backdrop" id="rpaStartModal" role="dialog" aria-modal="true">
    <div class="modal rpa-modal">
      <div class="modal-head">
        <div><span class="badge">智投星</span><h3>🤖 启动智投星 RPA 复审</h3></div>
        <button class="close-btn" id="closeRpaStart" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fafbff;margin-bottom:14px;">
          <div>
            <span style="color:#8a8fa1;font-size:12px;">当前账户</span>
            <div id="rpaAccount" style="font-weight:700;color:#202231;font-size:14px;">—</div>
          </div>
          <div style="text-align:right;">
            <span style="color:#8a8fa1;font-size:12px;">选中 / 剩余额度</span>
            <div><b id="rpaSelectedCount" style="color:#5b5ce2;font-size:18px;">0</b> / <span id="rpaRemainCount" style="color:#19855d;font-size:14px;">0</span> 次</div>
          </div>
        </div>
        <div style="margin-bottom:14px;">
          <div style="color:#555a6d;font-weight:600;font-size:12px;margin-bottom:6px;">申诉理由（所有素材共用，限 200 字）</div>
          <textarea id="rpaReason" rows="4" maxlength="200" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font:inherit;resize:vertical;">已根据千川审核意见进行修改，删除违规内容，请重新审核。</textarea>
          <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:#8a8fa1;">
            <span>所有素材共用同一理由</span>
            <span><b id="rpaReasonLen">0</b> / 200</span>
          </div>
        </div>
        <div id="rpaQuotaWarn" style="display:none;padding:10px 12px;border:1px solid #f0c98a;background:#fff8ed;border-radius:9px;color:#b56b1a;font-size:12px;margin-bottom:12px;"></div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fafbff;color:#6b7088;font-size:12px;line-height:1.6;">
          ⚠ <b>风险提示：</b>智投星需保持登录态；遇验证码将自动暂停并通知您手动接管；成功后该素材消耗 1 次额度。
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelRpaStart">取消</button>
          <button class="primary-btn" id="confirmRpaStart">🚀 启动 RPA</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·RPA 运行态弹窗 -->
  <div class="modal-backdrop" id="rpaRunModal" role="dialog" aria-modal="true">
    <div class="modal rpa-modal">
      <div class="modal-head">
        <div><span class="badge" style="color:#fff;background:#5b5ce2;">运行中</span><h3>🤖 RPA 复审运行中</h3></div>
        <button class="close-btn" id="closeRpaRun" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;color:#555a6d;">
          <span id="rpaRunAcc">—</span>
          <span id="rpaRunStat">0/0</span>
        </div>
        <div class="rpa-progress"><span id="rpaRunBar" style="width:0%;"></span></div>
        <div style="font-size:12px;color:#6b7088;margin:6px 0 12px;">当前处理：<b id="rpaRunCurrent">—</b></div>
        <div class="rpa-log" id="rpaLog"></div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="rpaPause">⏸ 暂停</button>
          <button class="ghost-btn" id="rpaCancel">取消任务</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·RPA 完成态弹窗 -->
  <div class="modal-backdrop" id="rpaDoneModal" role="dialog" aria-modal="true">
    <div class="modal rpa-modal">
      <div class="modal-head">
        <div><span class="badge" style="color:#fff;background:#16a778;">完成</span><h3>✅ RPA 复审完成</h3></div>
        <button class="close-btn" id="closeRpaDone" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div id="rpaDoneAcc" style="color:#6b7088;font-size:12px;margin-bottom:10px;">—</div>
        <div class="quota-card-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px;">
          <div class="quota-card"><span class="label">成功</span><strong class="value" id="rpaDoneOk" style="color:#19855d;">0</strong></div>
          <div class="quota-card"><span class="label">失败</span><strong class="value" id="rpaDoneFail" style="color:#c14545;">0</strong></div>
          <div class="quota-card"><span class="label">异常</span><strong class="value" id="rpaDoneErr" style="color:#b56b1a;">0</strong></div>
        </div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fafbff;font-size:12px;color:#6b7088;">
          失败素材可二次申诉，异常素材需人工接管
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="primary-btn" id="closeRpaDoneBtn">完成</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·新增授权弹窗 -->
  <div class="modal-backdrop" id="addAccountModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal">
      <div class="modal-head">
        <div><span class="badge">授权</span><h3>新增广告主授权</h3></div>
        <button class="close-btn" id="closeAddAccount" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>广告主名称 *</label>
            <div><input type="text" id="addAccName" placeholder="如：优选家居旗舰店"></div>
          </div>
          <div class="row">
            <label>广告主 ID *</label>
            <div><input type="text" id="addAccId" placeholder="千川账户 ID"></div>
          </div>
          <div class="row t">
            <label>授权协议</label>
            <div><label style="display:inline-flex;align-items:center;gap:6px;"><input type="checkbox" id="addAccAgree" checked> 我已阅读并同意《广告主授权协议》</label></div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelAddAccount">取消</button>
          <button class="primary-btn" id="confirmAddAccount">授权</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 千川·续期/解除确认弹窗 -->
  <div class="modal-backdrop" id="accOpModal" role="dialog" aria-modal="true">
    <div class="modal" style="width:min(440px,100%);">
      <div class="modal-head">
        <div><span class="badge" id="accOpBadge">续期</span><h3 id="accOpTitle">确认续期</h3></div>
        <button class="close-btn" id="closeAccOp" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <p id="accOpContent" style="color:#555a6d;line-height:1.7;">—</p>
        <div id="accOpInfo" style="margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fafbff;color:#6b7088;font-size:12px;">—</div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelAccOp">取消</button>
          <button class="primary-btn" id="confirmAccOp">确认</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 素材监控·规则设置弹窗 -->
  <div class="modal-backdrop" id="mmRuleModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal" style="max-width:460px;">
      <div class="modal-head">
        <div><h3>⚙ 规则设置 - 低效素材清理</h3></div>
        <button class="close-btn" id="mmRuleClose" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>清理规则适用</label>
            <div><span class="badge" style="color:#4647c8;background:#eeefff;">投放账户</span> <span style="color:var(--muted);font-size:12px;">过审账户按审核状态规则，无需配置天数</span></div>
          </div>
          <div class="row">
            <label>零消耗判定天数 *</label>
            <div><input type="number" id="mmDayInput" value="7" min="3" max="30" style="width:80px;"><span class="hint">范围 3-30 天，上传超过此天数且零展现零消耗的素材判定为低效</span></div>
          </div>
          <div class="row t">
            <label>产品独立配置</label>
            <div>
              <select id="mmProductLineSelect" style="width:100%;margin-bottom:8px;">
                <option>苏泊尔生活电器</option>
                <option>苏泊尔厨具</option>
                <option>苏泊尔环境电器</option>
                <option>苏泊尔小家电</option>
              </select>
              <span class="hint">每个产品可独立设置天数，互不影响</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="mmRuleCancel">取消</button>
          <button class="primary-btn" id="mmRuleSave">保存并应用</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 过审分发·新建过审计划弹窗 -->
  <div class="modal-backdrop" id="rdCreatePlanModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal" style="max-width:520px;">
      <div class="modal-head">
        <div><span class="badge orange">过审计划缺失</span><h3>新建过审计划 - TW_9911</h3></div>
        <button class="close-btn" id="rdPlanClose" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>账户</label>
            <div style="color:#5b5ce2;font-weight:600;">TW_9911（苏泊尔环境电器-图文投放）</div>
          </div>
          <div class="row">
            <label>计划名称 *</label>
            <div><input type="text" id="rdPlanName" value="过审_苏泊尔环境电器" style="width:100%;"><span class="hint">系统已添加"过审"前缀，名称须含"过审"字样</span></div>
          </div>
          <div class="row">
            <label>计划组</label>
            <div><select id="rdPlanGroup" style="width:100%;"><option>默认计划组</option><option>计划组A</option><option>计划组B</option></select></div>
          </div>
          <div class="row">
            <label>产品</label>
            <div style="color:var(--muted);">苏泊尔环境电器（自动填充，不可修改）</div>
          </div>
          <div class="row">
            <label>投放方式</label>
            <div class="seg" id="rdPlanType">
              <button data-t="tuwen" class="active">图文投放</button>
              <button data-t="video">视频投放</button>
            </div>
          </div>
          <div class="info-banner info" style="margin-top:12px;">
            <span>⏳</span><span>创建成功后，系统将自动上传 <strong>3条</strong> 待过审视频至此计划，并恢复审核监听流程。</span>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="rdPlanCancel">取消</button>
          <button class="primary-btn" id="rdPlanConfirm">确认创建</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 过审分发·智投星审核结论弹窗 -->
  <div class="modal-backdrop" id="rdConclusionModal" role="dialog" aria-modal="true">
    <div class="modal" style="max-width:620px;">
      <div class="modal-head">
        <div><span class="badge red">复审不通过</span><h3>🔍 智投星审核结论</h3></div>
        <button class="close-btn" id="rdConcClose" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:13px;color:var(--muted);">📋 审核基本信息</h4>
          <div style="background:#fafbff;border:1px solid var(--line);border-radius:9px;padding:12px;font-size:13px;line-height:1.8;">
            <div>素材名称：<strong>吸尘器强劲模式C</strong></div>
            <div>过审账户：SF_8821</div>
            <div>初审结果：❌ 不通过（千川审核）</div>
            <div>申诉时间：2026-07-31 10:15</div>
            <div>复审结果：❌ 不通过（智投星复审）</div>
            <div>复审时间：2026-07-31 11:02</div>
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px;font-size:13px;color:var(--muted);">📝 智投星审核结论</h4>
          <div style="background:#fff5f5;border:1px solid #ffcdd2;border-radius:9px;padding:12px;font-size:13px;line-height:1.8;">
            <div style="margin-bottom:6px;"><strong>驳回原因分类：</strong>内容违规</div>
            <div style="margin-bottom:6px;"><strong>具体结论：</strong></div>
            <div style="padding-left:16px;margin-bottom:4px;">1. 视频第8秒出现"全网最低价"绝对化用语，违反广告法</div>
            <div style="padding-left:16px;margin-bottom:8px;">2. 视频第15秒功效宣传"100%除螨"缺乏检测报告支撑</div>
            <div style="margin-bottom:4px;"><strong>建议修改方向：</strong></div>
            <div style="padding-left:16px;">• 将"全网最低价"修改为"限时优惠"等合规表达</div>
            <div style="padding-left:16px;">• 删除"100%除螨"或补充第三方检测报告编号</div>
          </div>
        </div>
        <div class="ai-suggestion" style="margin-bottom:0;">
          <span style="font-size:18px;">💡</span>
          <span style="flex:1;color:#4647c8;font-size:13px;font-weight:600;">AI修改建议：检测到2处违规点，建议剪辑人员修改后重新上传。关联原视频记录可追溯。</span>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="rdConcExport">导出结论</button>
          <button class="ghost-btn" id="rdConcAck">标记已知晓</button>
          <button class="primary-btn" id="rdConcReupload">重新上传修改版</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 图文推广·新增协作人员弹窗 -->
  <div class="modal-backdrop" id="cpAddMemberModal" role="dialog" aria-modal="true">
    <div class="modal cfg-modal" style="max-width:460px;">
      <div class="modal-head">
        <div><span class="badge" style="color:#4647c8;background:#eeefff;">配额重算</span><h3>新增协作人员</h3></div>
        <button class="close-btn" id="cpMemberClose" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <div class="cfg-form">
          <div class="row">
            <label>计划组</label>
            <div style="color:#5b5ce2;font-weight:600;">SF_8821（图文投放）</div>
          </div>
          <div class="row">
            <label>新增人员姓名 *</label>
            <div><input type="text" id="cpMemberName" placeholder="如：周七" style="width:100%;"></div>
          </div>
          <div class="row">
            <label>千川账户ID *</label>
            <div><input type="text" id="cpMemberAcc" placeholder="如：ZB_1234" style="width:100%;"></div>
          </div>
          <div class="info-banner info" style="margin-top:12px;" id="cpQuotaPreview">
            <span>ℹ</span><span>新增人员后，配额将自动重算：当前 <strong>4人</strong> × 每人50条 → <strong>5人</strong> × 每人<strong>40条</strong>（每人配额减少10条）</span>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cpMemberCancel">取消</button>
          <button class="primary-btn" id="cpMemberConfirm">确认新增并重算配额</button>
        </div>
      </div>
    </div>
  </div>
  `);})();
