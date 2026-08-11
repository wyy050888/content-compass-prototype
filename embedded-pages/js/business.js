    /* ===================== 经营自动化·新模块 ===================== */

    /* --- 素材监控 --- */
    let mmDays = 7; /* 可配置天数，默认7天 */
    let mmCurrentAcc = "all";
    const mmPlacementData = [
      {id:1,name:"床单除螨除菌演示A版",type:"视频",shop:"苏泊尔生活电器专卖店",plan:"除螨仪-短视频-0712",upload:"07-12",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_3344",st:"low"},
      {id:2,name:"蒸汽拖把清洁对比图",type:"图片",shop:"苏泊尔生活电器专卖店",plan:"蒸汽拖把-图片-0708",upload:"07-08",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"TW_8821",st:"low"},
      {id:3,name:"吸尘器吸力测试B版",type:"视频",shop:"苏泊尔厨具旗舰店",plan:"吸尘器-短视频-0710",upload:"07-10",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_3344",st:"low"},
      {id:4,name:"果蔬清洗机使用教程",type:"视频",shop:"苏泊尔厨具旗舰店",plan:"果蔬清洗机-短视频-0705",upload:"07-05",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_7788",st:"low"},
      {id:5,name:"挂烫机便携展示图",type:"图片",shop:"苏泊尔生活电器专卖店",plan:"挂烫机-图片-0709",upload:"07-09",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"TW_8821",st:"low"},
      {id:6,name:"破壁机食谱合集C版",type:"视频",shop:"苏泊尔厨具旗舰店",plan:"破壁机-短视频-0706",upload:"07-06",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_7788",st:"low"},
      {id:7,name:"料理机开箱体验",type:"视频",shop:"苏泊尔环境电器专营店",plan:"料理机-短视频-0703",upload:"07-03",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_5512",st:"low"},
      {id:8,name:"空气炸锅食谱图卡",type:"图片",shop:"苏泊尔厨具旗舰店",plan:"空气炸锅-图片-0701",upload:"07-01",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"TW_5567",st:"low"}
    ];
    const mmReviewData = [
      {id:1,name:"床单B版除螨演示",shop:"苏泊尔生活电器专卖店",acc:"SF_8821",submit:"07-20 10:32",dur:"2h15m",audit:"passed",reason:"已分发完毕"},
      {id:2,name:"蒸汽C版拖把对比",shop:"苏泊尔厨具旗舰店",acc:"SF_5567",submit:"07-18 14:20",dur:"4h30m",audit:"rejected",reason:"终态-释放容量"},
      {id:3,name:"拖把E版便携展示",shop:"苏泊尔生活电器专卖店",acc:"SF_8821",submit:"07-22 09:15",dur:"1h45m",audit:"passed",reason:"已分发完毕"},
      {id:4,name:"除螨F版深度清洁",shop:"苏泊尔厨具旗舰店",acc:"SF_5567",submit:"07-16 16:08",dur:"6h20m",audit:"rejected",reason:"终态-释放容量"},
      {id:5,name:"吸尘器G版强劲模式",shop:"苏泊尔环境电器专营店",acc:"SF_3399",submit:"07-19 11:00",dur:"3h05m",audit:"passed",reason:"已分发完毕"},
      {id:6,name:"破壁机H版静音测试",shop:"苏泊尔厨具旗舰店",acc:"SF_5567",submit:"07-14 08:40",dur:"2h50m",audit:"passed",reason:"已分发完毕"}
    ];
    function mmRenderPlacement(){
      const tb=document.getElementById("mmPlacementTbody");
      if(!tb)return;
      const filtered = mmCurrentAcc==="all" ? mmPlacementData : mmPlacementData.filter(r=>r.acc===mmCurrentAcc);
      tb.innerHTML=filtered.map(r=>`<tr>
        <td><input type="checkbox" class="mm-check" data-id="${r.id}"></td>
        <td class="name-link">${r.name}</td>
        <td>${r.type}</td><td>${r.shop}</td><td>${r.plan}</td><td>${r.upload}</td>
        <td>0</td><td>0</td><td>0</td><td>0.00%</td><td>—</td>
        <td class="acc-link">${r.acc}</td>
        <td><span class="badge orange">⚠ 低效</span></td>
        <td><button class="soft-btn mm-del" data-id="${r.id}">删除</button></td>
      </tr>`).join("");
    }
    function mmFilterByAcc(acc){ mmCurrentAcc=acc; mmRenderPlacement(); }
    function mmRenderReview(){
      const tb=document.getElementById("mmReviewTbody");
      if(!tb)return;
      const filtered = mmCurrentAcc==="all" ? mmReviewData : mmReviewData.filter(r=>r.acc===mmCurrentAcc);
      tb.innerHTML=filtered.map(r=>{
        const tag=r.audit==="passed"?'<span class="badge green">✅ 已通过</span>':'<span class="badge red">❌ 复审不通过</span>';
        return `<tr>
        <td><input type="checkbox" class="mm-rcheck" data-id="${r.id}"></td>
        <td class="name-link">${r.name}</td><td>${r.shop}</td><td class="acc-link">${r.acc}</td>
        <td>${r.submit}</td><td>${r.dur}</td><td>${tag}</td><td>${r.reason}</td>
        <td><button class="soft-btn mm-rclean" data-id="${r.id}">清理</button></td>
      </tr>`;
      }).join("");
    }
    (function(){
      document.querySelectorAll("[data-mm-tab]").forEach(tab=>{
        tab.addEventListener("click",()=>{
          document.querySelectorAll("[data-mm-tab]").forEach(t=>t.classList.remove("active"));
          tab.classList.add("active");
          const target=tab.dataset.mmTab;
          document.querySelectorAll("[data-mm-panel]").forEach(p=>p.hidden=p.dataset.mmPanel!==target);
        });
      });
      const ca=document.getElementById("mmCheckAll");
      if(ca)ca.addEventListener("change",e=>{
        document.querySelectorAll(".mm-check").forEach(c=>c.checked=e.target.checked);
      });
      const rca=document.getElementById("mmReviewCheckAll");
      if(rca)rca.addEventListener("change",e=>{
        document.querySelectorAll(".mm-rcheck").forEach(c=>c.checked=e.target.checked);
      });
      const scanBtn=document.getElementById("mmScanBtn");
      if(scanBtn)scanBtn.addEventListener("click",()=>{
        scanBtn.textContent="扫描中…";scanBtn.disabled=true;
        showToast("正在扫描全账户素材…");
        setTimeout(()=>{scanBtn.textContent="手动扫描";scanBtn.disabled=false;showToast("扫描完成，发现186条低效素材");},1800);
      });
      function showCleanProgress(count){
        const ov=document.createElement("div");
        ov.className="clean-overlay show";
        ov.innerHTML=`<div class="clean-box"><h3>正在清理低效素材</h3><div class="clean-bar"><span style="width:0%"></span></div><div class="pt">0 / ${count}</div></div>`;
        document.body.appendChild(ov);
        let done=0;
        const timer=setInterval(()=>{
          done+=Math.ceil(count/10);
          if(done>=count){done=count;clearInterval(timer);
            setTimeout(()=>{ov.remove();showToast(`清理完成！已释放${count}条容量`);},500);
          }
          ov.querySelector(".clean-bar span").style.width=(done/count*100)+"%";
          ov.querySelector(".pt").textContent=`${done} / ${count}`;
        },200);
      }
      const cleanAll=document.getElementById("mmCleanAll");
      if(cleanAll)cleanAll.addEventListener("click",()=>{
        showCleanProgress(128);
        setTimeout(()=>{mmPlacementData.length=0;mmRenderPlacement();},2200);
      });
      const bulkDel=document.getElementById("mmBulkDelete");
      if(bulkDel)bulkDel.addEventListener("click",()=>{
        const checked=[...document.querySelectorAll(".mm-check:checked")].map(c=>+c.dataset.id);
        if(!checked.length){showToast("请先勾选要删除的素材");return;}
        showCleanProgress(checked.length);
        setTimeout(()=>{
          checked.forEach(id=>{const i=mmPlacementData.findIndex(r=>r.id===id);if(i>=0)mmPlacementData.splice(i,1);});
          mmRenderPlacement();showToast(`已删除${checked.length}条素材`);
        },checked.length*200+500);
      });
      document.addEventListener("click",e=>{
        const del=e.target.closest(".mm-del");
        if(del){const id=+del.dataset.id;const i=mmPlacementData.findIndex(r=>r.id===id);if(i>=0)mmPlacementData.splice(i,1);mmRenderPlacement();showToast("已删除素材");}
        const rc=e.target.closest(".mm-rclean");
        if(rc){const id=+rc.dataset.id;const i=mmReviewData.findIndex(r=>r.id===id);if(i>=0)mmReviewData.splice(i,1);mmRenderReview();showToast("已清理过审素材");}
      });
      /* 规则设置弹窗 */
      const mmRuleModal=document.getElementById("mmRuleModal");
      const mmRuleBtn=document.getElementById("mmRuleBtn");
      if(mmRuleBtn)mmRuleBtn.addEventListener("click",()=>{
        document.getElementById("mmDayInput").value=mmDays;
        mmRuleModal.classList.add("show");
      });
      document.getElementById("mmRuleClose").addEventListener("click",()=>mmRuleModal.classList.remove("show"));
      document.getElementById("mmRuleCancel").addEventListener("click",()=>mmRuleModal.classList.remove("show"));
      document.getElementById("mmRuleSave").addEventListener("click",()=>{
        const v=parseInt(document.getElementById("mmDayInput").value);
        if(v<3||v>30||isNaN(v)){showToast("天数范围为3-30天");return;}
        mmDays=v;
        document.getElementById("mmDayLabel").textContent=v;
        document.getElementById("mmThImp").textContent=v+"天展现";
        document.getElementById("mmThCost").textContent=v+"天消耗(元)";
        mmRuleModal.classList.remove("show");
        showToast("规则已更新：投放账户按"+v+"天零消耗规则扫描");
      });
      mmRenderPlacement();
      mmRenderReview();
    })();

    /* --- 过审分发 --- */
    let rdCurrentAcc = "all";
    const rdData=[
      {id:1,name:"床单除螨除菌版A",prod:"生活电器",shop:"苏泊尔生活电器专卖店",dur:"32s",uploader:"张三",acc:"SF_8821",plan:"过审_生活电器",audit:"reviewing",dist:"—",distTo:"—"},
      {id:2,name:"蒸汽拖把便携版B",prod:"厨具",shop:"苏泊尔厨具旗舰店",dur:"28s",uploader:"李四",acc:"SF_5567",plan:"过审_厨具",audit:"passed",dist:"distributing",distTo:"ZB_7788✓ TW_5567…"},
      {id:3,name:"吸尘器强劲模式C",prod:"生活电器",shop:"苏泊尔环境电器专营店",dur:"45s",uploader:"张三",acc:"SF_8821",plan:"过审_生活电器",audit:"rejected",dist:"appealing",distTo:"—"},
      {id:4,name:"果蔬清洗机教程D",prod:"厨具",shop:"苏泊尔厨具旗舰店",dur:"38s",uploader:"王五",acc:"SF_5567",plan:"过审_厨具",audit:"passed",dist:"done",distTo:"ZB_7788✓ TW_5567✓"},
      {id:5,name:"破壁机静音测试E",prod:"生活电器",shop:"苏泊尔生活电器专卖店",dur:"25s",uploader:"赵六",acc:"SF_8821",plan:"过审_生活电器",audit:"reviewing",dist:"—",distTo:"—"},
      {id:6,name:"挂烫机展示F版",prod:"厨具",shop:"苏泊尔厨具旗舰店",dur:"30s",uploader:"李四",acc:"SF_5567",plan:"过审_厨具",audit:"passed",dist:"done",distTo:"ZB_7788✓ TW_5567✓"}
    ];
    function rdRender(){
      const tb=document.getElementById("rdTbody");
      if(!tb)return;
      const filtered = rdCurrentAcc==="all" ? rdData : rdData.filter(r=>r.acc===rdCurrentAcc);
      const auditMap={reviewing:'<span class="badge orange">⏳ 审核中</span>',passed:'<span class="badge green">✅ 已通过</span>',rejected:'<span class="badge red">❌ 不通过</span>'};
      const distMap={"—":"—",distributing:'<span class="badge" style="color:#4647c8;background:#eeefff;">🔄 分发中</span>',done:'<span class="badge green">✅ 已分发</span>',appealing:'<span class="badge orange">📍 待申诉</span>'};
      tb.innerHTML=filtered.map(r=>`<tr>
        <td class="name-link">${r.name}</td><td>${r.prod}</td><td>${r.shop}</td><td>${r.dur}</td><td>${r.uploader}</td>
        <td class="acc-link">${r.acc}</td>
        <td><span class="badge" style="color:#4647c8;background:#eeefff;font-size:11px;">${r.plan}</span></td>
        <td>${auditMap[r.audit]}</td><td>${distMap[r.dist]}</td>
        <td style="font-size:11px;color:var(--muted);">${r.distTo}</td>
        <td>${r.audit==="rejected"?'<button class="soft-btn rd-conclusion" data-id="'+r.id+'">查看审核结论</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
      </tr>`).join("");
    }
    function rdFilterByAcc(acc){ rdCurrentAcc=acc; rdRender(); }
    (function(){
      const upBtn=document.getElementById("rdUploadBtn");
      if(upBtn)upBtn.addEventListener("click",()=>showToast("上传功能：请从NAS选择视频或拖拽上传"));
      /* 智投星审核结论弹窗 */
      const rdConcModal=document.getElementById("rdConclusionModal");
      document.addEventListener("click",e=>{
        const c=e.target.closest(".rd-conclusion");
        if(c){rdConcModal.classList.add("show");}
      });
      document.getElementById("rdConcClose").addEventListener("click",()=>rdConcModal.classList.remove("show"));
      document.getElementById("rdConcAck").addEventListener("click",()=>{rdConcModal.classList.remove("show");showToast("已标记已知晓，视频将加入待清理列表");});
      document.getElementById("rdConcExport").addEventListener("click",()=>showToast("审核结论PDF已生成"));
      document.getElementById("rdConcReupload").addEventListener("click",()=>{rdConcModal.classList.remove("show");showToast("已关联原视频记录，请上传修改版");});
      /* 新建过审计划弹窗 */
      const rdPlanModal=document.getElementById("rdCreatePlanModal");
      const rdCreateBtn=document.getElementById("rdCreatePlanBtn");
      if(rdCreateBtn)rdCreateBtn.addEventListener("click",()=>rdPlanModal.classList.add("show"));
      document.getElementById("rdPlanClose").addEventListener("click",()=>rdPlanModal.classList.remove("show"));
      document.getElementById("rdPlanCancel").addEventListener("click",()=>rdPlanModal.classList.remove("show"));
      document.querySelectorAll("#rdPlanType button").forEach(b=>b.addEventListener("click",()=>{
        document.querySelectorAll("#rdPlanType button").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
      }));
      document.getElementById("rdPlanConfirm").addEventListener("click",()=>{
        const name=document.getElementById("rdPlanName").value;
        if(!name.includes("过审")){showToast("计划名称必须包含'过审'字样");return;}
        rdPlanModal.classList.remove("show");
        showToast("过审计划创建成功！正在自动上传3条待过审视频…");
        setTimeout(()=>{
          const alert=document.getElementById("rdPlanAlert");
          if(alert)alert.style.display="none";
          showToast("3条视频已上传至新过审计划，审核监听已启动");
        },2000);
      });
      const capList=document.getElementById("rdCapacityList");
      if(capList){
        const caps=[{n:"SF_8821（生活电器）",used:420,total:500},{n:"SF_5567（厨具）",used:387,total:500}];
        capList.innerHTML=caps.map(c=>{
          const pct=Math.round(c.used/c.total*100);
          const cls=pct>=90?"#c14545":pct>=75?"#f5b73a":"#797cf4";
          return `<div class="cap-item"><span class="name">${c.n}</span><div class="bar"><span style="width:${pct}%;background:${cls};"></span></div><span class="num">${c.used}/${c.total}</span></div>`;
        }).join("");
      }
      const qList=document.getElementById("rdQuotaList");
      if(qList){
        const qs=[{n:"张三",used:50,total:50},{n:"李四",used:48,total:50},{n:"王五",used:42,total:50},{n:"赵六",used:45,total:50}];
        qList.innerHTML=qs.map(q=>{
          const pct=Math.round(q.used/q.total*100);
          const cls=q.used>=q.total?"#c14545":pct>=90?"#f5b73a":"#16a778";
          const tag=q.used>=q.total?' <span class="badge red">已达上限</span>':pct>=90?' <span class="badge orange">接近上限</span>':' <span class="badge green">正常</span>';
          return `<div class="quota-person"><span class="pname">${q.n}${tag}</span><div class="pbar"><span style="width:${pct}%;background:${cls};"></span></div><span class="pnum">${q.used}/${q.total}</span></div>`;
        }).join("")+`<div style="margin-top:8px;color:var(--muted);font-size:11px;">💡 当前剩余容量: 113条。张三已达上限，新上传将自动轮替至王五。</div>`;
      }
      rdRender();
    })();

    /* --- 商品卡推广 --- */
    let pcCurrentAcc = "all";
    /* acc 字段对应投放账户，用于二级侧边栏筛选 */
    const pcData=[
      {id:1,name:"苏泊尔轻净Pro除螨仪",link:"P_8821",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"除螨仪-商品卡-0715",st:"active",imp:12500,click:380,cost:3280,gmv:8920,roi:2.72,ctr:3.04,cpa:8.6,acc:"ZB_3344",reason:"—"},
      {id:2,name:"苏泊尔手持挂烫机",link:"P_8822",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"挂烫机-商品卡-0715",st:"active",imp:8200,click:245,cost:2150,gmv:5680,roi:2.64,ctr:2.99,cpa:8.8,acc:"ZB_3344",reason:"—"},
      {id:3,name:"苏泊尔智能料理机",link:"P_8823",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"料理机-商品卡-0712",st:"paused",imp:0,click:0,cost:0,gmv:0,roi:0,ctr:0,cpa:"—",acc:"ZB_3344",reason:"⚠ 评分低于4.0"},
      {id:4,name:"苏泊尔电烤箱32L",link:"P_8824",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"电烤箱-商品卡-0710",st:"paused",imp:0,click:0,cost:0,gmv:0,roi:0,ctr:0,cpa:"—",acc:"ZB_3344",reason:"商品已售罄"},
      {id:5,name:"苏泊尔破壁机静音版",link:"P_8825",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"破壁机-商品卡-0731",st:"new",imp:320,click:12,cost:120,gmv:320,roi:2.67,ctr:3.75,cpa:10.0,acc:"ZB_3344",reason:"—"},
      {id:6,name:"苏泊尔蒸汽拖把",link:"P_8826",shop:"苏泊尔官方旗舰店",shopId:"SHOP_5567",plan:"蒸汽拖把-商品卡-0714",st:"active",imp:15600,click:470,cost:4120,gmv:11200,roi:2.72,ctr:3.01,cpa:8.8,acc:"ZB_7788",reason:"—"},
      {id:7,name:"苏泊尔空气炸锅A8",link:"P_8827",shop:"苏泊尔官方旗舰店",shopId:"SHOP_5567",plan:"空气炸锅-商品卡-0714",st:"active",imp:13800,click:410,cost:3680,gmv:9800,roi:2.66,ctr:2.97,cpa:9.0,acc:"ZB_7788",reason:"—"},
      {id:8,name:"苏泊尔果蔬清洗机",link:"P_8828",shop:"苏泊尔官方旗舰店",shopId:"SHOP_5567",plan:"果蔬清洗机-商品卡-0708",st:"paused",imp:0,click:0,cost:0,gmv:0,roi:0,ctr:0,cpa:"—",acc:"ZB_7788",reason:"⚠ 商品被处罚"}
    ];
    const pcLogs=[
      {t:"08:02",text:"新建商品卡计划: <strong>苏泊尔破壁机静音版(P_8825)</strong> → 锦云生活电器专卖店"},
      {t:"08:03",text:"尝试重启暂停计划: <strong>苏泊尔智能料理机(P_8823)</strong> → 评分低，已反馈店铺负责人"},
      {t:"08:05",text:"跳过: <strong>苏泊尔电烤箱(P_8824)</strong> → 商品售罄，待补货后自动重试"},
      {t:"08:06",text:"异常上报: <strong>苏泊尔果蔬清洗机(P_8828)</strong> → 商品被处罚，已通知店铺负责人优化"}
    ];
    function pcRender(){
      const tb=document.getElementById("pcTbody");
      if(!tb)return;
      const stMap={active:'<span class="badge green">✅ 正常投放</span>',paused:'<span class="badge orange">⏸ 已暂停</span>',new:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 今日新建</span>'};
      const filtered = pcCurrentAcc==="all" ? pcData : pcData.filter(r=>r.acc===pcCurrentAcc);
      tb.innerHTML=filtered.map(r=>`<tr>
        <td class="name-link">${r.name}</td><td>${r.link}</td><td>${r.shop}</td><td>${r.shopId}</td>
        <td>${r.plan}</td><td>${stMap[r.st]}</td>
        <td>${r.imp||"—"}</td><td>${r.click||"—"}</td><td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td>
        <td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.ctr?r.ctr.toFixed(2)+"%":"—"}</td><td>${r.cpa}</td>
        <td style="color:${r.reason!=='—'?'#b56b1a':'var(--muted)'};">${r.reason}</td>
        <td><button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button></td>
      </tr>`).join("");
      const ll=document.getElementById("pcLogList");
      if(ll)ll.innerHTML=pcLogs.map(l=>`<div class="log-entry"><span class="ltime">${l.t}</span><span class="ltext">${l.text}</span></div>`).join("");
    }
    function pcFilterByAcc(acc){ pcCurrentAcc=acc; pcRender(); }
    (function(){
      const scan=document.getElementById("pcScanBtn");
      if(scan)scan.addEventListener("click",()=>{
        scan.textContent="扫描中…";scan.disabled=true;showToast("正在扫描所有有效商品链接…");
        setTimeout(()=>{scan.textContent="立即扫描";scan.disabled=false;showToast("扫描完成：新建1个计划，3个暂停待处理");},1800);
      });
      pcRender();
    })();

    /* --- 图文推广 --- */
    let cpCurrentAcc = "all";
    const cpData=[
      {id:1,prod:"苏泊尔除螨仪",acct:"@苏泊尔生活电器",adAcc:"TW_8821",plan:"除螨仪-图文-0728",st:"active",videos:45,imp:8200,click:210,cost:1860,gmv:5200,roi:2.80,interact:4.2,person:"张三",update:"07-31"},
      {id:2,prod:"苏泊尔除螨仪",acct:"@生活好物精选",adAcc:"TW_8821",plan:"除螨仪-图文-0728",st:"active",videos:38,imp:6500,click:168,cost:1420,gmv:3800,roi:2.68,interact:3.8,person:"李四",update:"07-31"},
      {id:3,prod:"苏泊尔挂烫机",acct:"@苏泊尔生活电器",adAcc:"TW_8821",plan:"挂烫机-图文-0720",st:"paused",videos:12,imp:2100,click:52,cost:380,gmv:920,roi:2.42,interact:2.5,person:"王五",update:"07-28"},
      {id:4,prod:"苏泊尔破壁机",acct:"@厨房日记",adAcc:"TW_5567",plan:"破壁机-图文-0810",st:"pending",videos:0,imp:0,click:0,cost:0,gmv:0,roi:0,interact:0,person:"—",update:"—"},
      {id:5,prod:"苏泊尔蒸汽拖把",acct:"@苏泊尔生活电器",adAcc:"TW_5567",plan:"蒸汽拖把-图文-0725",st:"active",videos:42,imp:7800,click:195,cost:1680,gmv:4600,roi:2.74,interact:3.5,person:"赵六",update:"07-30"},
      {id:6,prod:"苏泊尔空气炸锅",acct:"@美食探店达人",adAcc:"TW_5567",plan:"空气炸锅-图文-0726",st:"active",videos:35,imp:5600,click:145,cost:1250,gmv:3400,roi:2.72,interact:4.0,person:"张三",update:"07-31"}
    ];
    function cpRender(){
      const tb=document.getElementById("cpTbody");
      if(!tb)return;
      const stMap={active:'<span class="badge green">✅ 正常</span>',paused:'<span class="badge orange">⏸ 暂停</span>',pending:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 待填充</span>'};
      const filtered = cpCurrentAcc==="all" ? cpData : cpData.filter(r=>r.adAcc===cpCurrentAcc);
      tb.innerHTML=filtered.map(r=>`<tr>
        <td class="name-link">${r.prod}</td><td>${r.acct}</td><td class="acc-link">${r.adAcc}</td><td>${r.plan}</td>
        <td>${stMap[r.st]}</td><td>${r.videos}</td>
        <td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td><td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.interact?r.interact.toFixed(1)+"%":"—"}</td>
        <td>${r.person}</td><td>${r.update}</td>
        <td>${r.st==="pending"?'<button class="soft-btn cp-fill" data-id="'+r.id+'">填充视频</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
      </tr>`).join("");
    }
    function cpFilterByAcc(acc){ cpCurrentAcc=acc; cpRender(); }
    (function(){
      document.querySelectorAll("[data-cp-tab]").forEach(tab=>{
        tab.addEventListener("click",()=>{
          document.querySelectorAll("[data-cp-tab]").forEach(t=>t.classList.remove("active"));
          tab.classList.add("active");
          document.querySelectorAll("[data-cp-panel]").forEach(p=>p.hidden=p.dataset.cpPanel!==tab.dataset.cpTab);
        });
      });
      const scan=document.getElementById("cpScanBtn");
      if(scan)scan.addEventListener("click",()=>{showToast("正在扫描链接×抖音号组合…");setTimeout(()=>showToast("扫描完成：今日更新42条素材，4个计划待填充"),1500);});
      const fillAll=document.getElementById("cpFillAll");
      if(fillAll)fillAll.addEventListener("click",()=>{
        const pending=cpData.filter(r=>r.st==="pending");
        if(!pending.length){showToast("没有待填充的计划");return;}
        showToast(`正在为${pending.length}个计划匹配过审视频…`);
        setTimeout(()=>{
          pending.forEach(r=>{r.st="active";r.videos=8;r.person="赵六";r.update="07-31";});
          cpRender();showToast("填充完成！已为4个计划各填充8条视频");
        },1800);
      });
      document.addEventListener("click",e=>{
        const f=e.target.closest(".cp-fill");
        if(f){const id=+f.dataset.id;const r=cpData.find(x=>x.id===id);if(r){r.st="active";r.videos=8;r.person="赵六";r.update="07-31";cpRender();showToast("填充完成！已上线8条新素材");}}
      });
      const qb=document.getElementById("cpQuotaBoard");
      /* 配额数据（可动态更新） */
      const cpQuotaPlans=[
        {n:"SF_8821（图文投放）",used:387,total:500,members:[{n:"张三",u:50,t:50},{n:"李四",u:48,t:50},{n:"王五",u:42,t:50},{n:"赵六",u:45,t:50}]}
      ];
      function cpRenderQuota(){
        if(!qb)return;
        qb.innerHTML=cpQuotaPlans.map(p=>{
          const pct=Math.round(p.used/p.total*100);
          return `<div class="card" style="margin-bottom:12px;">
            <div class="card-title"><div><h3>${p.n}</h3><small>容量: ${p.total}条 · 已用: ${p.used}条 · 剩余: ${p.total-p.used}条 · 协作人数: ${p.members.length}人</small></div></div>
            <div style="padding:0 16px 16px;">
              <div class="cap-item" style="margin-bottom:8px;"><span class="name">总体使用率</span><div class="bar"><span style="width:${pct}%;background:${pct>=80?'#f5b73a':'#797cf4'};"></span></div><span class="num">${pct}%</span></div>
              ${p.members.map(m=>{
                const mp=Math.round(m.u/m.t*100);
                const mc=m.u>=m.t?"#c14545":mp>=90?"#f5b73a":"#16a778";
                const overTag=m.u>m.t?' <span class="badge orange">🟡超额(历史)</span>':m.u>=m.t?' <span class="badge red">已达上限</span>':mp>=90?' <span class="badge orange">接近上限</span>':' <span class="badge green">正常</span>';
                return `<div class="quota-person"><span class="pname">${m.n}${overTag}</span><div class="pbar"><span style="width:${Math.min(mp,100)}%;background:${mc};"></span></div><span class="pnum">${m.u}/${m.t}</span></div>`;
              }).join("")}
              <div style="margin-top:8px;color:var(--muted);font-size:11px;">💡 每人配额 = 容量上限${p.total} ÷ 协作人数${p.members.length} = ${Math.floor(p.total/p.members.length)}条/人</div>
            </div></div>`;
        }).join("");
      }
      cpRenderQuota();
      /* 新增协作人员弹窗 */
      const cpMemberModal=document.getElementById("cpAddMemberModal");
      const cpAddMemberBtn=document.getElementById("cpAddMemberBtn");
      if(cpAddMemberBtn)cpAddMemberBtn.addEventListener("click",()=>{
        /* 预览配额变化 */
        const plan=cpQuotaPlans[0];
        const newCount=plan.members.length+1;
        const newQuota=Math.floor(plan.total/newCount);
        const oldQuota=Math.floor(plan.total/plan.members.length);
        document.getElementById("cpQuotaPreview").innerHTML=
          '<span>ℹ</span><span>新增人员后，配额将自动重算：当前 <strong>'+plan.members.length+'人</strong> × 每人'+oldQuota+'条 → <strong>'+newCount+'人</strong> × 每人<strong>'+newQuota+'条</strong>（每人配额减少'+(oldQuota-newQuota)+'条）</span>';
        cpMemberModal.classList.add("show");
      });
      document.getElementById("cpMemberClose").addEventListener("click",()=>cpMemberModal.classList.remove("show"));
      document.getElementById("cpMemberCancel").addEventListener("click",()=>cpMemberModal.classList.remove("show"));
      document.getElementById("cpMemberConfirm").addEventListener("click",()=>{
        const name=document.getElementById("cpMemberName").value.trim();
        const acc=document.getElementById("cpMemberAcc").value.trim();
        if(!name||!acc){showToast("请填写人员姓名和千川账户ID");return;}
        const plan=cpQuotaPlans[0];
        const newCount=plan.members.length+1;
        const newQuota=Math.floor(plan.total/newCount);
        /* 重算所有人员配额上限 */
        plan.members.forEach(m=>{m.t=newQuota;});
        /* 新增人员（本次上传0条，配额为新的每人上限） */
        plan.members.push({n:name,u:0,t:newQuota});
        cpMemberModal.classList.remove("show");
        document.getElementById("cpMemberName").value="";
        document.getElementById("cpMemberAcc").value="";
        cpRenderQuota();
        showToast("已新增协作人员【"+name+"】，配额已重算："+newCount+"人×"+newQuota+"条/人");
      });
      cpRender();
    })();

    /* --- 账户配置 --- */
    const acData=[
      {id:1,prod:"苏泊尔生活电器",review:"SF_8821（过审）",live:"ZB_3344",tuwen:"TW_8821（同过审）",port:"MK_001 锦云生活电器专卖店",st:"active"},
      {id:2,prod:"苏泊尔厨具",review:"SF_5567（过审）",live:"ZB_7788",tuwen:"TW_5567（同过审）",port:"MK_002 苏泊尔官方旗舰店",st:"active"},
      {id:3,prod:"苏泊尔环境电器",review:"SF_3399（过审）",live:"ZB_5512",tuwen:"TW_3399（同过审）",port:"MK_003 环境电器专营店",st:"active"},
      {id:4,prod:"苏泊尔小家电",review:"SF_7766（过审）",live:"ZB_9988",tuwen:"TW_7766（同过审）",port:"MK_004 小家电旗舰店",st:"paused"}
    ];
    function acRender(){
      const tb=document.getElementById("acTbody");
      if(!tb)return;
      tb.innerHTML=acData.map(r=>`<tr>
        <td><strong>${r.prod}</strong></td>
        <td class="acc-link">${r.review}</td><td class="acc-link">${r.live}</td><td class="acc-link">${r.tuwen}</td><td>${r.port}</td>
        <td>${r.st==="active"?'<span class="badge green">运行中</span>':'<span class="badge gray">已暂停</span>'}</td>
        <td><button class="ghost-btn ac-edit" data-id="${r.id}" style="font-size:11px;padding:4px 8px;">编辑</button></td>
      </tr>`).join("");
    }
    (function(){
      const add=document.getElementById("acAddBtn");
      if(add)add.addEventListener("click",()=>showToast("新增产品：填写产品名称和4类账户ID"));
      document.addEventListener("click",e=>{
        const ed=e.target.closest(".ac-edit");
        if(ed){showToast("编辑配置：修改账户ID将影响进行中的任务");}
      });
      acRender();
    })();

    /* ===================== 推广配置子Tab（账户映射/任务调度）===================== */
    (function(){
      document.querySelectorAll("#page-account-config [data-ac-tab]").forEach(btn=>{
        btn.addEventListener("click",()=>{
          document.querySelectorAll("#page-account-config [data-ac-tab]").forEach(b=>b.classList.toggle("active",b===btn));
          document.querySelectorAll("#page-account-config [data-ac-panel]").forEach(p=>p.hidden=p.dataset.acPanel!==btn.dataset.acTab);
        });
      });
      // 账户映射扩展表
      const acExtraData=[
        {product:"除螨仪XM-8",port:"深圳南区 3 口",owner:"翁宇英",type:"独家",time:"07-30 14:20"},
        {product:"空气炸锅AF-60",port:"广州一区 8 口",owner:"林晓婷",type:"非独家",time:"07-29 11:08"},
        {product:"洗地机F-15",port:"杭州二区 5 口",owner:"张文豪",type:"独家",time:"07-30 09:15"},
        {product:"电饭煲IH-40",port:"成都三区 4 口",owner:"李婉清",type:"非独家",time:"07-28 16:42"},
        {product:"挂烫机GT-23",port:"武汉一区 6 口",owner:"赵明轩",type:"独家",time:"07-30 20:18"}
      ];
      const acExtraTbody=document.getElementById("acExtraTbody");
      if(acExtraTbody){
        acExtraTbody.innerHTML=acExtraData.map(r=>`<tr>
          <td><strong>${r.product}</strong></td><td>${r.port}</td><td>${r.owner}</td>
          <td>${r.type}</td>
          <td style="font-size:12px;color:#999cb0;">${r.time}</td>
          <td><button class="ghost-btn" style="font-size:11px;padding:4px 8px;">编辑</button></td>
        </tr>`).join("");
      }
      // 任务调度数据（2个 tbody 都填充）
      const tsTaskData=[
        {task:"素材清理（双轨）",time:"02:00",status:"成功",last:"今日 02:00",result:"清理 247 条低效素材"},
        {task:"商品卡巡检",time:"08:00",status:"成功",last:"今日 08:00",result:"补建 12 个计划"},
        {task:"图文推广巡检",time:"09:00",status:"成功",last:"今日 09:00",result:"更新 8 条素材"},
        {task:"过审分发",time:"全天",status:"运行中",last:"14:25",result:"已分发 32 条"},
        {task:"审核监听",time:"实时",status:"运行中",last:"14:30",result:"监听 18 个计划"},
        {task:"素材库同步",time:"全天",status:"成功",last:"14:00",result:"同步 86 条过审状态"}
      ];
      const tsStrategyData=[
        {scene:"千川 API 限流",strategy:"自动退避重试 3 次（指数退避），失败后切换备用账户"},
        {scene:"抖店接口超时",strategy:"重试 2 次 + 切换备用 IP，仍失败则跳过本轮"},
        {scene:"素材合规审核不通过",strategy:"获取审核结论 → 反馈创作 + 申诉（如可申诉）"},
        {scene:"账户被封禁",strategy:"立即停用该账户所有任务，通知管理员处理"},
        {scene:"NAS 路径不可达",strategy:"切换备用 NAS + 通知 IT，限速降级处理"},
        {scene:"配额超限",strategy:"按优先级重排任务，暂停低优先级任务"},
        {scene:"AI 模型调用失败",strategy:"降级到规则引擎 + 通知 AI 团队"}
      ];
      function renderTs2(){
        const task=document.getElementById("tsTaskTbody2");
        const strat=document.getElementById("tsStrategyTbody2");
        const stMap={"成功":'<span class="badge green">成功</span>',"运行中":'<span class="badge orange">运行中</span>',"失败":'<span class="badge" style="background:#e54d42;color:#fff;">失败</span>'};
        if(task)task.innerHTML=tsTaskData.map(t=>`<tr>
          <td>${t.task}</td><td>${t.time}</td>
          <td>${stMap[t.status]}</td>
          <td style="font-size:12px;color:#999cb0;">${t.last}</td>
          <td style="font-size:12px;">${t.result}</td>
        </tr>`).join("");
        if(strat)strat.innerHTML=tsStrategyData.map(s=>`<tr>
          <td><strong>${s.scene}</strong></td>
          <td style="font-size:13px;">${s.strategy}</td>
        </tr>`).join("");
      }
      renderTs2();
      // 立即执行
      const tsTriggerBtn2=document.getElementById("tsTriggerBtn2");
      if(tsTriggerBtn2)tsTriggerBtn2.addEventListener("click",()=>showToast("已触发全部任务，依次执行中…"));
    })();

    /* ===================== 推广自动化·筛选增强 ===================== */
    (function(){
      /* --- 素材监控·投放账户 --- */
      const mmPF = { product: "all", account: "all", type: "all", search: "" };
      window.mmRenderPlacement = function() {
        const tb = document.getElementById("mmPlacementTbody");
        if (!tb) return;
        let d = mmPlacementData;
        if (mmCurrentAcc !== "all") d = d.filter(r => r.acc === mmCurrentAcc);
        if (mmPF.account !== "all") d = d.filter(r => r.acc === mmPF.account);
        if (mmPF.type !== "all") d = d.filter(r => r.type === mmPF.type);
        if (mmPF.product !== "all") d = d.filter(r => r.shop.includes(mmPF.product));
        if (mmPF.search) d = d.filter(r => r.name.toLowerCase().includes(mmPF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="14" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        tb.innerHTML = d.map(r => `<tr>
          <td><input type="checkbox" class="mm-check" data-id="${r.id}"></td>
          <td class="name-link">${r.name}</td>
          <td>${r.type}</td><td>${r.shop}</td><td>${r.plan}</td><td>${r.upload}</td>
          <td>0</td><td>0</td><td>0</td><td>0.00%</td><td>—</td>
          <td class="acc-link">${r.acc}</td>
          <td><span class="badge orange">⚠ 低效</span></td>
          <td><button class="soft-btn mm-del" data-id="${r.id}">删除</button></td>
        </tr>`).join("");
      };
      const el = id => document.getElementById(id);
      const mmPF_el = el("mmProductFilter");
      if (mmPF_el) mmPF_el.addEventListener("change", e => { mmPF.product = e.target.value === "全部产品" ? "all" : e.target.value; mmRenderPlacement(); });
      const mmAF_el = el("mmAccountFilter");
      if (mmAF_el) mmAF_el.addEventListener("change", e => { mmPF.account = e.target.value === "全部账户" ? "all" : e.target.value; mmRenderPlacement(); });
      const mmTF_el = el("mmTypeFilter");
      if (mmTF_el) mmTF_el.addEventListener("change", e => { mmPF.type = e.target.value === "全部类型" ? "all" : e.target.value; mmRenderPlacement(); });
      const mmS_el = el("mmSearch");
      if (mmS_el) mmS_el.addEventListener("input", e => { mmPF.search = e.target.value.toLowerCase().trim(); mmRenderPlacement(); });

      /* --- 素材监控·过审账户 --- */
      const mmRF = { product: "all", account: "all", status: "all" };
      window.mmRenderReview = function() {
        const tb = document.getElementById("mmReviewTbody");
        if (!tb) return;
        let d = mmReviewData;
        if (mmCurrentAcc !== "all") d = d.filter(r => r.acc === mmCurrentAcc);
        if (mmRF.account !== "all") d = d.filter(r => r.acc === mmRF.account);
        if (mmRF.product !== "all") d = d.filter(r => r.shop.includes(mmRF.product));
        if (mmRF.status !== "all") d = d.filter(r => (r.audit === "passed" ? "已通过" : "复审不通过") === mmRF.status);
        if (!d.length) { tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        tb.innerHTML = d.map(r => {
          const tag = r.audit === "passed" ? '<span class="badge green">✅ 已通过</span>' : '<span class="badge red">❌ 复审不通过</span>';
          return `<tr>
          <td><input type="checkbox" class="mm-rcheck" data-id="${r.id}"></td>
          <td class="name-link">${r.name}</td><td>${r.shop}</td><td class="acc-link">${r.acc}</td>
          <td>${r.submit}</td><td>${r.dur}</td><td>${tag}</td><td>${r.reason}</td>
          <td><button class="soft-btn mm-rclean" data-id="${r.id}">清理</button></td>
        </tr>`;
        }).join("");
      };
      const mmRPF_el = el("mmReviewProductFilter");
      if (mmRPF_el) mmRPF_el.addEventListener("change", e => { mmRF.product = e.target.value === "全部产品" ? "all" : e.target.value; mmRenderReview(); });
      const mmRAF_el = el("mmReviewAccountFilter");
      if (mmRAF_el) mmRAF_el.addEventListener("change", e => { mmRF.account = e.target.value === "全部过审账户" ? "all" : e.target.value; mmRenderReview(); });
      const mmRSF_el = el("mmReviewStatusFilter");
      if (mmRSF_el) mmRSF_el.addEventListener("change", e => { mmRF.status = e.target.value === "全部状态" ? "all" : e.target.value; mmRenderReview(); });

      /* --- 过审分发 --- */
      const rdF = { product: "all", status: "all", search: "" };
      function rdGetStatus(r) {
        if (r.audit === "rejected" || r.dist === "appealing") return "申诉中";
        if (r.dist === "done") return "已分发";
        if (r.dist === "distributing") return "已通过";
        if (r.audit === "passed") return "已通过";
        if (r.audit === "reviewing") return "审核中";
        return "待上传";
      }
      window.rdRender = function() {
        const tb = document.getElementById("rdTbody");
        if (!tb) return;
        let d = rdData;
        if (rdCurrentAcc !== "all") d = d.filter(r => r.acc === rdCurrentAcc);
        if (rdF.product !== "all") d = d.filter(r => r.prod === rdF.product);
        if (rdF.status !== "all") d = d.filter(r => rdGetStatus(r) === rdF.status);
        if (rdF.search) d = d.filter(r => r.name.toLowerCase().includes(rdF.search) || r.uploader.toLowerCase().includes(rdF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        const auditMap = {reviewing:'<span class="badge orange">⏳ 审核中</span>',passed:'<span class="badge green">✅ 已通过</span>',rejected:'<span class="badge red">❌ 不通过</span>'};
        const distMap = {"—":"—",distributing:'<span class="badge" style="color:#4647c8;background:#eeefff;">🔄 分发中</span>',done:'<span class="badge green">✅ 已分发</span>',appealing:'<span class="badge orange">📍 待申诉</span>'};
        tb.innerHTML = d.map(r => `<tr>
          <td class="name-link">${r.name}</td><td>${r.prod}</td><td>${r.shop}</td><td>${r.dur}</td><td>${r.uploader}</td>
          <td class="acc-link">${r.acc}</td>
          <td><span class="badge" style="color:#4647c8;background:#eeefff;font-size:11px;">${r.plan}</span></td>
          <td>${auditMap[r.audit]}</td><td>${distMap[r.dist]}</td>
          <td style="font-size:11px;color:var(--muted);">${r.distTo}</td>
          <td>${r.audit==="rejected"?'<button class="soft-btn rd-conclusion" data-id="'+r.id+'">查看审核结论</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
        </tr>`).join("");
      };
      const rdPF_el = el("rdProductFilter");
      if (rdPF_el) rdPF_el.addEventListener("change", e => { rdF.product = e.target.value === "全部产品" ? "all" : e.target.value; rdRender(); });
      const rdSF_el = el("rdStatusFilter");
      if (rdSF_el) rdSF_el.addEventListener("change", e => { rdF.status = e.target.value === "全部状态" ? "all" : e.target.value; rdRender(); });
      const rdS_el = el("rdSearch");
      if (rdS_el) rdS_el.addEventListener("input", e => { rdF.search = e.target.value.toLowerCase().trim(); rdRender(); });

      /* --- 商品卡推广 --- */
      const pcF = { status: "all", shop: "all", search: "" };
      const pcStMap = { active: "正常投放", paused: "已暂停", new: "今日新建" };
      window.pcRender = function() {
        const tb = document.getElementById("pcTbody");
        if (!tb) return;
        let d = pcData;
        if (pcCurrentAcc !== "all") d = d.filter(r => r.acc === pcCurrentAcc);
        if (pcF.status !== "all") d = d.filter(r => pcStMap[r.st] === pcF.status);
        if (pcF.shop !== "all") d = d.filter(r => r.shop === pcF.shop);
        if (pcF.search) d = d.filter(r => r.name.toLowerCase().includes(pcF.search) || r.link.toLowerCase().includes(pcF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="15" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        const stMap = {active:'<span class="badge green">✅ 正常投放</span>',paused:'<span class="badge orange">⏸ 已暂停</span>',new:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 今日新建</span>'};
        tb.innerHTML = d.map(r => `<tr>
          <td class="name-link">${r.name}</td><td>${r.link}</td><td>${r.shop}</td><td>${r.shopId}</td>
          <td>${r.plan}</td><td>${stMap[r.st]}</td>
          <td>${r.imp||"—"}</td><td>${r.click||"—"}</td><td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td>
          <td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.ctr?r.ctr.toFixed(2)+"%":"—"}</td><td>${r.cpa}</td>
          <td style="color:${r.reason!=='—'?'#b56b1a':'var(--muted)'};">${r.reason}</td>
          <td><button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button></td>
        </tr>`).join("");
        const ll = document.getElementById("pcLogList");
        if (ll) ll.innerHTML = pcLogs.map(l => `<div class="log-entry"><span class="ltime">${l.t}</span><span class="ltext">${l.text}</span></div>`).join("");
      };
      const pcSF_el = el("pcStatusFilter");
      if (pcSF_el) pcSF_el.addEventListener("change", e => { pcF.status = e.target.value === "全部状态" ? "all" : e.target.value; pcRender(); });
      const pcSF2_el = el("pcShopFilter");
      if (pcSF2_el) pcSF2_el.addEventListener("change", e => { pcF.shop = e.target.value === "全部店铺" ? "all" : e.target.value; pcRender(); });
      const pcS_el = el("pcSearch");
      if (pcS_el) pcS_el.addEventListener("input", e => { pcF.search = e.target.value.toLowerCase().trim(); pcRender(); });

      /* --- 图文推广 --- */
      const cpF = { product: "all", status: "all", search: "" };
      const cpStMap = { active: "正常", paused: "暂停", pending: "待填充" };
      window.cpRender = function() {
        const tb = document.getElementById("cpTbody");
        if (!tb) return;
        let d = cpData;
        if (cpCurrentAcc !== "all") d = d.filter(r => r.adAcc === cpCurrentAcc);
        if (cpF.product !== "all") d = d.filter(r => r.prod.includes(cpF.product));
        if (cpF.status !== "all") d = d.filter(r => cpStMap[r.st] === cpF.status);
        if (cpF.search) d = d.filter(r => r.prod.toLowerCase().includes(cpF.search) || r.acct.toLowerCase().includes(cpF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        const stMap = {active:'<span class="badge green">✅ 正常</span>',paused:'<span class="badge orange">⏸ 暂停</span>',pending:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 待填充</span>'};
        tb.innerHTML = d.map(r => `<tr>
          <td class="name-link">${r.prod}</td><td>${r.acct}</td><td class="acc-link">${r.adAcc}</td><td>${r.plan}</td>
          <td>${stMap[r.st]}</td><td>${r.videos}</td>
          <td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td><td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.interact?r.interact.toFixed(1)+"%":"—"}</td>
          <td>${r.person}</td><td>${r.update}</td>
          <td>${r.st==="pending"?'<button class="soft-btn cp-fill" data-id="'+r.id+'">填充视频</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
        </tr>`).join("");
      };
      const cpPF_el = el("cpProductFilter");
      if (cpPF_el) cpPF_el.addEventListener("change", e => { cpF.product = e.target.value === "全部产品" ? "all" : e.target.value; cpRender(); });
      const cpSF_el = el("cpStatusFilter");
      if (cpSF_el) cpSF_el.addEventListener("change", e => { cpF.status = e.target.value === "全部状态" ? "all" : e.target.value; cpRender(); });
      const cpS_el = el("cpSearch");
      if (cpS_el) cpS_el.addEventListener("input", e => { cpF.search = e.target.value.toLowerCase().trim(); cpRender(); });

      /* 重新渲染所有表格（应用覆盖后的函数） */
      mmRenderPlacement();
      mmRenderReview();
      rdRender();
      pcRender();
      cpRender();
    })();
