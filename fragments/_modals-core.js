(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`
    </main>
  </div>

  <div class="modal-backdrop" id="productCreateModal" role="dialog" aria-modal="true" aria-labelledby="productCreateTitle">
    <div class="modal product-modal">
      <div class="modal-head"><div><span class="badge">产品库</span><h3 id="productCreateTitle">新建产品</h3></div><button class="close-btn" type="button" data-close-product-modal aria-label="关闭">×</button></div>
      <div class="modal-body">
        <div class="product-create-tabs"><button class="active" type="button" data-product-create-mode="manual">手工录入</button><button type="button" data-product-create-mode="batch">商品链接解析</button></div>
        <div class="product-form-panel active" data-product-create-panel="manual"><div class="product-form-grid">
          <div class="field"><label>产品名称<em class="required-mark">*</em></label><input id="productFormName" placeholder="请输入产品名称"></div><div class="field"><label>品牌<em class="required-mark">*</em></label><div class="inline-control"><input id="productFormBrand" list="productBrandOptions" placeholder="选择或搜索品牌"><button class="soft-btn" type="button" id="quickCreateBrand">＋ 新建</button></div><datalist id="productBrandOptions"><option value="轻净"></option><option value="轻享"></option><option value="净界"></option></datalist></div>
          <div class="field"><label>类目<em class="required-mark">*</em></label><div class="category-field"><select id="productCategorySelect"><option>请选择类目</option><option>清洁电器</option><option>厨房电器</option><option>个护电器</option></select><button type="button" id="addCategoryButton">＋ 新建</button></div><div class="add-category-input" id="addCategoryInput"><input placeholder="输入新类目"><button class="soft-btn" type="button" id="confirmCategoryButton">确认</button></div></div><div class="field"><label>价格<em class="required-mark">*</em></label><div class="input-with-select price-field"><input id="productFormPrice" type="number" min="0" step="0.01" placeholder="请输入价格"><select id="productCurrencySelect"><option value="CNY" data-symbol="¥">人民币 CNY</option><option value="USD" data-symbol="$">美元 USD</option><option value="EUR" data-symbol="€">欧元 EUR</option><option value="GBP" data-symbol="£">英镑 GBP</option><option value="JPY" data-symbol="¥">日元 JPY</option><option value="KRW" data-symbol="₩">韩元 KRW</option><option value="HKD" data-symbol="HK$">港币 HKD</option><option value="SGD" data-symbol="S$">新加坡元 SGD</option><option value="AUD" data-symbol="A$">澳元 AUD</option></select></div></div>
          <div class="field full"><label>产品图片<em class="required-mark">*</em></label><div class="product-image-upload" data-product-upload>点击上传产品图片，或拖拽图片至此</div></div>
          <div class="field full product-link-field"><div class="product-link-head"><label>商品链接</label><div class="product-link-head-actions"><button class="soft-btn" type="button" id="addProductLinkRow">＋ 添加链接</button><button class="ghost-btn" type="button" id="showPlatformCreate">＋ 新增平台</button></div></div><div class="product-link-rows" id="productCreateLinkRows"></div><div class="platform-create-line" id="platformCreateLine"><input id="newPlatformName" placeholder="输入平台名称"><button class="soft-btn" type="button" id="confirmPlatformCreate">新增</button><button class="ghost-btn" type="button" id="cancelPlatformCreate">取消</button></div></div>
          <div class="field full"><label>产品描述</label><textarea class="product-description-create" id="productFormDescription" placeholder="输入产品规格、参数、材质、包装和售后等信息，一行一项"></textarea></div>
          <div class="field full"><label>核心卖点<em class="required-mark">*</em></label><textarea id="productFormCore" placeholder="一行一个核心卖点"></textarea></div>
          <div class="field full"><label>次要卖点</label><textarea id="productFormSecondary" placeholder="一行一个次要卖点"></textarea></div>
          <div class="field full"><label>差异化卖点</label><textarea id="productFormDifference" placeholder="一行一个差异化卖点"></textarea></div>
          <div class="field full"><label>产品信任背书</label><textarea id="productFormTrust" placeholder="一行一条可核验的信任背书"></textarea></div>
          <div class="field full"><label>禁用话术</label><textarea id="productFormForbidden" placeholder="一行一条禁止在创作中使用的表达"></textarea></div>
        </div></div>
        <div class="product-form-panel" data-product-create-panel="batch"><div class="field"><label>商品链接<em class="required-mark">*</em></label><textarea class="batch-link-area" placeholder="每行粘贴一个商品链接，支持批量新增&#10;https://...&#10;https://..."></textarea></div></div>
      </div>
      <div class="modal-foot"><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-product-modal>取消</button><button class="primary-btn" type="button" id="saveProductEntry">新增产品</button></div></div>
    </div>
  </div>

  <div class="modal-backdrop" id="brandCreateModal" role="dialog" aria-modal="true" aria-labelledby="brandCreateTitle">
    <div class="modal product-modal">
      <div class="modal-head"><div><span class="badge">品牌库</span><h3 id="brandCreateTitle">新建品牌</h3></div><button class="close-btn" type="button" data-close-brand-create aria-label="关闭">×</button></div>
      <div class="modal-body"><div class="product-form-grid">
        <div class="field full"><label>品牌 Logo<em class="required-mark">*</em></label><div class="brand-logo-upload" id="brandLogoUpload">点击上传品牌 Logo</div><input type="file" id="brandLogoCreateFile" accept="image/*" hidden></div>
        <div class="field"><label>品牌名称<em class="required-mark">*</em></label><input id="brandFormName" placeholder="请输入品牌名称"></div>
        <div class="field"><label>品牌成立年份</label><input id="brandFormFoundedYear" type="number" min="1800" max="2026" placeholder="例如：2020"></div>
        <div class="field full"><label>品牌简介<em class="required-mark">*</em></label><textarea id="brandFormIntro" placeholder="简要说明品牌服务的人群、品类和核心价值"></textarea></div>
        <div class="field full"><label>品牌定位<em class="required-mark">*</em></label><textarea id="brandFormPosition" placeholder="例如：家庭深层清洁专家"></textarea></div>
        <div class="field full"><label>品牌调性<em class="required-mark">*</em></label><textarea id="brandFormTone" placeholder="例如：专业、直接、可信；强调真实使用结果"></textarea></div>
        <div class="field full"><label>禁用表达</label><textarea id="brandFormForbidden" placeholder="一行一个禁用表达，例如：&#10;行业第一&#10;永久有效&#10;全网最低价"></textarea></div>
      </div></div>
      <div class="modal-foot"><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-brand-create>取消</button><button class="primary-btn" type="button" id="saveBrandEntry">新增品牌</button></div></div>
    </div>
  </div>

  <div class="modal-backdrop" id="personaTemplateModal" role="dialog" aria-modal="true" aria-labelledby="personaTemplateTitle">
    <div class="modal persona-template-modal">
      <div class="modal-head"><div><span class="badge">人群画像</span><h3 id="personaTemplateTitle">新建人群画像</h3></div><button class="close-btn" type="button" data-close-persona-modal aria-label="关闭">×</button></div>
      <div class="modal-body">
        <div class="persona-form-grid">
          <div class="field full"><label>画像名称<em class="required-mark">*</em></label><input id="personaFormName" placeholder="例如：精致妈妈—母婴清洁人群"></div>
          <div class="field"><label>适用品牌</label><select id="personaFormBrand"><option value="">全部品牌</option><option>轻净</option><option>净界</option><option>轻享</option></select></div>
          <div class="field"><label>适用类目</label><select id="personaFormCategory"><option value="">全部类目</option><option>清洁电器</option><option>厨房电器</option><option>生活电器</option></select></div>
          <div class="field full"><label>适用产品</label><select id="personaFormProduct"><option value="">全部产品</option><option>轻净 Pro 除螨仪</option><option>轻享空气炸锅 A8</option><option>净界洗地机 S5</option></select></div>
          <div class="field full"><label>抖音八大人群<em class="required-mark">*</em></label><div class="persona-choice-row" data-persona-form-single="audience"><button class="active" type="button">精致妈妈</button><button type="button">新锐白领</button><button type="button">资深中产</button><button type="button">Z世代</button><button type="button">小镇青年</button><button type="button">小镇中老年</button><button type="button">都市蓝领</button><button type="button">都市银发</button></div></div>
          <div class="field full"><label>性别<em class="required-mark">*</em></label><div class="persona-choice-row" data-persona-form-single="gender"><button class="active" type="button">不限</button><button type="button">女性</button><button type="button">男性</button></div></div>
          <div class="field full"><label>年龄<em class="required-mark">*</em></label><div class="persona-choice-row" data-persona-form-single="age"><button type="button">18–23</button><button class="active" type="button">24–30</button><button type="button">31–40</button><button type="button">41–50</button><button type="button">51+</button><button type="button" data-persona-custom-age-trigger>自定义</button><span class="persona-custom-age" data-persona-custom-age hidden><input id="personaFormAgeMin" type="number" min="1" max="99" value="25"><i>至</i><input id="personaFormAgeMax" type="number" min="1" max="99" value="35"></span></div></div>
          <div class="field full"><label>人群核心痛点</label><textarea id="personaFormPain" placeholder="一行一个人群核心痛点"></textarea></div>
          <div class="field full"><label>使用场景</label><textarea id="personaFormScenes" placeholder="一行一个使用场景"></textarea></div>
        </div>
      </div>
      <div class="modal-foot"><span class="persona-form-note">保存后可在三个文案 Agent 中直接调用</span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-persona-modal>取消</button><button class="primary-btn" type="button" id="savePersonaTemplate">保存画像</button></div></div>
    </div>
  </div>

  <div class="modal-backdrop" id="personaHistoryModal" role="dialog" aria-modal="true" aria-labelledby="personaHistoryTitle">
    <div class="modal persona-history-modal">
      <div class="modal-head"><div><span class="badge">编辑记录</span><h3 id="personaHistoryTitle">人群画像编辑记录</h3></div><button class="close-btn" type="button" data-close-persona-history aria-label="关闭">×</button></div>
      <div class="modal-body"><div class="persona-history-list" id="personaHistoryList"></div></div>
      <div class="modal-foot"><span></span><button class="primary-btn" type="button" data-close-persona-history>完成</button></div>
    </div>
  </div>

  <div class="modal-backdrop" id="personaDeleteModal" role="dialog" aria-modal="true" aria-labelledby="personaDeleteTitle">
    <div class="modal persona-delete-modal">
      <div class="modal-head"><div><span class="badge" style="color:#c8424e;background:#fff0f1;">删除确认</span><h3 id="personaDeleteTitle">删除人群画像？</h3></div><button class="close-btn" type="button" data-close-persona-delete aria-label="关闭">×</button></div>
      <div class="modal-body"><p class="persona-delete-copy">删除后无法继续用于新任务，历史会话和已生成资产仍保留当时使用的人群信息。</p></div>
      <div class="modal-foot"><span></span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-persona-delete>取消</button><button class="primary-btn danger-confirm" type="button" id="confirmPersonaDelete">确认删除</button></div></div>
    </div>
  </div>

  <div class="modal-backdrop brand-delete-modal" id="deleteEntityModal" role="dialog" aria-modal="true" aria-labelledby="deleteEntityTitle">
    <div class="modal"><div class="modal-head"><div><span class="badge" style="color:#c8424e;background:#fff0f1;">删除确认</span><h3 id="deleteEntityTitle">删除品牌？</h3></div><button class="close-btn" type="button" data-close-entity-delete aria-label="关闭">×</button></div><div class="modal-body"><div class="session-delete-copy" id="deleteEntityCopy">删除后无法恢复，已生成的内容资产不会被删除。</div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-close-entity-delete>取消</button><button class="primary-btn" type="button" id="confirmEntityDelete" style="background:#d94b51;border-color:#d94b51;">确认删除</button></div></div>
  </div>

  <div class="modal-backdrop" id="productDetailModal" role="dialog" aria-modal="true" aria-labelledby="productDetailTitle">
    <div class="modal product-modal">
      <div class="modal-head"><div><span class="badge">产品详情</span><h3 id="productDetailTitle">轻净 Pro 除螨仪</h3></div><button class="close-btn" type="button" data-close-product-detail aria-label="关闭">×</button></div>
      <div class="modal-body">
        <div class="product-detail-hero"><div class="detail-product-image"><div class="product-visual"></div></div><div class="detail-hero-main"><h2 id="detailProductName">轻净 Pro 除螨仪</h2><div class="detail-meta"><span id="detailBrand">轻净</span><span id="detailCategory">清洁电器</span><span>产品链接已绑定</span></div><div class="detail-price" id="detailPrice">¥399</div><div class="detail-link">https://shop.example.com/products/mite-pro</div></div></div>
        <section class="detail-section"><h3>基础信息与卖点</h3><div class="detail-info-grid"><div class="detail-box"><label>核心卖点</label><p>大吸力深层清洁<br>拍打吸尘同步完成</p></div><div class="detail-box"><label>次要卖点</label><p>轻巧机身，便于日常取用<br>尘杯清理流程简单</p></div><div class="detail-box"><label>差异化卖点</label><p>把清洁结果直接展示在透明尘杯中，降低用户对深层清洁不可见的疑虑。</p></div></div></section>
        <section class="detail-section"><h3>目标人群与使用场景</h3><div class="detail-info-grid"><div class="detail-box"><label>宝妈家庭</label><div class="group-tags"><span>床垫清洁</span><span>卧室日常</span><span>布艺沙发</span></div></div><div class="detail-box"><label>养宠家庭</label><div class="group-tags"><span>毛发碎屑</span><span>沙发清洁</span><span>宠物活动区</span></div></div></div></section>
        <section class="detail-section"><h3>禁用话术</h3><div class="detail-box"><p>绝对化功效<br>最低价、全网最低<br>未经确认的除菌率或参数<br>无法证明的对比结论</p></div></section>
        <section class="detail-section"><h3>关联资产</h3><div class="relation-tabs" role="tablist"><button class="active" type="button" data-relation-tab="copy">文案库</button><button type="button" data-relation-tab="image">图片库</button><button type="button" data-relation-tab="material">素材库</button><button type="button" data-relation-tab="script">脚本库</button><button type="button" data-relation-tab="video">视频库</button><button type="button" data-relation-tab="template">模板库</button></div>
          <div class="relation-panel active" data-relation-panel="copy"><div class="relation-row"><i></i><div><strong>除螨仪暑期口播 · 结果冲击型</strong><small>智能文案 · 32 秒</small></div><button type="button" data-toast="已打开文案">查看</button></div><div class="relation-row"><i></i><div><strong>除螨仪宝妈人群口播</strong><small>爆款文案仿写 · 30 秒</small></div><button type="button" data-toast="已打开文案">查看</button></div></div>
          <div class="relation-panel" data-relation-panel="image"><div class="relation-row"><i></i><div><strong>除螨仪卧室场景主图</strong><small>商品主图 Agent · 1:1</small></div><button type="button" data-toast="已打开图片">查看</button></div><div class="relation-row"><i></i><div><strong>深层清洁详情页模块</strong><small>商品详情页 Agent · 750 × 1000</small></div><button type="button" data-toast="已打开图片">查看</button></div></div>
          <div class="relation-panel" data-relation-panel="material"><div class="relation-row"><i></i><div><strong>床垫拍打吸尘实拍镜头</strong><small>创作素材 · 00:05</small></div><button type="button" data-toast="已打开素材">查看</button></div><div class="relation-row"><i></i><div><strong>透明尘杯脏污特写</strong><small>历史素材拆分 · 00:03</small></div><button type="button" data-toast="已打开素材">查看</button></div></div>
          <div class="relation-panel" data-relation-panel="script"><div class="relation-row"><i></i><div><strong>深层清洁演示主视频脚本</strong><small>智能脚本 · 8 个分镜 · 已生成视频</small></div><button type="button" data-toast="已打开该脚本生成的视频">查看生成视频</button></div></div>
          <div class="relation-panel" data-relation-panel="video"><div class="relation-row"><i></i><div><strong>除螨仪主视频 30s</strong><small>智能混剪 · 已关联结构化脚本</small></div><button type="button" data-toast="已打开视频脚本">查看脚本</button></div></div>
          <div class="relation-panel" data-relation-panel="template"><div class="relation-row"><i></i><div><strong>清洁电器高点击口播提示词</strong><small>Agent 提示词 · 智能文案</small></div><button type="button" data-toast="已打开提示词模板">查看</button></div><div class="relation-row"><i></i><div><strong>结果前置·实拍证明型</strong><small>爆款内容结构 · 说什么 / 拍什么 / 怎么剪</small></div><button type="button" data-toast="已打开内容结构">查看</button></div><div class="relation-row"><i></i><div><strong>清洁品类 TVC 策划画布</strong><small>无限画板模板</small></div><button type="button" data-toast="已打开无限画板模板">查看</button></div></div>
        </section>
      </div>
      <div class="modal-foot"><button class="ghost-btn" type="button" data-close-product-detail>关闭</button><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-toast="已进入编辑产品信息">编辑产品</button><button class="primary-btn" type="button" data-open-product-creation>用此产品创作</button></div></div>
    </div>
  </div>

  <div class="modal-backdrop" id="agentModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal">
      <div class="modal-head">
        <div><span class="badge">开始创作</span><h3 id="modalTitle">智能文案创作</h3></div>
        <button class="close-btn" id="closeModal" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <p class="modal-intro" id="modalIntro">系统根据当前 Agent 自动收集必要信息。完成后仍可通过自然语言继续修改。</p>
        <div class="process-note"><strong>Agent 将执行</strong><span id="agentProcess">读取产品事实、调用创作策略并生成可继续编辑的业务资产。</span></div>
        <div class="form-grid" id="dynamicForm"></div>
        <div class="inline-feedback" id="formFeedback" hidden></div>
      </div>
      <div class="modal-foot">
        <button class="ghost-btn" id="saveProductButton" hidden>保存至产品档案</button>
        <span class="context-badge" id="contextStatus" hidden>已保留本次创作上下文</span>
        <div class="modal-foot-actions">
          <button class="ghost-btn" id="cancelModal">取消</button>
          <button class="primary-btn" id="confirmCreate">开始生成</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="taskRestartModal" role="dialog" aria-modal="true" aria-labelledby="taskRestartTitle">
    <div class="modal" style="width:min(460px, 100%);">
      <div class="modal-head">
        <div><span class="badge">继续创作</span><h3 id="taskRestartTitle">以新任务继续创作？</h3></div>
        <button class="close-btn" id="closeTaskRestart" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        <p style="margin:0;color:#5f606b;line-height:1.75;">你调整了前置信息。提交后会以新任务继续创作，当前结果会完整保留，随时可以返回查看。</p>
      </div>
      <div class="modal-foot">
        <div></div>
        <div class="modal-foot-actions"><button class="ghost-btn" id="cancelTaskRestart">先不提交</button><button class="primary-btn" id="confirmTaskRestart">新建任务并生成</button></div>
      </div>
    </div>
  </div>

  <div class="modal-backdrop image-zoom-modal" id="imageZoomModal" role="dialog" aria-modal="true" aria-label="查看大图">
    <div class="modal">
      <div class="modal-head"><div><h3 id="imageZoomTitle">图片预览</h3><p>点击关闭返回产品详情</p></div><button class="modal-x" type="button" id="closeImageZoom">×</button></div>
      <div class="modal-body"><div class="image-zoom-host" id="imageZoomHost"></div></div>
    </div>
  </div>

  <div class="modal-backdrop session-delete-modal" id="sessionDeleteModal" role="dialog" aria-modal="true" aria-label="删除会话确认">
    <div class="modal">
      <div class="modal-head"><div><h3>删除创作会话？</h3><p>删除后无法恢复</p></div><button class="modal-x" type="button" id="closeSessionDelete">×</button></div>
      <div class="modal-body"><div class="session-delete-copy">删除后仅移除会话记录和未保存的会话内容；已保存到资产库的文案、图片和视频不会删除。确认删除“<strong id="sessionDeleteName"></strong>”吗？</div></div>
      <div class="modal-foot"><div class="modal-foot-actions"><button class="ghost-btn" type="button" id="cancelSessionDelete">取消</button><button class="primary-btn" style="background:#e55359;" type="button" id="confirmSessionDelete">确认删除</button></div></div>
    </div>
  </div>

  <div class="toast" id="toast">已完成</div>

  <!-- 智能拉片·历史记录抽屉(进度区与示例弹层已迁移至 pull-entry 页内/直接跳转) -->
  <div class="history-backdrop" id="historyBackdrop" style="display:none;position:fixed;inset:0;z-index:85;background:rgba(20,22,35,.4);"></div>
  <aside class="history-drawer" id="historyDrawer" aria-hidden="true">
    <div class="history-head">
      <h3>历史解析记录</h3>
      <button class="close-btn" id="closeHistory" aria-label="关闭">×</button>
    </div>
    <div class="history-body" id="historyBody"></div>
  </aside>

  <!-- 千川·计划级关停规则配置弹窗 -->
  `);})();
