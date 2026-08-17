(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`<section class="page active" id="page-creation">
        <div class="ai-shell">
          <aside class="conversation-panel">
            <div class="panel-label"><span>创作</span></div>
            <div class="new-create-wrap" id="newCreateWrap">
              <button class="new-chat" type="button" aria-haspopup="menu" aria-expanded="false">＋ 新建创作</button>
              <div class="new-create-popover" id="newCreatePopover" role="menu" aria-label="选择创作能力" hidden>
                <div class="new-create-head"><div><strong>选择创作能力</strong><small>选择 Agent 后进入对应创作流程</small></div><button class="new-create-close" type="button" aria-label="关闭">×</button></div>
                <div class="create-agent-group">文案创作</div>
                <button class="create-agent-option" type="button" data-create-agent-type="original" data-category="copy"><span class="create-agent-dot"></span><span><strong>智能文案</strong><small>基于产品事实生成多版本千川口播</small></span><span class="create-agent-arrow">›</span></button>
                <button class="create-agent-option" type="button" data-create-agent-type="copy" data-category="copy"><span class="create-agent-dot"></span><span><strong>爆款文案仿写</strong><small>拆解爆款方法并映射为原创文案</small></span><span class="create-agent-arrow">›</span></button>
                <button class="create-agent-option" type="button" data-create-agent-type="rewrite" data-category="copy"><span class="create-agent-dot"></span><span><strong>智能改写</strong><small>定向调整已有文案的表达与结构</small></span><span class="create-agent-arrow">›</span></button>
                <div class="create-agent-group">图片创作</div>
                <button class="create-agent-option" type="button" data-create-agent-type="image-main" data-category="image"><span class="create-agent-dot"></span><span><strong>商品主图</strong><small>根据产品图和卖点生成电商主图</small></span><span class="create-agent-arrow">›</span></button>
                <button class="create-agent-option" type="button" data-create-agent-type="image-detail" data-category="image"><span class="create-agent-dot"></span><span><strong>商品详情页</strong><small>生成可继续编辑的详情页图文模块</small></span><span class="create-agent-arrow">›</span></button>
                <div class="create-agent-group">视频生产</div>
                <button class="create-agent-option" type="button" data-create-agent-type="script" data-category="video"><span class="create-agent-dot"></span><span><strong>智能脚本</strong><small>把文案转为可拍摄、可混剪的分镜脚本</small></span><span class="create-agent-arrow">›</span></button>
                <button class="create-agent-option" type="button" data-create-agent-type="mix" data-category="video"><span class="create-agent-dot"></span><span><strong>智能混剪</strong><small>确认文案配音，用已有素材生成成片</small></span><span class="create-agent-arrow">›</span></button>
                <div class="create-agent-group">视频分析</div>
                <button class="create-agent-option" type="button" data-create-page="pull-entry" data-category="analysis"><span class="create-agent-dot"></span><span><strong>爆款拆解</strong><small>独立拆解视频口播、分镜与镜头语言</small></span><span class="create-agent-arrow">›</span></button>
              </div>
            </div>
            <div class="session-history-head">最近创作</div>
            <div class="chat-list">
              <div class="chat-row active" data-session-id="session-mite-summer">
                <strong>为除螨仪生成暑期千川投放文案</strong><button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>
              </div>
              <div class="chat-row" data-session-id="session-air-fryer-copy">
                <strong>参考爆款结构仿写空气炸锅口播</strong><button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>
              </div>
              <div class="chat-row" data-session-id="session-washer-script">
                <strong>将洗地机文案转成可混剪脚本</strong><button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>
              </div>
              <div class="chat-row" data-session-id="session-juice-video">
                <strong>制作便携榨汁杯 15 秒延伸视频</strong><button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>
              </div>
            </div>
          </aside>
          <button class="conversation-panel-toggle" id="conversationPanelToggle" type="button" aria-expanded="true" aria-label="收起创作列表" title="收起创作列表">‹</button>

          <div class="creation-stage home-mode">
            <button class="asset-toggle" id="assetToggle">会话资产 <span class="badge gray" id="assetToggleCount">0</span></button>
            <div class="conversation-locator" aria-hidden="true"></div>
            <div class="ai-hero" id="emptyHero">
              <div class="spark">✦</div>
              <h1>选择创作能力</h1>
              <p>选择一个专业 Agent，按步骤完成内容创作。</p>
            </div>

            <div class="agent-browser" id="agentBrowser">
              <div class="agent-filter-row" role="tablist" aria-label="Agent 分类筛选">
                <button class="agent-filter active" type="button" data-agent-filter="all" role="tab" aria-selected="true">全部</button>
                <button class="agent-filter" type="button" data-agent-filter="copy" role="tab" aria-selected="false">文案创作</button>
                <button class="agent-filter" type="button" data-agent-filter="image" role="tab" aria-selected="false">图片创作</button>
                <button class="agent-filter" type="button" data-agent-filter="video" role="tab" aria-selected="false">视频生产</button>
                <button class="agent-filter" type="button" data-agent-filter="analysis" role="tab" aria-selected="false">视频分析</button>
              </div>
              <div class="agent-grid" id="agentGrid">
              <button class="agent-card" type="button" data-agent="智能文案创作" data-type="original" data-category="copy">
                <span class="agent-icon">原</span>
                <strong>智能文案</strong>
                <small>结合产品事实与历史策略，生成多条单变量 A/B 文案</small>
                <span class="agent-foot"><span class="agent-chip">产品事实</span><span class="agent-chip">单变量 A/B</span><span class="agent-chip">多版本</span></span>
              </button>
              <button class="agent-card" type="button" data-agent="爆款文案仿写创作" data-type="copy" data-category="copy">
                <span class="agent-icon">仿</span>
                <strong>爆款文案仿写</strong>
                <small>拆参考素材的钩子与结构，再映射为当前产品的新文案</small>
                <span class="agent-foot"><span class="agent-chip">结构拆解</span><span class="agent-chip">原创映射</span><span class="agent-chip">去同质化</span></span>
              </button>
              <button class="agent-card" type="button" data-agent="智能改写创作" data-type="rewrite" data-category="copy">
                <span class="agent-icon">改</span>
                <strong>智能改写</strong>
                <small>换钩子、压时长、换人群，保留需要保留的内容</small>
                <span class="agent-foot"><span class="agent-chip">局部锁定</span><span class="agent-chip">变更对照</span><span class="agent-chip">延伸视频</span></span>
              </button>
              <button class="agent-card" type="button" data-agent="商品主图 Agent" data-type="image-main" data-category="image">
                <span class="agent-icon">图</span>
                <strong>商品主图</strong>
                <small>基于产品图和卖点，生成可用于商品卡或图文推广的主图</small>
                <span class="agent-foot"><span class="agent-chip">商品主图</span><span class="agent-chip">多版生成</span></span>
              </button>
              <button class="agent-card" type="button" data-agent="商品详情页 Agent" data-type="image-detail" data-category="image">
                <span class="agent-icon">详</span>
                <strong>商品详情页</strong>
                <small>按产品卖点和详情页模块，生成可继续编辑的图文页面</small>
                <span class="agent-foot"><span class="agent-chip">详情页模块</span><span class="agent-chip">图文生成</span></span>
              </button>
              <button class="agent-card" type="button" data-agent="智能脚本创作" data-type="script" data-category="video">
                <span class="agent-icon">导</span>
                <strong>智能脚本</strong>
                <small>把可用文案转成包含分镜、可直接驱动混剪的脚本</small>
                <span class="agent-foot"><span class="agent-chip">结构化分镜</span><span class="agent-chip">混剪指令</span></span>
              </button>
              <button class="agent-card" type="button" data-agent="智能混剪创作" data-type="mix" data-category="video">
                <span class="agent-icon">剪</span>
                <strong>智能混剪</strong>
                <small>确认文案与 AI 配音，用已有素材完成裁切拼接</small>
                <span class="agent-foot"><span class="agent-chip">镜头匹配</span><span class="agent-chip">字幕配音</span><span class="agent-chip">可提审成片</span></span>
              </button>
              <button class="agent-card tool-card" id="openPullTool" type="button" data-category="analysis">
                <span class="agent-icon">拉</span>
                <strong>爆款拆解</strong>
                <small>独立拆解视频的口播、分镜、镜头语言与内容结构</small>
                <span class="agent-foot"><span class="agent-chip">独立分析页</span><span class="agent-chip">非对话式</span><span class="agent-chip">仿写参考</span></span>
              </button>
              </div>
            </div>

            <div class="agent-task-shell" id="agentTaskShell" aria-live="polite">
              <section class="task-work-pane">
                <div class="task-taskbar">
                  <div><strong id="taskAgentTitle">智能文案创作</strong><small id="taskAgentIntro">请按步骤补全必要信息。</small></div>
                </div>
                <div class="task-stepper" id="taskStepper" aria-label="创作步骤"></div>
                <div class="task-form-scroll" id="taskFormScroll">
                  <div class="task-form-host" id="taskFormHost"></div>
                </div>
                <div class="task-result-host" id="taskResultHost" hidden></div>
                <div class="task-form-actions" id="taskFormActions">
                  <span class="task-action-note" id="taskActionNote">完成当前步骤后继续</span>
                  <div class="task-action-buttons" id="taskActionButtons"></div>
                </div>
              </section>
              <section class="task-chat-pane">
                <div class="task-chat-head" id="taskChatHead"><div><strong id="taskChatTitle">创作会话</strong><small id="taskChatSubtitle">完成最后一步后，可继续自然语言修改结果</small></div><button class="task-chat-toggle" id="taskChatToggle" type="button" aria-expanded="false" title="展开对话">‹</button></div>
                <div class="task-chat-log" id="taskChatLog"></div>
                <div id="taskComposerHost"></div>
              </section>
            </div>

            <div class="chat-output" id="chatOutput">
            </div>

            <div class="composer-wrap">
              <div class="composer">
                <div class="followup-hint" id="followupHint"><strong>已关联上一版</strong><span>可继续说：保留第二版，只把钩子缩短到 3 秒｜卖点不变，换成人群视角</span></div>
                <div class="task-chat-target" id="taskChatTarget" hidden>
                  <span>当前聊天对象：</span><strong id="taskChatTargetLabel"></strong>
                  <button type="button" id="taskChatTargetClear" hidden>切换为全部文案</button>
                </div>
                <textarea id="promptInput" placeholder="描述你的想法，或选择下方专业能力开始创作"></textarea>
                <div class="composer-foot">
                  <div class="composer-selectors">
                    <div class="agent-picker" id="agentPicker">
                      <button class="agent-pill required" id="agentPill" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="agent-pill-icon">✦</span>
                <span class="agent-pill-label">选择 Agent</span>
                        <span class="agent-chevron">⌃</span>
                      </button>
                      <div class="agent-popover" id="agentPopover" role="listbox" aria-label="选择创作 Agent">
                        <div class="agent-popover-title">选择能力</div>
                        <div class="agent-group-title">文案创作</div>
                        <button class="agent-option" type="button" data-agent-type="original"><span class="agent-option-icon">原</span><span class="agent-option-copy"><strong>智能文案</strong><small>基于产品事实生成多版本千川口播</small></span><span class="agent-option-check"></span></button>
                        <button class="agent-option" type="button" data-agent-type="copy"><span class="agent-option-icon">仿</span><span class="agent-option-copy"><strong>爆款文案仿写</strong><small>拆解爆款方法并映射成原创文案</small></span><span class="agent-option-check"></span></button>
                        <button class="agent-option" type="button" data-agent-type="rewrite"><span class="agent-option-icon">改</span><span class="agent-option-copy"><strong>智能改写</strong><small>换钩子、压时长、换人群或表达</small></span><span class="agent-option-check"></span></button>
                        <div class="agent-group-title">图片创作</div>
                        <button class="agent-option" type="button" data-agent-type="image-main"><span class="agent-option-icon">图</span><span class="agent-option-copy"><strong>商品主图</strong><small>从产品图、卖点和投放目标生成商品主图</small></span><span class="agent-option-check"></span></button>
                        <button class="agent-option" type="button" data-agent-type="image-detail"><span class="agent-option-icon">详</span><span class="agent-option-copy"><strong>商品详情页</strong><small>按卖点和模块生成可继续编辑的详情页图文</small></span><span class="agent-option-check"></span></button>
                        <div class="agent-group-title">视频生产</div>
                        <button class="agent-option" type="button" data-agent-type="script"><span class="agent-option-icon">导</span><span class="agent-option-copy"><strong>智能脚本</strong><small>生成可拍摄、可驱动混剪的完整分镜</small></span><span class="agent-option-check"></span></button>
                        <button class="agent-option" type="button" data-agent-type="mix"><span class="agent-option-icon">剪</span><span class="agent-option-copy"><strong>智能混剪</strong><small>确认文案配音，用已有素材生成成片</small></span><span class="agent-option-check"></span></button>
                      </div>
                    </div>
                    <div class="model-picker" id="modelPicker">
                      <button class="model-trigger" id="modelTrigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="model-trigger-icon">✦</span>
                        <span class="model-trigger-copy"><small>模型</small><strong id="modelTriggerText">自动优选</strong></span>
                        <span class="model-chevron">⌃</span>
                      </button>
                      <div class="model-popover" id="modelPopover" role="listbox" aria-label="选择生成模型">
                        <div class="model-popover-head"><span>选择模型</span><small id="modelModeLabel">根据 Agent 自动匹配</small></div>
                        <div id="modelOptionList"></div>
                      </div>
                      <select class="model-native" id="modelSelect" aria-hidden="true" tabindex="-1">
                        <option>自动优选（推荐）</option>
                      </select>
                    </div>
                  </div>
                  <button class="send-btn" id="sendPrompt" aria-label="发送">↑</button>
                </div>
              </div>
            </div>
          </div>

          <div class="asset-backdrop" id="assetBackdrop"></div>
          <aside class="asset-panel" id="assetPanel">
            <div class="panel-label"><span>本次会话资产</span><span><span class="badge gray" id="assetPanelCount">0</span> <button class="asset-close" id="assetClose" aria-label="关闭会话资产">×</button></span></div>
            <div class="asset-type-tabs" role="tablist" aria-label="会话资产分类">
              <button class="asset-type-tab active" data-asset-type="copy" role="tab">文案 <b id="copyAssetCount">0</b></button>
              <button class="asset-type-tab" data-asset-type="script" role="tab">脚本 <b id="scriptAssetCount">0</b></button>
              <button class="asset-type-tab" data-asset-type="video" role="tab">视频 <b id="videoAssetCount">0</b></button>
              <button class="asset-type-tab" data-asset-type="image" role="tab">图片 <b id="imageAssetCount">0</b></button>
            </div>
            <div class="asset-type-panel active" data-asset-panel="copy">
              <div class="asset-empty" id="copyAssetEmpty">本会话生成的文案会自动出现在这里。</div>
              <div class="asset-drawer-list" id="copyAssetList"></div>
            </div>
            <div class="asset-type-panel" data-asset-panel="script">
              <div class="asset-empty" id="scriptAssetEmpty">本会话生成的结构化脚本会自动出现在这里。</div>
              <div class="asset-drawer-list" id="scriptAssetList"></div>
            </div>
            <div class="asset-type-panel" data-asset-panel="video">
              <div class="asset-empty" id="videoAssetEmpty">本会话生成的视频会自动出现在这里，可查看其来源脚本。</div>
              <div class="asset-drawer-list" id="videoAssetList"></div>
            </div>
            <div class="asset-type-panel" data-asset-panel="image">
              <div class="asset-empty" id="imageAssetEmpty">本会话生成的封面、贴片和商品图会自动出现在这里。</div>
              <div class="asset-drawer-list" id="imageAssetList"></div>
            </div>
          </aside>
        </div>
      </section>`);})();
