(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 同步配置 -->
      <section class="page" id="page-promotion-sync">
        <div class="sync-page">
          <div class="page-head">
            <div>
              <h1>账户与素材 · 同步配置</h1>
              <p>配置本地素材监听目录、打标规则、同步日志。所有自动上传素材统一执行此处策略。</p>
            </div>
          </div>

          <nav class="promotion-config-tabs" aria-label="推广配置">
            <button class="promotion-config-tab" data-page="promotion-rules">低效规则</button>
            <button class="promotion-config-tab" data-page="promotion-accounts">账户映射</button>
            <button class="promotion-config-tab active" data-page="promotion-sync">素材同步</button>
          </nav>

          <div class="sync-section">
            <h3>监听目录</h3>
            <p class="sh">系统将监听该目录下新增的视频/图片文件。</p>
            <div class="sync-form">
              <div class="row">
                <label>本地路径</label>
                <div class="ctrl">
                  <input type="text" id="syncDir" value="D:\\千川素材\\待上传" placeholder="例如：D:\\千川素材\\待上传">
                  <div class="hint">多个目录用英文逗号分隔</div>
                </div>
              </div>
              <div class="row">
                <label>同步频率</label>
                <div class="ctrl">
                  <select id="syncFreq"><option>实时</option><option>每 5 分钟</option><option selected>每 30 分钟</option><option>每小时</option></select>
                </div>
              </div>
            </div>
          </div>

          <div class="sync-section">
            <h3>文件命名规则</h3>
            <p class="sh">通过正则解析文件名，自动打标。</p>
            <div class="sync-form">
              <div class="row">
                <label>命名正则</label>
                <div class="ctrl">
                  <input type="text" id="syncRegex" value="^(?<product>.+?)_(?<date>\\d{8})_(?<scene>.+?)$">
                  <div class="hint">支持命名分组：product / date / scene 等</div>
                </div>
              </div>
            </div>
          </div>

          <div class="sync-section">
            <h3>自动标签规则</h3>
            <p class="sh">文件命中关键词时自动打标。</p>
            <div class="sync-form">
              <div class="row">
                <label>关键词 → 标签</label>
                <div class="ctrl">
                  <input type="text" id="syncTags" value="夏季 → 夏季, 冬季 → 冬季, 618 → 618大促, 直播 → 直播引流">
                  <div class="hint">用「,」分隔多条规则，「→」连接关键词和标签</div>
                </div>
              </div>
              <div class="row">
                <label>自动提交千川审核</label>
                <div class="ctrl">
                  <div class="toggle-switch on" id="syncAutoSubmit"></div>
                  <div class="hint">上传后自动触发千川审核</div>
                </div>
              </div>
            </div>
          </div>

          <div class="sync-section">
            <h3>同步日志</h3>
            <p class="sh">最近 7 天同步记录。</p>
            <div class="acc-list-card">
              <table class="appeal-table">
                <thead><tr><th>时间</th><th>文件名</th><th>动作</th><th>结果</th></tr></thead>
                <tbody id="syncLogTbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>`);})();
