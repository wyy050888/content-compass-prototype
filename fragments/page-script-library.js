(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`
  <section class="page" id="page-script-library">
    <div class="page-pad script-library-page">
      <div class="page-head">
        <div><h1>脚本库</h1><p>集中管理已保存的结构化脚本，支持查看、编辑、定位原始会话、下载与删除。</p></div>
      </div>
      <section class="sl-panel" aria-label="脚本列表">
        <div class="sl-toolbar">
          <label class="sl-search"><span>⌕</span><input id="slSearch" type="search" placeholder="搜索脚本名称、产品或生成文案"></label>
          <select id="slMaterialFilter" aria-label="筛选素材策略"><option value="all">全部素材策略</option><option value="depend">依赖素材库</option><option value="free">不依赖素材库</option></select>
          <span class="sl-result-count" id="slResultCount"></span>
        </div>
        <div class="sl-table-scroll">
          <table class="sl-table">
            <thead><tr><th>脚本名称</th><th>对应产品</th><th>生成文案</th><th>规格</th><th>素材策略</th><th>创建</th><th>最近修改</th><th>操作</th></tr></thead>
            <tbody id="slTbody"></tbody>
          </table>
          <div class="sl-empty" id="slEmpty" hidden>暂无匹配脚本</div>
        </div>
      </section>
    </div>
  </section>`);})();
