(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`
  <!-- 文案库：新增文案 -->
  <div class="modal-backdrop" id="clCreateModal" role="dialog" aria-modal="true">
    <div class="modal cl-create-modal">
      <div class="modal-head"><div class="modal-head-title"><i>文</i><h3>新增文案</h3></div><button class="close-btn" type="button" data-close-cl-create aria-label="关闭">×</button></div>
      <div class="modal-body">
        <div class="cl-create-tabs" role="tablist">
          <button class="active" type="button" data-cl-create-source="manual"><i>✎</i><span>手工录入<small>直接填写已有口播文案</small></span></button>
          <button type="button" data-cl-create-source="library"><i>▶</i><span>从视频库解析<small>选择视频并识别音频口播</small></span></button>
          <button type="button" data-cl-create-source="upload"><i>↑</i><span>上传视频识别<small>上传本地视频自动转写</small></span></button>
        </div>
        <div class="cl-create-panel" data-cl-create-panel="manual"></div>
        <div class="cl-create-panel" data-cl-create-panel="library" hidden><button class="cl-create-video-picker-trigger" type="button" data-cl-create-video-picker><span data-cl-create-video-trigger-text>从视频库选择</span><b>›</b></button><div class="cl-create-selected-video" data-cl-create-selected-video hidden></div></div>
        <div class="cl-create-panel" data-cl-create-panel="upload" hidden>
          <input type="file" id="clVideoUploadInput" accept="video/*" hidden>
          <button class="cl-upload-video" type="button" id="clVideoUploadTrigger"><span><strong>点击选择视频</strong><span>上传后自动识别音频中的口播文案</span></span></button>
        </div>
        <div class="cl-parse-status" id="clParseStatus" hidden><b>✓</b><span>口播识别完成，可继续修改后保存到文案库。</span></div>
        <section class="cl-create-section cl-create-copy-section"><div class="cl-create-form"><label class="cl-create-field full"><span>文案内容 <b style="color:#e14b53;">*</b></span><textarea id="clCreateText" placeholder="请输入完整口播文案"></textarea></label></div></section>
        <section class="cl-create-section"><div class="cl-create-section-head"><div><h4>产品基础信息</h4><p>关联产品，并补充文案对应的人群信息</p></div></div><div class="cl-create-form">
          <label class="cl-create-field"><span>关联产品 <b style="color:#e14b53;">*</b></span><button class="cl-create-product-trigger" type="button" data-cl-create-product-picker aria-haspopup="dialog"><span class="placeholder" data-cl-create-product-label>选择产品</span><b>⌄</b></button><input type="hidden" id="clCreateProduct"></label>
          <div></div>
          <div class="cl-audience-block">
            <div class="cl-create-persona-title">人群画像</div>
            <div class="cl-create-persona-source" role="group" aria-label="人群画像来源"><button class="active" type="button" data-cl-create-persona-mode="manual">自行输入</button><button type="button" data-cl-create-persona-mode="template">从模板库选择</button></div>
            <div class="cl-create-template-select" data-cl-create-template-select hidden><button type="button" data-cl-create-persona-trigger><span data-cl-create-persona-selected>选择人群画像模板</span><i>⌄</i></button></div>
            <div class="cl-audience-core-title">核心目标人群 <b style="color:#e14b53;">*</b></div>
            <div class="cl-audience-line"><span>抖音八大人群</span><div class="cl-audience-chips" data-cl-choice-group="audience"><button class="cl-audience-chip active" type="button" data-value="精致妈妈">精致妈妈</button><button class="cl-audience-chip" type="button" data-value="新锐白领">新锐白领</button><button class="cl-audience-chip" type="button" data-value="资深中产">资深中产</button><button class="cl-audience-chip" type="button" data-value="Z世代">Z世代</button><button class="cl-audience-chip" type="button" data-value="小镇青年">小镇青年</button><button class="cl-audience-chip" type="button" data-value="小镇中老年">小镇中老年</button><button class="cl-audience-chip" type="button" data-value="都市蓝领">都市蓝领</button><button class="cl-audience-chip" type="button" data-value="都市银发">都市银发</button></div></div>
            <div class="cl-audience-line"><span>性别 <b style="color:#e14b53;">*</b></span><div class="cl-audience-chips" data-cl-choice-group="gender"><button class="cl-audience-chip active" type="button" data-value="不限">不限</button><button class="cl-audience-chip" type="button" data-value="女性">女性</button><button class="cl-audience-chip" type="button" data-value="男性">男性</button></div></div>
            <div class="cl-audience-line"><span>年龄 <b style="color:#e14b53;">*</b></span><div class="cl-audience-chips" data-cl-choice-group="age"><button class="cl-audience-chip" type="button" data-value="18–23">18–23</button><button class="cl-audience-chip active" type="button" data-value="24–30">24–30</button><button class="cl-audience-chip" type="button" data-value="31–40">31–40</button><button class="cl-audience-chip" type="button" data-value="41–50">41–50</button><button class="cl-audience-chip" type="button" data-value="51+">51+</button><button class="cl-audience-chip" type="button" data-value="custom">自定义</button><div class="cl-custom-age" id="clCustomAge"><input type="number" id="clAgeMin" min="1" max="99" placeholder="最小"><span>至</span><input type="number" id="clAgeMax" min="1" max="99" placeholder="最大"></div></div></div>
            <div class="cl-audience-text-grid"><label class="cl-create-field"><span>人群核心痛点 <button class="cl-create-ai-action" type="button" data-cl-create-ai-suggest="pain">AI 换一组</button></span><textarea id="clCreatePain" placeholder="一行一个人群核心痛点"></textarea></label><label class="cl-create-field"><span>使用场景 <button class="cl-create-ai-action" type="button" data-cl-create-ai-suggest="scene">AI 换一组</button></span><textarea id="clCreateScenes" placeholder="一行一个使用场景"></textarea></label></div>
          </div>
        </div></section>
      </div>
      <div class="modal-foot"><div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-cl-create>取消</button><button class="primary-btn" type="button" id="clCreateSave">新增文案</button></div></div>
    </div>
  </div>

  <!-- 文案库：查看文案(只读) -->
  <div class="modal-backdrop" id="clViewModal" role="dialog" aria-modal="true">
    <div class="modal cl-view-modal">
      <div class="modal-head"><div class="modal-head-title"><i>查</i><div><h3>查看文案</h3><small>只读视图,如需修改请切换至编辑模式</small></div></div><button class="close-btn" type="button" data-close-cl-view aria-label="关闭">×</button></div>
      <div class="modal-body">
        <div class="cl-view-banner"><span class="cl-view-banner-tag">只读模式</span><span>所有字段不可编辑,如需修改请关闭后点击「编辑」</span></div>
        <div class="cl-edit-meta" id="clViewMeta">
          <span class="cl-edit-meta-item"><label>来源</label><b id="clViewMetaSource">—</b></span>
          <span class="cl-edit-meta-item"><label>字数 / 时长</label><b id="clViewMetaChars">—</b></span>
          <span class="cl-edit-meta-item"><label>最后更新</label><b id="clViewMetaUpdated">—</b></span>
        </div>
        <section class="cl-edit-section">
          <div class="cl-edit-section-head"><h4>基础信息</h4></div>
          <div class="cl-edit-form">
            <label class="cl-edit-field full"><span>关联产品</span><div class="cl-view-readonly" id="clViewProduct">—</div></label>
            <div class="cl-edit-field cl-edit-persona-field full" id="clViewPersonaField">
              <span>人群画像</span>
              <div class="cl-edit-audience-block">
                <div class="cl-edit-audience-label">核心目标人群</div>
                <div class="cl-edit-audience-row"><span>抖音八大人群</span><div class="cl-view-readonly" id="clViewAudience">—</div></div>
                <div class="cl-edit-audience-row"><span>性别</span><div class="cl-view-readonly" id="clViewGender">—</div></div>
                <div class="cl-edit-audience-row"><span>年龄</span><div class="cl-view-readonly" id="clViewAge">—</div></div>
              </div>
              <div class="cl-edit-field"><div class="cl-edit-field-title"><span>人群核心痛点</span></div><div class="cl-view-readonly block" id="clViewPain">—</div></div>
              <div class="cl-edit-field"><div class="cl-edit-field-title"><span>使用场景</span></div><div class="cl-view-readonly block" id="clViewScenes">—</div></div>
            </div>
          </div>
        </section>
        <section class="cl-edit-section">
          <div class="cl-edit-section-head"><h4>文案内容</h4></div>
          <div class="cl-edit-field full"><span>文案详情</span><div class="cl-view-readonly block cl-view-text" id="clViewText">—</div></div>
        </section>
      </div>
      <div class="modal-foot"><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-cl-view>关闭</button><button class="primary-btn" type="button" id="clViewEditBtn">去编辑</button></div></div>
    </div>
  </div>

  <!-- 文案库：编辑文案 -->
  <div class="modal-backdrop" id="clEditModal" role="dialog" aria-modal="true">
    <div class="modal cl-edit-modal">
      <div class="modal-head"><div class="modal-head-title"><i>编</i><div><h3>编辑文案</h3></div></div><button class="close-btn" type="button" data-close-cl-edit aria-label="关闭">×</button></div>
      <div class="modal-body">
        <div class="cl-edit-meta" id="clEditMeta">
          <span class="cl-edit-meta-item"><label>来源</label><b id="clEditMetaSource">—</b></span>
          <span class="cl-edit-meta-item"><label>字数 / 时长</label><b id="clEditMetaChars">—</b></span>
          <span class="cl-edit-meta-item"><label>最后更新</label><b id="clEditMetaUpdated">—</b></span>
        </div>
        <section class="cl-edit-section">
          <div class="cl-edit-section-head"><h4>基础信息</h4></div>
          <div class="cl-edit-form">
            <label class="cl-edit-field full"><span>关联产品 <b style="color:#e14b53;">*</b></span><button class="cl-create-product-trigger cl-edit-product-trigger" type="button" data-cl-edit-product-picker aria-haspopup="dialog"><span class="placeholder" data-cl-edit-product-label>选择产品</span><b>⌄</b></button><input type="hidden" id="clEditProduct"></label>
            <div class="cl-edit-field cl-edit-persona-field full" id="clEditPersonaField">
              <span>人群画像</span>
              <div class="cl-edit-persona-source" role="group" aria-label="人群画像来源"><button class="active" type="button" data-cl-audience-mode="manual">自行输入</button><button type="button" data-cl-audience-mode="template">从模板库选择</button></div>
              <div class="cl-edit-template-select" data-cl-audience-template hidden><button type="button" data-cl-persona-trigger><span data-cl-persona-selected>选择人群画像模板</span><i>⌄</i></button></div>
              <div class="cl-edit-audience-block">
                <div class="cl-edit-audience-label">核心目标人群 <b style="color:#e14b53;">*</b></div>
                <div class="cl-edit-audience-row"><span>抖音八大人群</span><div class="cl-edit-choice-row" data-cl-audience-box><button type="button" data-cl-audience="精致妈妈">精致妈妈</button><button type="button" data-cl-audience="新锐白领">新锐白领</button><button type="button" data-cl-audience="资深中产">资深中产</button><button type="button" data-cl-audience="Z世代">Z世代</button><button type="button" data-cl-audience="小镇青年">小镇青年</button><button type="button" data-cl-audience="小镇中老年">小镇中老年</button><button type="button" data-cl-audience="都市蓝领">都市蓝领</button><button type="button" data-cl-audience="都市银发">都市银发</button></div></div>
                <div class="cl-edit-audience-row"><span>性别</span><div class="cl-edit-choice-row" data-cl-single="gender"><button type="button" data-cl-gender="不限">不限</button><button type="button" data-cl-gender="女性">女性</button><button type="button" data-cl-gender="男性">男性</button></div></div>
                <div class="cl-edit-audience-row"><span>年龄</span><div class="cl-edit-choice-row" data-cl-single="age"><button type="button" data-cl-age="18–23">18–23</button><button type="button" data-cl-age="24–30">24–30</button><button type="button" data-cl-age="31–40">31–40</button><button type="button" data-cl-age="41–50">41–50</button><button type="button" data-cl-age="50+">50+</button><button type="button" data-cl-age="custom">自定义</button><span class="cl-edit-custom-age" data-cl-custom-age hidden><input type="number" id="clEditAgeMin" min="1" max="99" placeholder="25"><i>至</i><input type="number" id="clEditAgeMax" min="1" max="99" placeholder="40"></span></div></div>
              </div>
              <label class="cl-edit-field"><div class="cl-edit-field-title"><span>人群核心痛点</span><button class="cl-edit-ai-action" type="button" data-cl-ai-suggest="pain">AI 换一组</button></div><textarea id="clEditPersonaPain" rows="3" placeholder="一行一个人群核心痛点"></textarea></label>
              <label class="cl-edit-field"><div class="cl-edit-field-title"><span>使用场景</span><button class="cl-edit-ai-action" type="button" data-cl-ai-suggest="scene">AI 换一组</button></div><textarea id="clEditPersonaScenes" rows="3" placeholder="一行一个使用场景"></textarea></label>
            </div>
          </div>
        </section>
        <section class="cl-edit-section">
          <div class="cl-edit-section-head"><h4>文案内容</h4></div>
          <label class="cl-edit-field full"><span>文案详情 <b style="color:#e14b53;">*</b></span><textarea id="clEditText" rows="6" placeholder="请输入完整口播文案"></textarea><small class="cl-edit-counter" id="clEditCounter">0 / 500 字</small></label>
        </section>
        <div class="cl-edit-error" id="clEditModalError" hidden></div>
      </div>
      <div class="modal-foot"><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-cl-edit>取消</button><button class="primary-btn" type="button" id="clEditSave">保存修改</button></div></div>
    </div>
  </div>

  <!-- 智能脚本 Agent · 单条分镜行编辑弹窗 -->
  <div class="modal script-row-edit-modal" id="scriptRowEditModal" role="dialog" aria-modal="true" aria-labelledby="scriptRowEditTitle">
    <div class="modal-backdrop" data-close-script-row></div>
    <div class="modal">
      <div class="modal-head">
        <h3 id="scriptRowEditTitle">编辑分镜</h3>
        <button class="ghost-btn ghost-btn-sm" type="button" data-close-script-row>×</button>
      </div>
      <div class="modal-body">
        <div class="form-hint" style="margin:0;">仅修改当前分镜，不影响其他镜头。</div>
        <label class="cl-edit-field"><span>镜头时段 <em class="required-mark">*</em></span><input data-row-time inputmode="text" placeholder="例如 00–03s"></label>
        <label class="cl-edit-field"><span>景别 <em class="required-mark">*</em></span>
          <select data-row-shot-type>
            <option>特写</option><option>近景</option><option>中景</option><option>全景</option><option>远景</option>
          </select>
        </label>
        <label class="cl-edit-field"><span>运镜方式 <em class="required-mark">*</em></span>
          <select data-row-camera-move>
            <option>固定</option><option>推进</option><option>拉远</option><option>平移跟拍</option><option>环绕</option><option>手持跟随</option>
          </select>
        </label>
        <label class="cl-edit-field full"><span>对应口播片段 <em class="required-mark">*</em></span><textarea data-row-voice rows="3"></textarea></label>
        <label class="cl-edit-field full"><span>画面内容描述 <em class="required-mark">*</em></span><textarea data-row-visual rows="4"></textarea></label>
        <div class="cl-edit-field full" data-row-material-field><span>匹配素材</span><div class="script-row-materials" data-row-material-summary></div><button class="ghost-btn script-row-material-picker" type="button" data-row-select-material>从素材库选择</button></div>
        <label class="cl-edit-field full" data-row-video-prompt-field hidden><span>生视频提示词 <em class="required-mark">*</em></span><textarea data-row-video-prompt rows="4" placeholder="描述主体、场景、动作、运镜、光线与画面比例"></textarea></label>
      </div>
      <div class="modal-foot">
        <button class="ghost-btn danger-ghost" type="button" data-delete-script-row>删除分镜</button>
        <div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close-script-row>取消</button><button class="primary-btn" type="button" id="scriptRowEditSave">保存分镜</button></div>
      </div>
    </div>
  `);})();
