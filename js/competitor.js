
    (() => {
      const grid = document.getElementById("productMarketGrid");
      const actions = document.querySelector("#page-products .product-page-actions");
      const modalLayer = document.getElementById("competitorModalLayer");
      const modalBody = document.getElementById("competitorModalBody");
      const modalFooter = document.getElementById("competitorModalFooter");
      const modalTitle = document.getElementById("competitorModalTitle");
      const modalSubtitle = document.getElementById("competitorModalSubtitle");
      const modalEyebrow = document.getElementById("competitorModalEyebrow");
      if (!grid || !actions || !modalLayer) return;

      const productNames = {
        "mite-pro":"轻净 Pro 除螨仪",
        "air-a8":"轻享空气炸锅 A8",
        "washer-s5":"净界洗地机 S5",
        "blend-mini":"随行榨汁杯 Mini"
      };
      const competitorStates = {
        "mite-pro":{ status:"result", scheduled:true, time:"0806 10:32:45", count:2, frequency:"每天 02:00", scope:"同平台同类目 Top 20", hasData:true },
        "air-a8":{ status:"never", scheduled:false, time:"", count:0, frequency:"每天 02:00", scope:"同平台同类目 Top 20", hasData:false },
        "washer-s5":{ status:"analyzing", scheduled:true, time:"0806 11:06:18", count:0, frequency:"每天 02:00", scope:"同平台同类目 Top 20", hasData:false },
        "blend-mini":{ status:"failed", scheduled:true, time:"0806 09:18:02", count:0, frequency:"每周一 02:00", scope:"同平台同类目 Top 20", hasData:false }
      };
      let currentDetailProductId = "mite-pro";
      let analysisTimer = null;

      function toast(text) {
        const node = document.getElementById("toast");
        if (!node) return;
        node.textContent = text;
        node.classList.add("show");
        clearTimeout(node._competitorTimer);
        node._competitorTimer = setTimeout(() => node.classList.remove("show"), 2200);
      }
      function nowText() {
        const date = new Date();
        const pad = value => String(value).padStart(2,"0");
        return `${pad(date.getMonth()+1)}${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      }
      function stateFor(id) {
        if (!competitorStates[id]) competitorStates[id] = { status:"never", scheduled:false, time:"", count:0, frequency:"每天 02:00", scope:"同平台同类目 Top 20", hasData:false };
        return competitorStates[id];
      }
      function cardName(card) { return card?.querySelector(".product-market-title strong")?.textContent.trim() || "未命名产品"; }
      function stateLabel(state) {
        if (state.status === "analyzing") return "分析中";
        if (state.status === "result") return `${state.count || 0}个竞品`;
        if (state.status === "failed") return "分析失败";
        if (state.status === "closed") return "未开启";
        return "未开始";
      }
      function productCard(id) { return grid.querySelector(`[data-product-id="${id}"]`); }

      function renderCard(id) {
        const card = productCard(id);
        if (!card) return;
        productNames[id] = cardName(card);
        const state = stateFor(id);
        let row = card.querySelector(".product-competitor-row");
        if (!row) {
          row = document.createElement("div");
          row.className = "product-competitor-row";
          row.dataset.competitorCardRow = "";
          card.querySelector(".product-market-body")?.append(row);
        }
        row.dataset.status = state.status;
        row.innerHTML = `<b>竞品分析</b><span class="product-competitor-state"><em>${stateLabel(state)}</em><time>${state.time || "--"}</time></span>`;
        const menu = card.querySelector(".card-action-menu");
        if (menu) {
          menu.querySelectorAll("[data-competitor-menu-action]").forEach(node => node.remove());
          const items = [];
          if (state.status === "failed") items.push(["retry","重新分析"]);
          else if (state.status === "result") items.push(["retry","立即分析"]);
          else if (state.status === "never" || state.status === "closed") items.push(["settings",state.status === "closed" ? "重新开启竞品分析" : "开启竞品分析"]);
          else items.push(["settings","竞品分析设置"]);
          if (["failed","result"].includes(state.status)) items.push(["settings","竞品分析设置"]);
          const deleteItem = menu.querySelector("[data-delete-product]");
          items.forEach(([action,label]) => {
            const item = document.createElement("span");
            item.setAttribute("role","menuitem");
            item.dataset.competitorMenuAction = action;
            item.textContent = label;
            menu.insertBefore(item, deleteItem || null);
          });
        }
      }
      function renderAllCards() { grid.querySelectorAll(".product-market-card[data-product-id]").forEach(card => renderCard(card.dataset.productId)); }

      const split = document.createElement("div");
      split.className = "competitor-split";
      split.innerHTML = `<button class="competitor-open" type="button">开启竞品分析</button><button class="competitor-more" type="button" aria-label="更多竞品分析操作">⌄</button><div class="competitor-action-menu"><button type="button" data-batch-close>关闭定时分析</button></div>`;
      actions.insertBefore(split, actions.querySelector("[data-open-product-create]"));

      function setModalHeader(title,subtitle,eyebrow="竞品定时分析") {
        modalTitle.textContent = title;
        modalSubtitle.textContent = subtitle;
        modalEyebrow.textContent = eyebrow;
      }
      function modalButtons({ danger="", cancel="取消", primary="确定", disabled=false }={}) {
        modalFooter.innerHTML = `${danger ? `<button class="competitor-text-danger" type="button" data-modal-danger>${danger}</button>` : ""}<div class="competitor-modal-footer-right"><button class="ghost-btn" type="button" data-modal-cancel>${cancel}</button><button class="primary-btn" type="button" data-modal-primary ${disabled ? "disabled" : ""}>${primary}</button></div>`;
      }
      function openModal() { modalLayer.classList.add("show"); }
      function closeModal() { modalLayer.classList.remove("show"); modalLayer.dataset.mode=""; modalLayer.dataset.productId=""; }
      function scheduleFields(state={}) {
        return `<label class="competitor-field">抓取频率<select data-competitor-frequency><option ${state.frequency === "每天 02:00" ? "selected" : ""}>每天 02:00</option><option ${state.frequency === "每天 08:00" ? "selected" : ""}>每天 08:00</option><option ${state.frequency === "每周一 02:00" ? "selected" : ""}>每周一 02:00</option></select></label><label class="competitor-field">竞品范围<select data-competitor-scope><option>同平台同类目 Top 10</option><option selected>同平台同类目 Top 20</option><option>同平台同类目 Top 50</option></select></label>`;
      }
      function productOptionsHtml(mode) {
        const cards = [...grid.querySelectorAll(".product-market-card[data-product-id]")];
        const eligible = mode === "close" ? cards.filter(card => stateFor(card.dataset.productId).scheduled) : cards;
        return eligible.map(card => {
          const id = card.dataset.productId;
          const state = stateFor(id);
          const disabled = mode === "enable" && state.status === "analyzing";
          return `<label class="competitor-product-option${disabled ? " disabled" : ""}" data-product-option data-search-name="${cardName(card).toLowerCase()}"><input type="checkbox" value="${id}" ${disabled ? "disabled" : ""}><span>${cardName(card)}</span>${disabled ? "<small>分析中</small>" : ""}</label>`;
        }).join("") || `<div class="competitor-panel-state" style="min-height:150px"><div><strong>暂无可关闭的定时任务</strong><p>当前没有产品开启定时竞品分析。</p></div></div>`;
      }
      function bindProductSearch() {
        modalBody.querySelector("[data-product-search]")?.addEventListener("input", event => {
          const keyword = event.target.value.trim().toLowerCase();
          modalBody.querySelectorAll("[data-product-option]").forEach(item => item.hidden = !item.dataset.searchName.includes(keyword));
        });
      }
      function selectedModalProducts() { return [...modalBody.querySelectorAll('.competitor-product-option input:checked')].map(input => input.value); }

      function openBatchEnable() {
        setModalHeader("开启竞品分析","选择产品后，系统将按计划定时获取公开竞品数据");
        modalLayer.dataset.mode="batch-enable";
        modalBody.innerHTML = `<label class="competitor-field">选择产品<div class="competitor-product-picker"><div class="competitor-product-search"><input data-product-search placeholder="搜索产品名称"></div><div class="competitor-product-options">${productOptionsHtml("enable")}</div></div></label>${scheduleFields()}`;
        modalButtons({ primary:"开启定时抓取" });
        bindProductSearch(); openModal();
      }
      function openBatchClose() {
        setModalHeader("关闭定时分析","停止所选产品后续的定时竞品分析，已有数据继续保留");
        modalLayer.dataset.mode="batch-close";
        modalBody.innerHTML = `<label class="competitor-field">选择产品<div class="competitor-product-picker"><div class="competitor-product-search"><input data-product-search placeholder="搜索已开启定时分析的产品"></div><div class="competitor-product-options">${productOptionsHtml("close")}</div></div></label>`;
        modalButtons({ primary:"关闭定时分析" });
        bindProductSearch(); openModal();
      }
      function openSingleSettings(id) {
        const state = stateFor(id);
        const name = productNames[id] || cardName(productCard(id));
        const isRetry = state.status === "failed";
        const isAnalyze = state.status === "result";
        const isRunning = state.status === "analyzing";
        const title = state.status === "never" || state.status === "closed" ? "开启竞品分析" : "竞品分析设置";
        setModalHeader(title,"管理该产品的抓取频率、竞品范围和定时任务");
        modalLayer.dataset.mode="single";
        modalLayer.dataset.productId=id;
        modalBody.innerHTML = `<label class="competitor-field">当前产品<input value="${name}" readonly></label>${scheduleFields(state)}`;
        modalButtons({ danger:state.scheduled ? "关闭竞品分析" : "", primary:isRunning ? "分析中" : isRetry ? "重新分析" : isAnalyze ? "立即分析" : "开启定时抓取", disabled:isRunning });
        openModal();
      }
      function analyzeProducts(ids) {
        if (!ids.length) return toast("请至少选择一个产品");
        const frequency = modalBody.querySelector("[data-competitor-frequency]")?.value || "每天 02:00";
        const scope = modalBody.querySelector("[data-competitor-scope]")?.value || "同平台同类目 Top 20";
        ids.forEach(id => {
          const state = stateFor(id);
          state.status="analyzing"; state.scheduled=true; state.time=nowText(); state.frequency=frequency; state.scope=scope;
          renderCard(id);
        });
        closeModal(); renderCompetitorPanel(); toast(`已开始分析 ${ids.length} 个产品`);
        clearTimeout(analysisTimer);
        analysisTimer=setTimeout(() => {
          ids.forEach((id,index) => {
            const state=stateFor(id);
            state.hasData=true; state.count=id === "mite-pro" ? 2 : 8+index*3; state.time=nowText(); state.status=state.scheduled ? "result" : "closed";
            renderCard(id);
          });
          renderCompetitorPanel(); toast("竞品分析已完成");
        },1800);
      }
      function confirmClose(ids) {
        if (!ids.length) return toast("请至少选择一个产品");
        setModalHeader("确认关闭定时分析？","关闭后不再定时更新，已有竞品数据和报告继续保留","操作确认");
        modalLayer.dataset.mode="confirm-close";
        modalLayer.dataset.productIds=ids.join(",");
        modalBody.innerHTML=`<div class="competitor-confirm"><strong>将关闭 ${ids.length} 个产品的定时竞品分析</strong>当前正在执行的分析允许完成，但不会继续创建下一次定时任务。</div>`;
        modalButtons({ cancel:"返回", primary:"确认关闭" });
      }
      function closeScheduled(ids) {
        ids.forEach(id => { const state=stateFor(id); state.scheduled=false; state.status="closed"; renderCard(id); });
        closeModal(); renderCompetitorPanel(); toast(`已关闭 ${ids.length} 个产品的定时分析`);
      }

      split.querySelector(".competitor-open").addEventListener("click",openBatchEnable);
      split.querySelector(".competitor-more").addEventListener("click",event => { event.stopPropagation(); split.classList.toggle("open"); });
      split.querySelector("[data-batch-close]").addEventListener("click",() => { split.classList.remove("open"); openBatchClose(); });
      modalLayer.querySelector(".competitor-modal-close").addEventListener("click",closeModal);
      modalLayer.addEventListener("click",event => { if(event.target === modalLayer || event.target.closest("[data-modal-cancel]")) closeModal(); });
      modalFooter.addEventListener("click",event => {
        if (event.target.closest("[data-modal-danger]")) return confirmClose([modalLayer.dataset.productId]);
        if (!event.target.closest("[data-modal-primary]")) return;
        const mode=modalLayer.dataset.mode;
        if(mode === "batch-enable") analyzeProducts(selectedModalProducts());
        else if(mode === "batch-close") confirmClose(selectedModalProducts());
        else if(mode === "single") analyzeProducts([modalLayer.dataset.productId]);
        else if(mode === "confirm-close") closeScheduled((modalLayer.dataset.productIds || "").split(",").filter(Boolean));
        else if(mode === "report") {
          const productName=productNames[currentDetailProductId] || "当前产品";
          const blob=new Blob([`${productName}\n竞品分析报告\n生成时间：${nowText()}\n`],{type:"text/plain;charset=utf-8"});
          const url=URL.createObjectURL(blob); const link=document.createElement("a");
          link.href=url; link.download=`${productName}_竞品分析报告.txt`; link.click(); URL.revokeObjectURL(url);
          toast("报告已下载"); closeModal();
        }
      });

      document.addEventListener("click",event => {
        if(!event.target.closest(".competitor-split")) split.classList.remove("open");
      });
      document.addEventListener("click",event => {
        const row=event.target.closest("[data-competitor-card-row]");
        const action=event.target.closest("[data-competitor-menu-action]");
        if(!row && !action) return;
        event.preventDefault(); event.stopPropagation();
        const card=(row || action).closest(".product-market-card");
        const id=card?.dataset.productId;
        if(!id) return;
        card.querySelector(".card-menu-wrap")?.classList.remove("open");
        if(action?.dataset.competitorMenuAction === "retry") return analyzeProducts([id]);
        openSingleSettings(id);
      },true);

      const assetTabs=document.querySelector("#page-product-detail .product-asset-tabs");
      const assetHub=assetTabs?.parentElement;
      if(assetTabs && assetHub) {
        const competitorTab=document.createElement("button");
        competitorTab.type="button"; competitorTab.dataset.productAssetTab="competitor"; competitorTab.textContent="竞品库";
        const templateTab=assetTabs.querySelector('[data-product-asset-tab="template"]');
        assetTabs.insertBefore(competitorTab,templateTab || null);
        const competitorPanel=document.createElement("div");
        competitorPanel.className="product-asset-panel"; competitorPanel.dataset.productAssetPanel="competitor"; competitorPanel.id="productCompetitorPanel";
        const templatePanel=assetHub.querySelector('[data-product-asset-panel="template"]');
        assetHub.insertBefore(competitorPanel,templatePanel || null);
        competitorTab.addEventListener("click",() => {
          assetTabs.querySelectorAll("button").forEach(button => button.classList.toggle("active",button === competitorTab));
          assetHub.querySelectorAll("[data-product-asset-panel]").forEach(panel => panel.classList.toggle("active",panel === competitorPanel));
          renderCompetitorPanel();
        });
      }

      const competitorRows=[
        { name:"摩飞便携榨汁杯 MR9800",brand:"竞品库 · 便携榨汁杯",platform:"抖音",link:"https://www.douyin.com/search/%E4%BE%BF%E6%90%BA%E6%A6%A8%E6%B1%81%E6%9D%AF",sales:"6.3万+",audience:"都市 GenZ、健身人群",selling:"便携直饮、无线便携",scene:"运动、健身、旅行",category:"个护小家电" },
        { name:"九阳随行榨汁杯 L3",brand:"竞品库 · 榨汁杯",platform:"天猫",link:"https://list.tmall.com/search_product.htm?q=%E4%BE%BF%E6%90%BA%E6%A6%A8%E6%B1%81%E6%9D%AF",sales:"3.1万+",audience:"学生、白领",selling:"轻量杯身、易清洗",scene:"宿舍、办公室、户外",category:"个护小家电" }
      ];
      function competitorTableHtml(state) {
        return `<div class="competitor-panel-toolbar"><div><h4>当前产品跨平台竞品</h4><p>最近更新 ${state.time || "--"} · 共 ${state.count || competitorRows.length} 个竞品</p></div><div class="competitor-panel-actions"><button class="ghost-btn" type="button" data-competitor-analyze-now>立即分析</button><button class="soft-btn" type="button" data-competitor-settings>竞品分析设置</button></div></div>${!state.scheduled ? '<div class="competitor-status-banner"><span>定时竞品分析已关闭，历史分析结果继续保留。</span><button class="soft-btn" type="button" data-competitor-settings>重新开启</button></div>' : ""}<div class="competitor-table-wrap"><table class="competitor-table"><thead><tr><th>产品名称</th><th>产品素材</th><th>商品链接</th><th>平台</th><th>销量</th><th>人群</th><th>核心卖点</th><th>场景</th><th>一级类目</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${competitorRows.map((row,index)=>`<tr><td><strong>${row.name}</strong><small>${row.brand}</small></td><td><div class="competitor-materials"><button type="button" data-material-preview="主图">主图</button><button type="button" data-material-preview="详情">详情</button></div></td><td><a class="competitor-link" href="${row.link}" target="_blank" rel="noopener">查看原平台 ↗</a></td><td><span class="competitor-platform">${row.platform}</span></td><td>${row.sales}</td><td>${row.audience}</td><td>${row.selling}</td><td>${row.scene}</td><td>${row.category}</td><td>${index ? "昨天 21:10" : "15分钟前"}</td><td><div class="competitor-table-actions"><button type="button" data-view-report>查看报告</button><button type="button" data-download-report="${row.name}">下载报告</button></div></td></tr>`).join("")}</tbody></table></div>`;
      }
      function renderCompetitorPanel() {
        const panel=document.getElementById("productCompetitorPanel");
        if(!panel) return;
        const state=stateFor(currentDetailProductId);
        if(state.hasData) panel.innerHTML=competitorTableHtml(state);
        else if(state.status === "analyzing") panel.innerHTML=`<div class="competitor-panel-state"><div><div class="competitor-spinner"></div><strong>竞品分析中</strong><p>分析完成后会自动更新到当前产品竞品库。</p></div></div>`;
        else if(state.status === "failed") panel.innerHTML=`<div class="competitor-panel-state"><div><i>!</i><strong>竞品分析失败</strong><p>可重新发起本次竞品分析。</p><button class="primary-btn" type="button" data-competitor-analyze-now>重新分析</button></div></div>`;
        else if(state.status === "result") panel.innerHTML=`<div class="competitor-panel-state"><div><i>竞</i><strong>暂未发现符合条件的竞品</strong><p>本次分析已完成，可调整竞品范围后再次分析。</p><button class="primary-btn" type="button" data-competitor-settings>调整分析设置</button></div></div>`;
        else panel.innerHTML=`<div class="competitor-panel-state"><div><i>竞</i><strong>${state.status === "closed" ? "竞品分析已关闭" : "暂未开启竞品分析"}</strong><p>${state.status === "closed" ? "历史数据会继续保留，重新开启后恢复定时更新。" : "开启后将定时获取同平台、同类目的公开竞品信息。"}</p><button class="primary-btn" type="button" data-competitor-settings>${state.status === "closed" ? "重新开启竞品分析" : "开启竞品分析"}</button></div></div>`;
      }
      document.getElementById("productCompetitorPanel")?.addEventListener("click",event => {
        if(event.target.closest("[data-competitor-settings]")) return openSingleSettings(currentDetailProductId);
        if(event.target.closest("[data-competitor-analyze-now]")) return analyzeProducts([currentDetailProductId]);
        if(event.target.closest("[data-material-preview]")) return toast(`正在预览竞品${event.target.closest("[data-material-preview]").dataset.materialPreview}`);
        if(event.target.closest("[data-view-report]")) {
          setModalHeader("竞品分析报告","当前竞品与目标产品的公开信息对比","竞品报告");
          modalLayer.dataset.mode="report";
          modalBody.innerHTML=`<div class="competitor-confirm"><strong>${productNames[currentDetailProductId] || "当前产品"}竞品分析摘要</strong>竞品普遍强调便携、易清洗与多场景使用；当前产品可进一步突出核心性能证明、真实使用结果和差异化场景表达。</div>`;
          modalButtons({ cancel:"关闭", primary:"下载报告" }); openModal(); return;
        }
        const download=event.target.closest("[data-download-report]");
        if(download) {
          const blob=new Blob([`${download.dataset.downloadReport}\n竞品分析报告\n生成时间：${nowText()}\n`],{type:"text/plain;charset=utf-8"});
          const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=`${download.dataset.downloadReport}_竞品分析报告.txt`; link.click(); URL.revokeObjectURL(url); toast("报告已下载");
        }
      });

      document.addEventListener("click",event => {
        const card=event.target.closest("[data-open-product-detail][data-product-id]");
        if(card && !event.target.closest("[data-competitor-card-row],[data-toggle-card-menu],[data-competitor-menu-action]")) {
          currentDetailProductId=card.dataset.productId;
          setTimeout(renderCompetitorPanel,0);
        }
      },true);

      const cardObserver=new MutationObserver(() => renderAllCards());
      cardObserver.observe(grid,{childList:true,subtree:false});
      renderAllCards(); renderCompetitorPanel();

      const taskShell=document.getElementById("agentTaskShell");
      const taskChatPane=taskShell?.querySelector(".task-chat-pane");
      if(taskShell && taskChatPane) {
        const toggle=document.createElement("button");
        toggle.type="button"; toggle.className="task-chat-toggle"; toggle.setAttribute("aria-label","展开创作助手"); toggle.title="展开创作助手"; toggle.textContent="‹";
        taskChatPane.prepend(toggle);
        function setChatCollapsed(collapsed) {
          taskShell.classList.toggle("chat-collapsed",collapsed);
          taskChatPane.classList.toggle("is-collapsed",collapsed);
          toggle.textContent=collapsed ? "‹" : "›";
          toggle.title=collapsed ? "展开创作助手" : "收起创作助手";
          toggle.setAttribute("aria-label",toggle.title);
        }
        toggle.addEventListener("click",()=>setChatCollapsed(!taskChatPane.classList.contains("is-collapsed")));
        let previousComplete=false;
        const taskObserver=new MutationObserver(() => {
          const visible=taskShell.classList.contains("show");
          const complete=taskShell.classList.contains("is-complete");
          if(!visible) { previousComplete=false; return; }
          if(complete && !previousComplete) setChatCollapsed(false);
          else if(!complete && previousComplete) setChatCollapsed(true);
          else if(!complete && !taskShell.dataset.chatInitialized) { setChatCollapsed(true); taskShell.dataset.chatInitialized="true"; }
          previousComplete=complete;
        });
        taskObserver.observe(taskShell,{attributes:true,attributeFilter:["class","data-agent-type"]});
        setChatCollapsed(true);
      }
    })();
  