(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <section class="page" id="page-product-detail">
        <div class="product-detail-page">
          <button class="ghost-btn product-detail-back" type="button" data-back-products>← 返回产品库</button>
          <section class="product-detail-banner">
            <div class="detail-product-image"><div class="product-visual"></div></div>
            <div class="product-detail-summary">
              <h1 id="pageDetailName">轻净 Pro 除螨仪</h1>
              <div class="product-summary-line"><span class="summary-chip" id="pageDetailBrand">轻净</span><span class="summary-chip" id="pageDetailCategory">清洁电器</span><strong class="summary-price" id="pageDetailPrice">¥399</strong><span>最近更新：今天 10:26</span></div>
            </div>
            <div class="product-detail-actions"><button class="ghost-btn danger-btn" type="button" data-delete-current-product>删除产品</button><div class="product-creation-picker" id="productCreationPicker"><button class="primary-btn" type="button" id="productCreationTrigger">用此产品创作⌄</button><div class="product-creation-options"><button type="button" data-product-agent="original">智能文案</button><button type="button" data-product-agent="copy">爆款文案仿写</button><button type="button" data-product-agent="image-main">商品主图</button><button type="button" data-product-agent="image-detail">商品详情页</button><button type="button" data-product-agent="script">智能脚本</button><button type="button" data-product-agent="mix">智能混剪</button></div></div></div>
          </section>

          <div class="product-detail-layout">
            <div class="product-profile-grid">
              <section class="product-detail-card">
                <div class="product-detail-card-head"><h3>基础信息</h3></div>
                <div class="compact-kv-grid">
                  <div class="compact-kv editable-surface"><label>产品名称</label><span class="compact-value editable-view">轻净 Pro 除螨仪</span><div class="editable-editor"><input value="轻净 Pro 除螨仪"></div><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div>
                  <div class="compact-kv editable-surface"><label>品牌</label><span class="compact-value editable-view">轻净</span><div class="editable-editor"><input value="轻净"></div><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div>
                  <div class="compact-kv editable-surface"><label>类目</label><span class="compact-value editable-view">清洁电器</span><div class="editable-editor"><input value="清洁电器"></div><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div>
                  <div class="compact-kv editable-surface"><label>价格</label><span class="compact-value editable-view">¥399 CNY</span><div class="editable-editor"><div class="input-with-select price-field"><input type="number" value="399"><select><option value="CNY" data-symbol="¥" selected>人民币 CNY</option><option value="USD" data-symbol="$">美元 USD</option><option value="EUR" data-symbol="€">欧元 EUR</option><option value="GBP" data-symbol="£">英镑 GBP</option><option value="JPY" data-symbol="¥">日元 JPY</option><option value="KRW" data-symbol="₩">韩元 KRW</option><option value="HKD" data-symbol="HK$">港币 HKD</option><option value="SGD" data-symbol="S$">新加坡元 SGD</option><option value="AUD" data-symbol="A$">澳元 AUD</option></select></div></div><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div>
                  <div class="product-link-surface" id="productDetailLinkSurface"><label>商品链接</label><div class="product-detail-link-list" id="productDetailLinkList"></div><div class="product-detail-link-editor"><div class="product-link-rows" id="productDetailLinkRows"></div><div class="product-link-head-actions" style="margin-top:10px;"><button class="soft-btn" type="button" id="addDetailProductLink">＋ 添加链接</button><button class="ghost-btn" type="button" id="showDetailPlatformCreate">＋ 新增平台</button></div><div class="platform-create-line" id="detailPlatformCreateLine"><input id="detailPlatformName" placeholder="输入平台名称"><button class="soft-btn" type="button" id="confirmDetailPlatform">新增</button><button class="ghost-btn" type="button" id="cancelDetailPlatform">取消</button></div></div><div class="surface-actions"><button class="surface-cancel" type="button" id="cancelDetailLinks">取消</button><button type="button" id="editDetailLinks">编辑</button></div></div>
                </div>
              </section>

              <section class="product-detail-card product-description" id="productDescription">
                <div class="product-detail-card-head"><div class="product-description-title"><h3>商品描述</h3><small>输入商品规格、参数、材质、包装和售后等信息，可解析为结构化参数</small></div><div class="surface-actions"><button class="surface-cancel" type="button" id="cancelDescriptionEdit">取消</button><button type="button" id="editDescription">编辑</button></div></div>
                <textarea class="product-description-source" id="productDescriptionSource" readonly>产品型号：QJ-CM01
额定功率：400W
尘杯容量：0.5L
产品净重：1.42kg
产品尺寸：268×198×142mm
电源方式：有线 220V
包装清单：主机、滤芯×2、说明书
售后说明：整机质保 1 年</textarea>
                <div class="description-edit-tools"><div class="description-tool-head"><span>解析后的商品参数</span><button class="soft-btn" type="button" id="parseDescription">重新解析文本</button></div><div class="description-param-list" id="descriptionParamList"></div><button class="description-add-row" type="button" id="addDescriptionParam">＋ 新增商品参数</button></div>
              </section>

              <section class="product-detail-card span-all">
                <div class="product-detail-card-head"><h3>产品内容信息</h3><span class="sync-hint">一行一条，保存后同步至创作上下文</span></div>
                <div class="multi-info-grid">
                  <div class="multi-info-block editable-surface" data-product-content="core"><div class="multi-info-head"><strong>核心卖点 <small>4</small></strong><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div><ul class="bullet-list editable-view"><li>12kPa 大吸力深入床褥纤维</li><li>高频拍打与吸尘同步完成</li><li>透明尘杯让清洁效果可视化</li><li>双层过滤，减少二次扬尘</li></ul><div class="editable-editor"><textarea>12kPa 大吸力深入床褥纤维
高频拍打与吸尘同步完成
透明尘杯让清洁效果可视化
双层过滤，减少二次扬尘</textarea></div></div>
                  <div class="multi-info-block editable-surface" data-product-content="secondary"><div class="multi-info-head"><strong>次要卖点 <small>3</small></strong><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div><ul class="bullet-list editable-view"><li>床褥、抱枕和毛绒玩具均可使用</li><li>电源线满足卧室日常清洁范围</li><li>收纳体积小，不占家庭空间</li></ul><div class="editable-editor"><textarea>床褥、抱枕和毛绒玩具均可使用
电源线满足卧室日常清洁范围
收纳体积小，不占家庭空间</textarea></div></div>
                  <div class="multi-info-block editable-surface" data-product-content="difference"><div class="multi-info-head"><strong>差异化卖点 <small>3</small></strong><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div><ul class="bullet-list editable-view"><li>清洁结果可直接在透明尘杯中看到</li><li>拍、吸、滤一体完成深层清洁</li><li>围绕家庭高频软装场景设计</li></ul><div class="editable-editor"><textarea>清洁结果可直接在透明尘杯中看到
拍、吸、滤一体完成深层清洁
围绕家庭高频软装场景设计</textarea></div></div>
                  <div class="multi-info-block editable-surface" data-product-content="trust"><div class="multi-info-head"><strong>产品信任背书 <small>5</small></strong><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div><ul class="bullet-list editable-view"><li>整机质保 1 年，售后信息可追溯</li><li>产品参数及包装清单均可核验</li><li>官方渠道销售，支持正品验证</li><li>透明尘杯可直接展示清洁结果</li><li>核心功能均有实拍素材证明</li></ul><div class="editable-editor"><textarea>整机质保 1 年，售后信息可追溯
产品参数及包装清单均可核验
官方渠道销售，支持正品验证
透明尘杯可直接展示清洁结果
核心功能均有实拍素材证明</textarea></div></div>
                  <div class="multi-info-block editable-surface" data-product-content="forbidden"><div class="multi-info-head"><strong>禁用话术 <small>5</small></strong><div class="surface-actions"><button class="surface-cancel" type="button" data-cancel-inline>取消</button><button type="button" data-inline-edit>编辑</button></div></div><ul class="bullet-list editable-view"><li>百分百除螨、彻底杀灭</li><li>全网最低价、史上最低</li><li>未经资质支持的除菌率</li><li>永久有效、一次使用终身无螨</li><li>无法证明的竞品对比结论</li></ul><div class="editable-editor"><textarea>百分百除螨、彻底杀灭
全网最低价、史上最低
未经资质支持的除菌率
永久有效、一次使用终身无螨
无法证明的竞品对比结论</textarea></div></div>
                </div>
              </section>
            </div>

            <section class="product-detail-card pda-hub" id="productAssetHub">
              <div class="pda-header">
                <div><h3>关联资产</h3><p>汇总与当前产品关联的内容资产，资产信息与对应资产库保持同步。</p></div>
                <label class="pda-search"><span>⌕</span><input id="pdaSearch" type="search" placeholder="搜索当前分类"></label>
              </div>
              <div class="pda-tabs" role="tablist" aria-label="关联资产分类">
                <button class="active" type="button" data-pda-tab="copy">文案库 <b data-pda-count="copy">0</b></button>
                <button type="button" data-pda-tab="image">图片库 <b data-pda-count="image">0</b></button>
                <button type="button" data-pda-tab="script">脚本库 <b data-pda-count="script">0</b></button>
                <button type="button" data-pda-tab="material">创作素材 <b data-pda-count="material">0</b></button>
                <button type="button" data-pda-tab="video">成片视频 <b data-pda-count="video">0</b></button>
                <button type="button" data-pda-tab="reference">外部参考视频 <b data-pda-count="reference">0</b></button>
                <button type="button" data-pda-tab="template">模板库 <b data-pda-count="template">0</b></button>
              </div>
              <div class="pda-panel active" data-pda-panel="copy"><div id="pdaCopyContent"></div></div>
              <div class="pda-panel" data-pda-panel="image"><div id="pdaImageContent"></div></div>
              <div class="pda-panel" data-pda-panel="script"><div id="pdaScriptContent"></div></div>
              <div class="pda-panel" data-pda-panel="material"><div id="pdaMaterialContent"></div></div>
              <div class="pda-panel" data-pda-panel="video"><div id="pdaVideoContent"></div></div>
              <div class="pda-panel" data-pda-panel="reference"><div id="pdaReferenceContent"></div></div>
              <div class="pda-panel" data-pda-panel="template">
                <div class="pda-template-tabs" role="tablist">
                  <button class="active" type="button" data-pda-template="prompt">提示词模板</button>
                  <button type="button" data-pda-template="persona">人群画像</button>
                  <button type="button" data-pda-template="canvas">无限画板模板</button>
                  <button type="button" data-pda-template="copy-structure">爆款文案结构</button>
                  <button type="button" data-pda-template="video-structure">爆款视频结构</button>
                </div>
                <div id="pdaTemplateContent"></div>
              </div>
            </section>

            <div class="pda-layer" id="pdaPreviewModal" hidden><div class="pda-modal pda-modal-preview" role="dialog" aria-modal="true"><header><div><small id="pdaPreviewType">资产预览</small><h3 id="pdaPreviewTitle"></h3></div><button type="button" data-pda-close="pdaPreviewModal">×</button></header><div class="pda-preview-layout"><div class="pda-preview-stage" id="pdaPreviewStage"></div><div class="pda-preview-info" id="pdaPreviewInfo"></div></div><footer><span></span><div><button class="pda-btn" id="pdaPreviewAnalyze" type="button">分析</button><button class="pda-btn primary" id="pdaPreviewDownload" type="button">下载</button></div></footer></div></div>
            <div class="pda-layer" id="pdaEditModal" hidden><div class="pda-modal" role="dialog" aria-modal="true"><header><div><small>资产操作</small><h3 id="pdaEditTitle">编辑信息</h3></div><button type="button" data-pda-close="pdaEditModal">×</button></header><form id="pdaEditForm"><div class="pda-modal-body" id="pdaEditFields"></div><footer><span></span><div><button class="pda-btn" type="button" data-pda-close="pdaEditModal">取消</button><button class="pda-btn primary" type="submit">保存</button></div></footer></form></div></div>
            <div class="pda-layer pda-layer-top" id="pdaConfirmModal" hidden><div class="pda-modal pda-modal-sm" role="alertdialog" aria-modal="true"><header><div><small>请确认</small><h3 id="pdaConfirmTitle"></h3></div><button type="button" data-pda-close="pdaConfirmModal">×</button></header><div class="pda-modal-body"><p class="pda-confirm-text" id="pdaConfirmText"></p></div><footer><span></span><div><button class="pda-btn" type="button" data-pda-close="pdaConfirmModal">取消</button><button class="pda-btn danger" id="pdaConfirmAction" type="button">确认</button></div></footer></div></div>
            <div class="pda-layer" id="pdaAssociateModal" hidden><div class="pda-modal pda-modal-lg pda-associate-modal" role="dialog" aria-modal="true"><header><div><small>关联资产</small><h3 id="pdaAssociateTitle">关联创作素材</h3></div><button type="button" data-pda-close="pdaAssociateModal">×</button></header><div class="pda-associate-toolbar"><label class="pda-search pda-search-wide"><span>⌕</span><input id="pdaAssociateSearch" type="search" placeholder="搜索名称、产品或标签"></label><select id="pdaAssociateType" aria-label="类型筛选"></select><select id="pdaAssociateStatus" aria-label="状态筛选"></select></div><div class="pda-modal-body pda-associate-body" id="pdaAssociateBody"><aside class="pda-associate-folders" id="pdaAssociateFolders"><strong>文件夹</strong><div class="pda-associate-folder-tree" id="pdaAssociateFolderTree"></div></aside><section class="pda-associate-results"><div class="pda-media-grid" id="pdaAssociateGrid"></div></section></div><footer><span id="pdaAssociateCount">已选择 0 项</span><div><button class="pda-btn" type="button" data-pda-close="pdaAssociateModal">取消</button><button class="pda-btn primary" id="pdaAssociateConfirm" type="button">确认关联</button></div></footer></div></div>
          </div>
        </div>
      </section>`);})();
