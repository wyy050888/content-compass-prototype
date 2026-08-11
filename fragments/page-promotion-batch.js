(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 千川·批量建计划 -->
      <section class="page" id="page-promotion-batch">
        <div class="batch-shell">
          <div class="page-head">
            <div>
              <h1>千川智能投放 · 批量建计划</h1>
              <p>支持推直播间 / 推商品-商品自选 / 推商品-全店托管三种投放模式。</p>
            </div>
            <button class="ghost-btn" id="batchBackOverview">← 返回计划总览</button>
          </div>

          <div class="batch-steps" id="batchSteps">
            <div class="batch-step active" data-step="1"><span class="num">1</span>选择投放模式</div>
            <div class="batch-step-line"></div>
            <div class="batch-step" data-step="2"><span class="num">2</span><span data-step-label-2>选抖音号 / 商品</span></div>
            <div class="batch-step-line"></div>
            <div class="batch-step" data-step="3"><span class="num">3</span>选素材</div>
            <div class="batch-step-line"></div>
            <div class="batch-step" data-step="4"><span class="num">4</span>投放设置</div>
            <div class="batch-step-line"></div>
            <div class="batch-step" data-step="5"><span class="num">5</span>预览提交</div>
          </div>

          <!-- Step 1 选择模式 -->
          <div class="batch-panel" data-batch-panel="1">
            <div class="batch-card">
              <h3>选择投放模式</h3>
              <p class="step-hint">不同模式对应不同的流程，选择后将自动调整后续步骤。</p>
              <div class="mode-cards">
                <div class="mode-card" data-mode="live">
                  <div class="ic">📺</div>
                  <strong>推直播间</strong>
                  <small>为直播间引流，系统智能投放</small>
                </div>
                <div class="mode-card" data-mode="product">
                  <div class="ic b">🛒</div>
                  <strong>推商品 - 商品自选</strong>
                  <small>手动选择商品 + 素材</small>
                </div>
                <div class="mode-card" data-mode="store">
                  <div class="ic c">🏪</div>
                  <strong>推商品 - 全店托管</strong>
                  <small>自动托管全店商品，智能选品</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 选抖音号 / 商品 -->
          <div class="batch-panel" data-batch-panel="2" hidden>
            <div class="batch-card">
              <h3 id="batchStep2Title">选择抖音号</h3>
              <p class="step-hint" id="batchStep2Hint">请选择要投放的抖音号（单选）。</p>
              <div class="batch-fields" id="batchStep2Fields">
                <div class="full">
                  <label>选择抖音号 *</label>
                  <select id="batchAccount">
                    <option value="">请选择抖音号</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3 选素材 -->
          <div class="batch-panel" data-batch-panel="3" hidden>
            <div class="batch-card">
              <h3>选择素材</h3>
              <p class="step-hint" id="batchStep3Hint">多种素材类型同时投放，系统将按整体投放效果最优的组合方式进行智能投放。</p>
              <div class="material-pick" id="materialPick">
                <div class="mp-card required" data-mat="live-frame">
                  <div class="ic2">📺</div>
                  <strong>直播间画面</strong>
                  <span class="tag-required">必选</span>
                  <p style="color:#6b7088;font-size:11px;margin:6px 0 0;">直播期间自动投放直播间画面，不可取消。</p>
                </div>
                <div class="mp-card selected" data-mat="home-video">
                  <div class="ic2">🎬</div>
                  <strong>智能优选主页视频</strong>
                  <span style="color:#19855d;font-size:10px;font-weight:700;">系统已选</span>
                  <p style="color:#6b7088;font-size:11px;margin:6px 0 0;">系统筛选效果好的主页视频；如不想投部分视频可点击 <a style="color:#5b5ce2;cursor:pointer;" id="excludeHomeVideo">排除主页视频</a>。</p>
                </div>
                <div class="mp-card" data-mat="self-video">
                  <div class="ic2">▶</div>
                  <strong>自选投放视频</strong>
                  <span style="color:#8a8fa1;font-size:10px;">优质商家都在用</span>
                  <p style="color:#6b7088;font-size:11px;margin:6px 0 0;">支持自主选择视频，设置标题投放。</p>
                </div>
              </div>
              <div style="margin-top:14px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fafbff;display:flex;align-items:center;justify-content:space-between;">
                <div>
                  <strong>AIGC 动态创意</strong>
                  <span class="info-icon" title="启用后系统自动生成素材，投素材数预计平均提升 25%~40%">?</span>
                  <p style="color:#6b7088;font-size:11px;margin:4px 0 0;">未启用则无法动态生成素材</p>
                </div>
                <div class="toggle-switch" id="aigcToggle"></div>
              </div>
            </div>
          </div>

          <!-- Step 4 投放设置 -->
          <div class="batch-panel" data-batch-panel="4" hidden>
            <div class="batch-card">
              <h3>投放设置</h3>
              <p class="step-hint">选择投放方式 + 设置预算/时间/优惠券。</p>
              <div class="batch-fields">
                <div class="full">
                  <label>投放方式 <span class="info-icon" title="控成本：稳定 ROI，按 oCPM 展示付费 / 放量：智能出价拿量更稳">?</span></label>
                  <div class="mode-toggle" id="deliveryMode">
                    <button data-mode="control" class="active">控成本投放</button>
                    <button data-mode="volume">放量投放</button>
                  </div>
                </div>
                <div>
                  <label>日预算 * <span class="info-icon" title="每日预算，建议不低于 300 元">?</span></label>
                  <input type="number" id="batchBudget" value="2000" min="300" step="100">
                  <span class="hint">建议预算 500/1000/2000 元</span>
                </div>
                <div id="batchRoiField">
                  <label>净成交 ROI 目标 * <span class="info-icon" title="仅控成本投放模式显示，系统按 oCPM 展示付费">?</span></label>
                  <input type="number" id="batchRoi" value="2.51" step="0.01">
                  <span class="hint" style="color:#19855d;">✓ 享保障 | 建议目标值不超过 2.51</span>
                </div>
                <div>
                  <label>投放时间 *</label>
                  <div class="mode-toggle" id="batchTimeMode">
                    <button data-tm="long" class="active">从今天起长期投放</button>
                    <button data-tm="custom">设置开始和结束日期</button>
                  </div>
                </div>
                <div class="full" id="batchCustomTime" hidden>
                  <div class="batch-fields" style="grid-template-columns:1fr 1fr;">
                    <div><label>开始日期</label><input type="date" id="batchStartDate"></div>
                    <div><label>结束日期</label><input type="date" id="batchEndDate"></div>
                  </div>
                </div>
                <div>
                  <label>每日投放时长</label>
                  <input type="number" id="batchDailyHours" value="6" min="1" max="24" step="0.5">
                  <span class="hint">建议时长 6 小时（开播自动起投，达时长自动停投）</span>
                </div>
                <div class="full">
                  <div class="toggle-row">
                    <div>
                      <strong>智能优惠券</strong>
                      <span class="info-icon" title="享平台额外补贴，GMV 预计平均提升 20%~53%">?</span>
                      <p style="color:#6b7088;font-size:11px;margin:4px 0 0;">已启用智能优惠券，享平台额外补贴</p>
                    </div>
                    <div class="toggle-switch on" id="couponToggle"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5 预览提交 -->
          <div class="batch-panel" data-batch-panel="5" hidden>
            <div class="batch-card">
              <h3>预览与提交</h3>
              <p class="step-hint">检查计划配置无误后提交。新建计划默认「继承账户规则」。</p>
              <div class="preview-list" id="batchPreviewList"></div>
              <div class="batch-foot">
                <span style="color:#6b7088;font-size:12px;" id="batchPreviewSummary"></span>
                <div style="display:flex;gap:10px;">
                  <button class="ghost-btn" id="batchPrev">上一步</button>
                  <button class="primary-btn" id="batchSubmit">创建计划</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 通用底部：上一步/下一步 -->
          <div class="batch-foot" id="batchFoot">
            <button class="ghost-btn" id="batchBack">取消</button>
            <button class="primary-btn" id="batchNext" disabled>下一步 →</button>
          </div>
        </div>
      </section>`);})();
