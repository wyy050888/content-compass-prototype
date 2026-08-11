(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 智能拉片·入口页 -->
      <section class="page" id="page-pull-entry">
        <div class="pull-entry">
          <div class="pull-entry-shell">
            <div class="pull-entry-head">
              <h1>智能拉片</h1>
              <p>一键拆解画面分镜，助力仿拍或创作</p>
              <div class="pull-entry-top-actions">
                <button class="text-btn" id="openHistory">⏱ 历史解析记录</button>
                <button class="text-btn" id="openSample">查看示例</button>
              </div>
            </div>

            <div class="source-tabs" id="sourceTabs">
              <button class="source-tab active" data-source="link">🔗 通过链接添加</button>
              <button class="source-tab" data-source="library">📁 从素材库</button>
              <button class="source-tab" data-source="upload">↑ 本地上传视频</button>
            </div>

            <!-- 链接添加(一次 1 个) -->
            <div class="source-panel" data-panel="link">
              <div class="pull-input-area" id="linkInputArea">
                <textarea id="linkInput" placeholder="请粘贴 1 条抖音视频链接（一次解析 1 个）"></textarea>
                <div class="link-error" id="linkError">请填写有效的抖音视频链接</div>
                <div class="pull-input-foot">
                  <button class="ghost-mini" id="clearLinks">清空</button>
                  <button class="primary-mini" id="addLinks">确定添加</button>
                </div>
              </div>
            </div>

            <!-- 素材库选择(两栏:文件夹树 + 视频网格) -->
            <div class="source-panel" data-panel="library" hidden>
              <div class="lib-picker" id="libPicker">
                <!-- 左侧文件夹树 -->
                <aside class="lib-folder-tree" id="libFolderTree">
                  <div class="lib-folder-item active" data-folder="all"><span class="icon">📦</span><span class="label">全部素材</span><span class="count">10</span></div>
                  <div class="lib-folder-item" data-folder="home"><span class="icon">📁</span><span class="label">家居清洁</span><span class="count">4</span><span class="caret">▾</span></div>
                  <div class="lib-folder-children" data-parent="home">
                    <div class="lib-folder-item sub" data-folder="home-bed"><span class="icon">↳</span><span class="label">床上除螨</span><span class="count">3</span></div>
                    <div class="lib-folder-item sub" data-folder="home-kitchen"><span class="icon">↳</span><span class="label">厨房清洁</span><span class="count">1</span></div>
                  </div>
                  <div class="lib-folder-item" data-folder="kitchen"><span class="icon">📁</span><span class="label">厨房小电</span><span class="count">2</span></div>
                  <div class="lib-folder-item" data-folder="personal"><span class="icon">📁</span><span class="label">个人护理</span><span class="count">2</span></div>
                  <div class="lib-folder-item" data-folder="outdoor"><span class="icon">📁</span><span class="label">户外场景</span><span class="count">1</span></div>
                </aside>

                <!-- 右侧:搜索 + 标签 + 视频网格 + 底部 -->
                <section class="lib-content">
                  <div class="lib-toolbar">
                    <input class="search" id="libSearch" placeholder="搜索视频名称">
                  </div>
                  <div class="lib-grid" id="libGrid">
                    <article class="lib-card" data-folder="home-bed" data-tags="9:16,已审核,含口播" data-name="轻净 Pro 除螨仪主视频" data-duration="02:13" data-id="lib-1">
                      <div class="lib-card-cover">轻净 Pro</div>
                      <div class="lib-card-info"><strong>轻净 Pro 除螨仪主视频</strong><small>02:13 · 9:16 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="home-kitchen" data-tags="9:16,已审核,含口播" data-name="空气炸锅使用演示" data-duration="01:48" data-id="lib-2">
                      <div class="lib-card-cover alt-1">炸锅演示</div>
                      <div class="lib-card-info"><strong>空气炸锅使用演示</strong><small>01:48 · 9:16 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="home-kitchen" data-tags="9:16,审核中" data-name="洗地机 S5 测评" data-duration="03:02" data-id="lib-3">
                      <div class="lib-card-cover alt-2">洗地机</div>
                      <div class="lib-card-info"><strong>洗地机 S5 测评</strong><small>03:02 · 9:16 · 审核中</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="personal" data-tags="9:16,已审核" data-name="榨汁杯便携场景" data-duration="00:58" data-id="lib-4">
                      <div class="lib-card-cover alt-3">榨汁杯</div>
                      <div class="lib-card-info"><strong>榨汁杯便携场景</strong><small>00:58 · 9:16 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="home-bed" data-tags="9:16,已授权" data-name="除螨仪 3 秒灰尘特写" data-duration="00:30" data-id="lib-5">
                      <div class="lib-card-cover alt-4">钩子片段</div>
                      <div class="lib-card-info"><strong>除螨仪 3 秒灰尘特写</strong><small>00:30 · 9:16 · 已授权</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="home-bed" data-tags="9:16,已审核" data-name="家庭人群场景素材" data-duration="01:12" data-id="lib-6">
                      <div class="lib-card-cover alt-5">家庭场景</div>
                      <div class="lib-card-info"><strong>家庭人群场景素材</strong><small>01:12 · 9:16 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="kitchen" data-tags="16:9,已审核,含口播" data-name="早餐机 30s 横屏演示" data-duration="00:30" data-id="lib-7">
                      <div class="lib-card-cover alt-1">早餐机</div>
                      <div class="lib-card-info"><strong>早餐机 30s 横屏演示</strong><small>00:30 · 16:9 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="personal" data-tags="9:16,待补充" data-name="电动牙刷使用场景" data-duration="00:45" data-id="lib-8">
                      <div class="lib-card-cover alt-2">个护</div>
                      <div class="lib-card-info"><strong>电动牙刷使用场景</strong><small>00:45 · 9:16 · 待补充</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="outdoor" data-tags="16:9,已审核" data-name="便携风扇户外场景" data-duration="01:05" data-id="lib-9">
                      <div class="lib-card-cover alt-3">户外</div>
                      <div class="lib-card-info"><strong>便携风扇户外场景</strong><small>01:05 · 16:9 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                    <article class="lib-card" data-folder="kitchen" data-tags="9:16,已审核" data-name="电饭煲煮饭演示" data-duration="02:25" data-id="lib-10">
                      <div class="lib-card-cover alt-4">电饭煲</div>
                      <div class="lib-card-info"><strong>电饭煲煮饭演示</strong><small>02:25 · 9:16 · 已审核</small></div>
                      <span class="check">✓</span>
                    </article>
                  </div>
                  <div class="lib-empty" id="libEmpty" hidden>当前条件下没有视频，换个文件夹或关键词试试～</div>
                  <div class="lib-foot">
                    <span>已选 <b class="count" id="libSelectedCount">0</b> / 1 个</span>
                    <button class="primary-mini" id="confirmLibrary" disabled>确认选中</button>
                  </div>
                </section>
              </div>
            </div>

            <!-- 本地上传(单文件) -->
            <div class="source-panel" data-panel="upload" hidden>
              <label class="upload-drop" id="uploadDrop">
                <input type="file" class="file-input" id="fileInput" accept="video/mp4,video/quicktime,video/*">
                <strong>点击或拖拽视频文件到这里</strong>
                <small>支持 MP4 / MOV，单文件 ≤ 500MB，每次 1 个</small>
              </label>
            </div>

            <div class="video-list-head">
              <div>待解析视频 <span class="counter">(<b id="videoCount">0</b>/1)</span></div>
              <button class="ghost-mini" id="clearAll">移除</button>
            </div>

            <div class="video-list empty" id="videoList">
              <div class="empty-state">
                <svg width="62" height="48" viewBox="0 0 62 48" fill="none">
                  <path d="M6 14L31 2l25 12v22L31 48 6 36V14z" stroke="#9c9fef" stroke-width="1.5" fill="#f5f6ff"/>
                  <path d="M31 16v14M24 23h14" stroke="#9c9fef" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
                <div>先在上面选择 1 个视频～</div>
              </div>
            </div>

            <!-- 解析进度(默认隐藏,开始解析时显示) -->
            <div class="parse-progress-card" id="parseProgress" hidden>
              <div class="pp-head">
                <span class="pp-stage" id="ppStage">正在准备…</span>
                <span class="pp-percent" id="ppPercent">0%</span>
              </div>
              <div class="pp-bar"><span id="ppBar" style="width:0%"></span></div>
              <div class="pp-foot">
                <small id="ppName">—</small>
                <button class="pp-cancel" id="ppCancel">取消</button>
              </div>
            </div>

            <div class="pull-entry-foot">
              <button class="start-parse-btn" id="startParse" disabled>
                <span>▶ 开始解析</span>
              </button>
            </div>

            <details class="copyright-note">
              <summary>用户须确保上传链接对应的作品本身及所含的所有内容为自身所有或已获得合法授权，且内容遵守法律法规、公序良俗及社会公共利益……</summary>
              <p>您上传或粘贴的视频链接及相关内容仅用于 AI 拆解分析，请确认您拥有合法的使用权。系统不会将内容用于模型训练以外的用途，分析结果仅供您本人参考。</p>
            </details>
          </div>
        </div>
      </section>`);})();
