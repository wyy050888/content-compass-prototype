(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 过审分发 -->
      <section class="page" id="page-review-distribute">
        <div class="promo-page">
          <div class="page-head">
            <div>
              <h1>视频过审与分发</h1>
              <p>新视频上传至过审账户 → 异步监听审核结果 → 通过后自动分发至直播/图文投放账户。</p>
            </div>
            <button class="primary-btn" id="rdUploadBtn">＋ 上传新视频</button>
          </div>
          <div class="metric-grid">
            <div class="metric-card"><span>待上传</span><strong>12</strong><small>NAS待扫描</small></div>
            <div class="metric-card"><span>审核中</span><strong style="color:var(--orange);">8</strong><small style="color:var(--orange);">等待结果</small></div>
            <div class="metric-card"><span>已通过</span><strong style="color:var(--green);">5</strong><small style="color:var(--green);">待分发</small></div>
            <div class="metric-card"><span>已分发</span><strong>23</strong><small>今日累计</small></div>
            <div class="metric-card"><span>申诉中</span><strong style="color:var(--red);">2</strong><small style="color:var(--red);">智投星处理中</small></div>
          </div>
          <div class="info-banner warn" style="margin-bottom:14px;" id="rdAlert">
            <span>⚠</span><span>吸尘器A版审核不通过，已自动发起智投星申诉（预计1h出结果）</span>
          </div>
          <div class="info-banner danger" style="margin-bottom:14px;" id="rdPlanAlert">
            <span>⚠</span><span><strong>过审计划缺失告警：</strong>账户 <strong>TW_9911（苏泊尔环境电器-图文投放）</strong> 的计划中未发现名称含"过审"的计划，3条视频暂无法上传过审。</span>
            <button class="primary-btn" style="margin-left:auto;font-size:12px;padding:6px 12px;" id="rdCreatePlanBtn">新建过审计划</button>
          </div>
          <div class="promo-toolbar">
            <select id="rdProductFilter"><option>全部产品</option><option>生活电器</option><option>厨具</option></select>
            <select id="rdStatusFilter"><option>全部状态</option><option>待上传</option><option>审核中</option><option>已通过</option><option>已分发</option><option>申诉中</option></select>
            <input type="text" id="rdSearch" placeholder="搜索视频名称/上传人">
          </div>
          <div class="promo-table">
            <table>
              <thead><tr>
                <th>视频名称</th><th>产品</th><th>店铺</th><th>时长</th><th>上传人</th><th>过审账户</th><th>过审计划</th><th>审核状态</th><th>分发状态</th><th>已分发至</th><th>操作</th>
              </tr></thead>
              <tbody id="rdTbody"></tbody>
            </table>
          </div>
          <div class="two-col" style="margin-top:16px;">
            <section class="card">
              <div class="card-title"><div><h3>过审账户容量</h3><small>单计划组上限500条</small></div></div>
              <div id="rdCapacityList" style="padding:0 16px 16px;"></div>
            </section>
            <section class="card">
              <div class="card-title"><div><h3>配额分配</h3><small>多人协作自动轮替</small></div></div>
              <div id="rdQuotaList" style="padding:0 16px 16px;"></div>
            </section>
          </div>
        </div>
      </section>`);})();
