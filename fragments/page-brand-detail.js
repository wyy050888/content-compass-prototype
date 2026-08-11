(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <section class="page" id="page-brand-detail">
        <div class="brand-detail-page">
          <button class="ghost-btn product-detail-back" type="button" data-back-brands>← 返回品牌库</button>
          <section class="brand-detail-banner"><div class="brand-detail-logo" id="brandDetailLogo">轻</div><div class="brand-detail-summary"><h1 id="brandDetailName">轻净</h1><p id="brandDetailIntro">面向精致家庭的专业清洁电器品牌，用可验证的清洁效果降低家庭清洁焦虑。</p></div><div class="brand-detail-actions"><button class="ghost-btn danger-btn" type="button" data-delete-current-brand>删除品牌</button></div></section>
          <div class="brand-detail-grid">
            <section class="brand-info-card"><div class="brand-info-card-head"><h3>品牌信息</h3><span class="sync-hint">修改后自动同步创作上下文</span></div>
              <div class="brand-field" data-brand-field="name"><label>品牌名称</label><span class="brand-value">轻净</span><input value="轻净"><button class="brand-field-edit" type="button">编辑</button></div>
              <div class="brand-field" data-brand-field="foundedYear"><label>品牌成立年份</label><span class="brand-value">2020</span><input type="number" min="1800" max="2026" value="2020"><button class="brand-field-edit" type="button">编辑</button></div>
              <div class="brand-field" data-brand-field="intro"><label>品牌简介</label><span class="brand-value">面向精致家庭的专业清洁电器品牌，用可验证的清洁效果降低家庭清洁焦虑。</span><textarea>面向精致家庭的专业清洁电器品牌，用可验证的清洁效果降低家庭清洁焦虑。</textarea><button class="brand-field-edit" type="button">编辑</button></div>
              <div class="brand-field" data-brand-field="logo"><label>品牌 Logo</label><span class="brand-value brand-logo-current"><span class="brand-logo-thumb" id="brandLogoThumb">轻</span><span>已上传的品牌 Logo</span></span><div class="brand-logo-upload" data-brand-logo-upload>点击替换品牌 Logo</div><input type="file" id="brandDetailLogoFile" accept="image/*" hidden><button class="brand-field-edit" type="button">替换</button></div>
            </section>
            <section class="brand-info-card"><div class="brand-info-card-head"><h3>品牌策略</h3><span class="sync-hint">用于约束所有关联产品的 AI 创作</span></div>
              <div class="brand-field" data-brand-field="position"><label>品牌定位</label><span class="brand-value">家庭深层清洁专家</span><textarea>家庭深层清洁专家</textarea><button class="brand-field-edit" type="button">编辑</button></div>
              <div class="brand-field" data-brand-field="tone"><label>品牌调性</label><span class="brand-value">专业、直接、可信；少用文学化表达，强调真实使用结果。</span><textarea>专业、直接、可信；少用文学化表达，强调真实使用结果。</textarea><button class="brand-field-edit" type="button">编辑</button></div>
              <div class="brand-field" data-brand-field="forbidden"><label>禁用表达</label><span class="brand-value">行业第一
绝对除螨
永久有效
全网最低价</span><textarea>行业第一
绝对除螨
永久有效
全网最低价</textarea><button class="brand-field-edit" type="button">编辑</button></div>
            </section>
          </div>
          <section class="brand-info-card brand-related-products">
            <div class="brand-info-card-head"><div><h3>关联产品</h3><span class="sync-hint">品牌与产品双向关联，点击产品可进入详情</span></div><strong id="brandRelatedCount">3 个产品</strong></div>
            <div class="brand-product-grid" id="brandRelatedProducts"></div>
          </section>
        </div>
      </section>`);})();
