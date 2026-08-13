(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <section class="page" id="page-copy-library">
        <div class="page-pad">
          <div class="page-head">
            <div>
              <h1>文案库</h1>
              <p>统一管理 AI 生成、手工录入及视频识别的口播文案，可直接用于后续 AI 创作。</p>
            </div>
            <div class="cl-head-btns">
              <button class="cl-btn-ai" id="clCreateBtn">＋ 新增文案</button>
            </div>
          </div>
            <div class="cl-filter-row">
              <input type="text" id="clSearchInput" placeholder="搜索文案或产品">
              <select id="clSourceFilter"><option value="all">全部来源</option><option value="AI">AI生成</option><option value="手工新增">手工新增</option><option value="视频识别">视频识别</option></select>
            </div>
            <div class="cl-table-wrap">
              <table class="cl-table" id="clTable">
                <thead>
                  <tr>
                    <th style="width:27%;">文案详情</th>
                    <th style="width:6%;">来源</th>
                    <th style="width:8%;">产品</th>
                    <th style="width:7%;">人群</th>
                    <th style="width:15%;">结构</th>
                    <th style="width:6%;">字数</th>
                    <th style="width:8%;">创建</th>
                    <th style="width:9%;">最近修改</th>
                    <th class="cl-col-act" style="width:14%;">操作</th>
                  </tr>
                </thead>
                <tbody id="clTbody"></tbody>
              </table>
              <div class="cl-empty" id="clEmpty" hidden>暂无匹配文案</div>
            </div>
        </div>
      </section>`);})();
