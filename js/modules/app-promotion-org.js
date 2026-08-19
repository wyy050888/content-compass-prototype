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


    // merged: 模板库页签切换
    document.querySelectorAll("[data-lib-tab]").forEach(button => button.addEventListener("click", () => {
      const scope = button.closest("#page-template-library");
      if (!scope) return;
      scope.querySelectorAll("[data-lib-tab]").forEach(item => item.classList.toggle("active", item === button));
      scope.querySelectorAll("[data-lib-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.libPanel === button.dataset.libTab));
    }));

    /* ── 爆款内容结构：千川学习 / 自建结构、详情与 Agent 调用 ── */
    const copyStructureTbody = document.getElementById("copyStructureTbody");
    const copyStructureEmpty = document.getElementById("copyStructureEmpty");
    const copyStructureDetailModal = document.getElementById("copyStructureDetailModal");
    const copyStructureEditorModal = document.getElementById("copyStructureEditorModal");
    let activeCopyStructureId = "";
    let editingCopyStructureId = "";

    function copyStructureLevelLabel(level) { return level === "product" ? "产品级结构" : "通用结构"; }
    function copyStructureNow() { return new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-"); }
    function renderCopyStructureTagFilter() {
      const select = document.getElementById("copyStructureTagFilter");
      if (!select) return;
      const current = select.value || "all";
      select.value = ["general","product"].includes(current) ? current : "all";
    }
    function renderCopyStructureLibrary() {
      if (!copyStructureTbody) return;
      const keyword = document.getElementById("copyStructureSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("copyStructureSourceFilter")?.value || "all";
      const tag = document.getElementById("copyStructureTagFilter")?.value || "all";
      const rows = copyStructureCatalog.filter(item => {
        const haystack = `${item.name} ${item.formula} ${item.products.join(" ")}`.toLowerCase();
        return (!keyword || haystack.includes(keyword)) && (source === "all" || item.source === source) && (tag === "all" || item.level === tag);
      });
      copyStructureTbody.innerHTML = rows.map(item => `<tr data-copy-structure-row="${item.id}">
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td class="copy-structure-formula">${escapeHtml(item.formula)}</td>
        <td><span class="copy-source-tag ${item.source}">${copyStructureSourceLabel(item.source)}</span></td>
        <td><span class="copy-structure-tag-pill">${copyStructureLevelLabel(item.level)}</span></td>
        <td>${escapeHtml(item.products.join("、") || "通用")}</td>
        <td>${escapeHtml(item.updated)}</td>
        <td><div class="copy-structure-row-actions"><button class="copy-row-action" type="button" data-copy-structure-view="${item.id}">查看详情</button>${item.source === "custom" ? `<button class="copy-row-action primary" type="button" data-copy-structure-edit="${item.id}">编辑</button><button class="copy-row-action" type="button" data-copy-structure-copy="${item.id}">复制</button><button class="copy-row-action danger" type="button" data-copy-structure-delete="${item.id}">删除</button>` : `<button class="copy-row-action primary" type="button" data-copy-structure-copy="${item.id}">复制为自建</button>`}</div></td>
      </tr>`).join("");
      copyStructureEmpty.hidden = rows.length > 0;
    }

    function renderCopyStructureRelated(item, keyword = "") {
      const list = document.getElementById("copyStructureRelatedList");
      if (!list) return;
      const normalized = keyword.trim().toLowerCase();
      const ranked = [...(item.related || [])].sort((a,b) => (b.spend || 0) - (a.spend || 0)).slice(0,20);
      const related = ranked.filter(record => !normalized || `${record.video} ${record.product} ${record.id} ${record.copy}`.toLowerCase().includes(normalized));
      document.getElementById("copyStructureRelatedCount").textContent = `展示 ${related.length} 条`;
      list.innerHTML = related.length ? related.map(record => `<article class="copy-related-item" data-related-copy="${record.id}">
        <button class="copy-related-video" type="button" data-play-related-video="${record.id}" aria-label="播放${escapeHtml(record.video)}"><span>${escapeHtml(record.video)}</span></button>
        <div class="copy-related-copy"><div class="copy-related-copy-head"><div><strong>${escapeHtml(record.video)}</strong><small style="display:block;margin-top:3px;">${escapeHtml(record.product)} · 素材 ID ${escapeHtml(record.id)}</small></div><span class="copy-related-spend">消耗 ¥${Number(record.spend || 0).toLocaleString("zh-CN")}</span></div><p>${escapeHtml(record.copy)}</p><div class="copy-related-actions"><button class="ghost-btn" type="button" data-expand-related-copy>展开全文</button><button class="ghost-btn" type="button" data-copy-related-text>复制文案</button><button class="ghost-btn" type="button" data-play-related-video="${record.id}">播放视频</button></div></div>
      </article>`).join("") : `<div class="copy-structure-empty">${item.source === "custom" ? "自建结构暂未关联千川文案" : "没有符合搜索条件的关联文案"}</div>`;
    }

    const copyStructureInsightCatalog = {
      "cs-qc-result": {
        why:"用强结果画面先建立注意力，再解释隐性痛点，通过完整操作和可视化结果证明产品价值，适合效果能够直接展示的清洁产品。",
        evidence:"近30天同结构素材消耗靠前；2条高消耗成品均在前3秒展示清洁结果。",
        scope:"适合：效果可视化、已有结果特写和完整操作素材；不适合：结果无法被画面直接证明的产品。",
        stages:[
          {name:"结果型视觉钩子",time:"0–3s",purpose:"先给结果，快速建立好奇与观看理由",original:"透明尘杯脏污特写，随后硬切床垫表面。",talk:"先别听我讲参数，直接看{product}走完一遍后的{visible_result}。",slots:["product · 产品名","visible_result · 可视化结果"],material:"结果特写、前后对比或反常画面；至少1个近景镜头。",edit:"1–2个短镜头；优先硬切；单镜头1–2秒。"},
          {name:"隐性痛点放大",time:"3–12s",purpose:"解释为什么表面正常仍需要解决",original:"床单看似干净，但纤维深处仍可能藏有毛发碎屑。",talk:"你以为{surface_state}就够了，其实{hidden_problem}并没有解决。",slots:["surface_state · 表面状态","hidden_problem · 隐性问题"],material:"问题部位特写、目标人群生活场景。",edit:"画面跟随信息点切换；无需完整动作。"},
          {name:"产品能力演示",time:"12–34s",purpose:"用实际操作承接解决方案，而不是只讲参数",original:"展示拍打头推进、拍打与吸尘同步工作的连续过程。",talk:"{product}通过{core_action}，把{problem_object}直接带出来。",slots:["core_action · 核心动作","problem_object · 问题对象"],material:"产品露出、关键动作和使用过程；动作镜头需连续清晰。",edit:"保留完整动作；素材偏短时可轻微减速或补充同义镜头。"},
          {name:"结果与场景证明",time:"34–52s",purpose:"通过结果及多场景证明产品不是单点有效",original:"尘杯结果、床垫和沙发布艺场景连续展示。",talk:"{scene_1}、{scene_2}都能用，清洁结果可以直接看见。",slots:["scene_1 · 核心场景","scene_2 · 扩展场景"],material:"结果回看、两个以上使用场景。",edit:"结果镜头优先；多场景之间直接硬切。"},
          {name:"行动引导",time:"52–60s",purpose:"收束价值并给出明确下一步",original:"产品定帧收口，引导查看完整实测。",talk:"想看{proof_content}，点击商品了解更多。",slots:["proof_content · 可验证内容"],material:"产品稳定展示或操作完成画面。",edit:"结尾保持稳定；素材不足可短时定帧。"}
        ]
      },
      "cs-qc-scene": {
        why:"先用高频生活场景建立代入，再用产品操作和结果证明降低理解成本，最后承接优惠或行动信息。",
        evidence:"参考成品在前5秒完成人群场景和问题交代，核心功能均有实拍画面承接。",
        scope:"适合：使用场景明确、操作流程可展示的产品；不适合：缺少真实使用过程素材。",
        stages:[
          {name:"场景代入",time:"0–5s",purpose:"让目标人群快速确认与自己有关",original:"下班回家，不想长时间守在厨房。",talk:"{audience_scene}，又不想{pain_action}？",slots:["audience_scene · 人群场景","pain_action · 麻烦行为"],material:"人物或环境全景、问题状态。",edit:"先场景后痛点，2个镜头内完成。"},
          {name:"问题呈现",time:"5–12s",purpose:"把时间、操作或清洁成本具体化",original:"反复开盖、等待和清洁油污。",talk:"每次都要{old_process}，真正麻烦的是{cost}。",slots:["old_process · 原处理流程","cost · 时间或操作成本"],material:"旧方式、等待或问题细节。",edit:"按问题信息点硬切。"},
          {name:"功能证明",time:"12–43s",purpose:"用完整使用过程说明产品如何解决问题",original:"放入食材、观察上色、出锅并展示结果。",talk:"把{object}放进去，通过{feature}完成{result}。",slots:["feature · 核心功能","result · 结果"],material:"产品登场、完整操作、结果特写。",edit:"关键操作不可截断；允许轻微加速。"},
          {name:"使用便利",time:"43–52s",purpose:"补充降低使用门槛的次要卖点",original:"炸篮拆下清洗。",talk:"用完后{easy_action}，日常处理更方便。",slots:["easy_action · 便利动作"],material:"拆卸、清洗或收纳过程。",edit:"1–2个连续动作镜头。"},
          {name:"行动收口",time:"52–60s",purpose:"给出优惠或查看商品的明确动作",original:"成品展示并引导进入商品。",talk:"想看更多{scene_result}，点击商品查看。",slots:["scene_result · 场景结果"],material:"成品、产品或稳定场景。",edit:"稳定画面收尾，可短时定帧。"}
        ]
      },
      "cs-qc-audience": {
        why:"先点名人群缩短理解路径，再逐层展开需求与产品能力，适合人群差异明显的产品。", evidence:"参考成品的人群信息前置，核心卖点与清洁操作一一对应。", scope:"适合：人群痛点明确且素材有人群场景；不适合：需要广泛覆盖但无法区分人群的产品。",
        stages:[
          {name:"人群点名",time:"0–4s",purpose:"明确视频在对谁说",original:"家里有孩子又有宠物的家庭。",talk:"{target_audience}，日常最怕{core_pain}。",slots:["target_audience · 目标人群","core_pain · 核心痛点"],material:"人群生活场景或典型问题。",edit:"前4秒完成人群和痛点交代。"},
          {name:"需求唤醒",time:"4–13s",purpose:"把抽象需求变成具体麻烦",original:"干湿垃圾需要分开处理。",talk:"每次{old_process}，不仅{cost_1}，还要{cost_2}。",slots:["old_process · 旧流程","cost_1 · 成本一","cost_2 · 成本二"],material:"问题过程和细节特写。",edit:"按成本点切换镜头。"},
          {name:"卖点展开",time:"13–48s",purpose:"逐项展示能力如何对应需求",original:"吸、拖、洗一次推进完成，并展示滚刷自清洁。",talk:"{product}把{ability_list}放进一次操作里。",slots:["ability_list · 能力组合"],material:"每个卖点至少匹配一个动作镜头。",edit:"卖点与画面一一对齐；关键动作保留完整。"},
          {name:"产品推荐",time:"48–60s",purpose:"总结适用理由并引导下一步",original:"缩短清洁链路，查看完整演示。",talk:"如果你想{desired_result}，可以先看它的完整演示。",slots:["desired_result · 目标结果"],material:"结果、产品和稳定收口画面。",edit:"先结果再产品，结尾可定帧。"}
        ]
      },
      "cs-custom-contrast": {
        why:"用反差制造认知落差，再通过完整实测消除怀疑，适合具备明显前后变化的产品。", evidence:"从参考视频提炼，用于复用内容路径、素材匹配要求和剪辑建议。", scope:"适合：前后差异明显、具有实测素材；不适合：只能依赖口头宣称的产品。",
        stages:[
          {name:"反差开场",time:"0–4s",purpose:"用预期与真实结果的差异抓住注意力",original:"先展示看似正常的状态，再切到异常结果。",talk:"你以为{expected_state}，实际{unexpected_result}。",slots:["expected_state · 原有认知","unexpected_result · 反差结果"],material:"同一对象的前后状态或反常结果。",edit:"2个镜头直接硬切。"},
          {name:"过程实测",time:"4–34s",purpose:"证明结果来自真实操作",original:"完整展示产品从开始到完成的操作过程。",talk:"不讲参数，直接看{product}怎么完成{task}。",slots:["task · 核心任务"],material:"连续、清晰、可验证的完整动作。",edit:"动作不可截断；冗余部分可加速。"},
          {name:"结果证明",time:"34–50s",purpose:"回看结果并给出判断依据",original:"结果特写与前画面对照。",talk:"前后差别就在{proof_point}。",slots:["proof_point · 证明点"],material:"结果特写、前后对比。",edit:"结果镜头至少保留2秒。"},
          {name:"行动引导",time:"50–60s",purpose:"引导查看详情或完成购买动作",original:"产品稳定露出并引导查看。",talk:"想看完整实测，点击商品了解更多。",slots:[],material:"产品定帧或完成画面。",edit:"稳定收口，可短时定帧。"}
        ]
      }
    };

    function renderCopyStructureStages(item) {
      const insight = copyStructureInsightCatalog[item.id] || copyStructureInsightCatalog["cs-custom-contrast"];
      const formula = document.getElementById("copyStructureFormulaCard");
      formula.innerHTML = `<div class="copy-formula-overview"><small>公式一览</small><div>${item.formula.split("→").map((part,index) => `${index ? "<i>→</i>" : ""}<b>${escapeHtml(part.trim())}</b>`).join("")}</div></div><div class="copy-effective-reason"><span>效</span><div><strong>为什么这个结构有效</strong><p>${escapeHtml(insight.why)}</p><small>${escapeHtml(insight.evidence)}</small></div></div><div class="copy-structure-scope"><b>复用边界</b><span>${escapeHtml(insight.scope)}</span></div>`;
      document.getElementById("copyStructureStageList").innerHTML = insight.stages.map((stage,index) => `<article class="copy-stage-card${index === 0 ? " expanded" : ""}" data-copy-stage-card><button class="copy-stage-head" type="button" data-copy-stage-toggle><i>${index + 1}</i><span><b>${escapeHtml(stage.name)}</b><small>${escapeHtml(stage.purpose)}</small></span><em>${escapeHtml(stage.time)}</em><u>⌄</u></button><div class="copy-stage-body"><div class="copy-stage-source"><b>原片表达</b><p>${escapeHtml(stage.original)}</p><button type="button" data-copy-jump-source="${index}">▶ 跳到原视频 ${escapeHtml(stage.time)}</button></div><div class="copy-stage-talk"><div><b>可复用话术</b><button type="button" data-copy-stage-copy>复制话术</button></div><p>${escapeHtml(stage.talk)}</p>${stage.slots.length ? `<div>${stage.slots.map(slot => `<span>${escapeHtml(slot)}</span>`).join("")}</div>` : ""}</div><div class="copy-stage-execution"><section><b>素材匹配要求</b><p>${escapeHtml(stage.material)}</p></section><section><b>剪辑建议</b><p>${escapeHtml(stage.edit)}</p></section></div></div></article>`).join("");
    }

    function openCopyStructureDetail(id) {
      const item = copyStructureCatalog.find(structure => structure.id === id);
      if (!item) return;
      activeCopyStructureId = id;
      document.getElementById("copyStructureDetailTitle").textContent = item.name;
      const badge = document.getElementById("copyStructureDetailSource");
      badge.textContent = copyStructureSourceLabel(item.source);
      badge.className = `badge copy-source-tag ${item.source}`;
      document.getElementById("copyStructureDetailSummary").innerHTML = `<div><small>结构名称</small><strong>${escapeHtml(item.name)}</strong></div><div><small>结构公式</small><strong>${escapeHtml(item.formula)}</strong></div><div><small>结构标签</small><span class="copy-structure-tag-pill">${copyStructureLevelLabel(item.level)}</span></div><div><small>关联产品</small><strong>${escapeHtml(item.products.join("、") || "通用")}</strong></div>`;
      renderCopyStructureStages(item);
      document.getElementById("copyStructureReferenceTabCount").textContent = String(item.related?.length || 0);
      copyStructureDetailModal.querySelectorAll("[data-copy-detail-tab]").forEach(tab => tab.classList.toggle("active", tab.dataset.copyDetailTab === "stages"));
      copyStructureDetailModal.querySelectorAll("[data-copy-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.copyDetailPanel === "stages"));
      const search = document.getElementById("copyStructureRelatedSearch");
      search.value = "";
      renderCopyStructureRelated(item);
      const clone = document.getElementById("copyStructureCloneFromDetail");
      clone.textContent = item.source === "qianchuan" ? "复制为自建" : "复制结构";
      copyStructureDetailModal.classList.add("show");
    }

    function setCopyStructureLevel(level) {
      const normalized = level === "product" ? "product" : "general";
      document.getElementById("copyStructureLevelInput").value = normalized;
      copyStructureEditorModal.querySelectorAll("[data-copy-level]").forEach(button => button.classList.toggle("active", button.dataset.copyLevel === normalized));
      const productInput = document.getElementById("copyStructureProductInput");
      productInput.disabled = normalized === "general";
      if (normalized === "general") productInput.value = "";
    }

    function openCopyStructureEditor(id = "", clone = false) {
      const source = copyStructureCatalog.find(item => item.id === id);
      editingCopyStructureId = clone ? "" : (source?.source === "custom" ? id : "");
      document.getElementById("copyStructureEditorTitle").textContent = editingCopyStructureId ? "编辑爆款内容结构" : (source ? "复制为自建结构" : "新建爆款内容结构");
      document.getElementById("copyStructureNameInput").value = source ? `${source.name}${clone ? "（副本）" : ""}` : "";
      document.getElementById("copyStructureFormulaInput").value = source?.formula || "";
      const productInput = document.getElementById("copyStructureProductInput");
      productInput.value = source?.products?.[0] || "";
      setCopyStructureLevel(source?.level || "general");
      if ((source?.level || "general") === "product") productInput.value = source?.products?.[0] || "";
      copyStructureEditorModal.classList.add("show");
    }

    document.getElementById("copyStructureSearch")?.addEventListener("input", renderCopyStructureLibrary);
    document.getElementById("copyStructureSourceFilter")?.addEventListener("change", renderCopyStructureLibrary);
    document.getElementById("copyStructureTagFilter")?.addEventListener("change", renderCopyStructureLibrary);
    document.getElementById("createCopyStructure")?.addEventListener("click", () => openCopyStructureEditor());
    document.getElementById("copyStructureRelatedSearch")?.addEventListener("input", event => {
      const item = copyStructureCatalog.find(structure => structure.id === activeCopyStructureId);
      if (item) renderCopyStructureRelated(item, event.target.value);
    });
    copyStructureEditorModal?.addEventListener("click", event => {
      const levelButton = event.target.closest("[data-copy-level]");
      if (levelButton) setCopyStructureLevel(levelButton.dataset.copyLevel);
    });
    document.getElementById("saveCopyStructure")?.addEventListener("click", () => {
      const name = document.getElementById("copyStructureNameInput").value.trim();
      const formula = document.getElementById("copyStructureFormulaInput").value.trim();
      const level = document.getElementById("copyStructureLevelInput").value;
      const product = document.getElementById("copyStructureProductInput").value;
      if (!name || !formula) return showToast("请填写结构名称和结构公式");
      if (level === "product" && !product) return showToast("产品级结构需要选择关联产品");
      const existing = copyStructureCatalog.find(item => item.id === editingCopyStructureId);
      const value = { id:existing?.id || `cs-custom-${Date.now()}`, name, formula, source:"custom", status:"生效中", level, products:level === "product" ? [product] : [], updated:copyStructureNow(), related:existing?.related || [] };
      if (existing) Object.assign(existing, value); else copyStructureCatalog.push(value);
      copyStructureEditorModal.classList.remove("show");
      renderCopyStructureTagFilter();
      renderCopyStructureLibrary();
      showToast(existing ? "结构已更新" : "自建结构已创建");
    });
    document.getElementById("copyStructureCloneFromDetail")?.addEventListener("click", () => {
      copyStructureDetailModal.classList.remove("show");
      openCopyStructureEditor(activeCopyStructureId, true);
    });
    document.querySelectorAll("[data-close-copy-structure-detail]").forEach(button => button.addEventListener("click", () => copyStructureDetailModal.classList.remove("show")));
    document.querySelectorAll("[data-close-copy-structure-editor]").forEach(button => button.addEventListener("click", () => copyStructureEditorModal.classList.remove("show")));
    copyStructureDetailModal?.addEventListener("click", event => { if (event.target === copyStructureDetailModal) copyStructureDetailModal.classList.remove("show"); });
    copyStructureEditorModal?.addEventListener("click", event => { if (event.target === copyStructureEditorModal) copyStructureEditorModal.classList.remove("show"); });
    copyStructureTbody?.addEventListener("click", event => {
      const view = event.target.closest("[data-copy-structure-view]");
      const edit = event.target.closest("[data-copy-structure-edit]");
      const copy = event.target.closest("[data-copy-structure-copy]");
      const remove = event.target.closest("[data-copy-structure-delete]");
      if (view) return openCopyStructureDetail(view.dataset.copyStructureView);
      if (edit) return openCopyStructureEditor(edit.dataset.copyStructureEdit);
      if (copy) return openCopyStructureEditor(copy.dataset.copyStructureCopy, true);
      if (remove) {
        const item = copyStructureCatalog.find(structure => structure.id === remove.dataset.copyStructureDelete);
        if (item && confirm(`确认删除自建结构“${item.name}”吗？`)) {
          copyStructureCatalog.splice(copyStructureCatalog.indexOf(item), 1);
          renderCopyStructureTagFilter();
          renderCopyStructureLibrary();
          showToast("自建结构已删除");
        }
      }
    });
    document.getElementById("copyStructureRelatedList")?.addEventListener("click", event => {
      const card = event.target.closest("[data-related-copy]");
      if (!card) return;
      if (event.target.closest("[data-play-related-video]")) return showToast(`正在播放素材 ${card.dataset.relatedCopy}`);
      if (event.target.closest("[data-expand-related-copy]")) {
        card.classList.toggle("expanded");
        event.target.textContent = card.classList.contains("expanded") ? "收起全文" : "展开全文";
      }
      if (event.target.closest("[data-copy-related-text]")) {
        navigator.clipboard?.writeText(card.querySelector("p")?.textContent || "");
        showToast("文案已复制");
      }
    });
    renderCopyStructureTagFilter();
    renderCopyStructureLibrary();

    /* ── 人群画像模板：增删改查、编辑记录与 Agent 调用 ── */
    const personaCatalog = [
      { id:"persona-mom", name:"精致妈妈—母婴清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"女性", age:"24–30", pain:["孩子接触床褥后容易敏感不适","床单刚换仍担心深层毛发碎屑"], scenes:["宝宝家庭的床垫日常清洁","毛绒玩具和布艺沙发清洁"], usage:36, updated:"08-04 15:30" },
      { id:"persona-pet", name:"精致妈妈—养宠清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"不限", age:"31–40", pain:["宠物掉毛进入沙发和床褥缝隙","表面清理后仍有毛发碎屑"], scenes:["宠物活动区日常清洁","换季掉毛期的床褥与沙发清洁"], usage:24, updated:"08-04 11:18" },
      { id:"persona-whitecollar", name:"新锐白领—一人食效率人群", brand:"轻享", category:"厨房电器", product:"轻享空气炸锅 A8", audience:"新锐白领", gender:"不限", age:"24–30", pain:["下班晚，没有时间准备复杂晚餐","做饭后不想处理大量油污"], scenes:["工作日晚间一人食","朋友到家时快速准备小食"], usage:19, updated:"08-03 16:42" },
      { id:"persona-family", name:"资深中产—品质清洁人群", brand:"净界", category:"清洁电器", product:"净界洗地机 S5", audience:"资深中产", gender:"不限", age:"31–40", pain:["全屋清洁步骤多、耗时长","厨房和卫生间的干湿垃圾难一次处理"], scenes:["周末全屋深度清洁","餐后厨房地面即时清洁"], usage:17, updated:"08-02 10:15" },
      { id:"persona-general", name:"家庭日常清洁—通用人群", brand:"", category:"", product:"", audience:"精致妈妈", gender:"不限", age:"24–40", pain:["高频清洁后仍担心遗漏深层脏污","希望减少重复清洁和工具切换"], scenes:["工作日居家快速整理","卧室与客厅等家庭高频区域日常维护"], usage:12, updated:"08-05 10:20" }
    ];
    const personaHistories = {
      "persona-mom":[
        { time:"08-04 15:30", user:"嗡大发", field:"年龄", before:"25–35", after:"24–30" },
        { time:"08-03 17:12", user:"林运营", field:"人群核心痛点", before:"1 条", after:"2 条" }
      ],
      "persona-pet":[{ time:"08-04 11:18", user:"嗡大发", field:"使用场景", before:"1 条", after:"2 条" }],
      "persona-whitecollar":[{ time:"08-03 16:42", user:"林运营", field:"创建画像", before:"—", after:"新锐白领—一人食效率人群" }],
      "persona-family":[{ time:"08-02 10:15", user:"嗡大发", field:"创建画像", before:"—", after:"资深中产—品质清洁人群" }]
    };
    const personaFieldLabels = { name:"画像名称", product:"关联产品", audience:"抖音八大人群", gender:"性别", age:"年龄", pain:"人群核心痛点", scenes:"使用场景" };
    const personaTbody = document.getElementById("personaLibraryTbody");
    const personaEmpty = document.getElementById("personaLibraryEmpty");
    const personaModal = document.getElementById("personaTemplateModal");
    const personaHistoryModal = document.getElementById("personaHistoryModal");
    const personaDeleteModal = document.getElementById("personaDeleteModal");
    let editingPersonaId = "";
    let deletingPersonaId = "";

    function personaNow() {
      return new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
    }
    function personaProducts(persona) {
      if (!persona) return [];
      const product = Array.isArray(persona.linkedProducts) && persona.linkedProducts.length ? persona.linkedProducts[0] : persona.product;
      return product ? [product] : [];
    }
    function personaScope(persona) { return personaProducts(persona).join("、") || "通用"; }
    function personaLines(value) { return Array.isArray(value) ? value : String(value || "").split("\n").map(item => item.trim()).filter(Boolean); }
    function personaText(value) { return personaLines(value).join(" / ") || "—"; }
    function renderPersonaLibrary() {
      if (!personaTbody) return;
      const keyword = document.getElementById("personaLibrarySearch")?.value.trim().toLowerCase() || "";
      const product = document.getElementById("personaLibraryProductFilter")?.value || "all";
      const rows = personaCatalog.filter(persona => {
        const products = personaProducts(persona);
        const haystack = [persona.name, persona.audience, persona.gender, persona.age, ...products, ...persona.pain, ...persona.scenes].join(" ").toLowerCase();
        const inScope = product === "all" || (product === "universal" ? !products.length : (!products.length || products.includes(product)));
        return (!keyword || haystack.includes(keyword)) && inScope;
      });
      personaTbody.innerHTML = rows.map(persona => `<tr data-persona-row="${persona.id}">
        <td class="persona-name-cell"><strong>${escapeHtml(persona.name)}</strong><small>更新于 ${escapeHtml(persona.updated)}</small></td>
        <td><span class="persona-attribute-summary">${escapeHtml(persona.audience)}<br>${escapeHtml(persona.gender)} · ${escapeHtml(persona.age)}岁</span></td>
        <td class="lib-cell-text">${escapeHtml(personaText(persona.pain))}</td>
        <td class="lib-cell-text">${escapeHtml(personaText(persona.scenes))}</td>
        <td><span class="persona-scope-tag">${escapeHtml(personaScope(persona))}</span></td>
        <td>${persona.usage} 次</td>
        <td><div class="persona-row-actions"><button class="lib-link" type="button" data-persona-edit="${persona.id}">编辑</button><button class="lib-link" type="button" data-persona-history="${persona.id}">编辑记录</button><button class="lib-link" type="button" data-persona-copy="${persona.id}">复制</button><button class="lib-link danger" type="button" data-persona-delete="${persona.id}">删除</button></div></td>
      </tr>`).join("");
      if (personaEmpty) personaEmpty.hidden = rows.length > 0;
    }
    function setPersonaChoice(group, value) {
      const row = personaModal?.querySelector(`[data-persona-form-single="${group}"]`);
      if (!row) return;
      row.querySelectorAll(":scope > button").forEach(button => button.classList.toggle("active", button.textContent.trim() === value));
    }
    const personaAiSuggestions = {
      pain: [
        ["日常清洁频率高，但总担心遗漏深层脏污", "看似处理完成后，仍担心反复清洁带来额外负担"],
        ["家庭成员需求不同，清洁方式难以兼顾", "不希望花太多时间，却希望结果足够直观可靠"],
        ["高频使用物品容易积累脏污，表面处理不够安心", "工具切换和后续收纳增加日常家务负担"]
      ],
      scene: [
        ["工作日回家后的快速整理", "周末集中处理家庭高频使用区域"],
        ["家有孩子或宠物的日常清洁", "客厅、卧室等多人共用空间的定期维护"],
        ["换季整理和深度清洁前", "访客到家前的快速处理"]
      ]
    };
    const personaAiSuggestionIndex = { pain:0, scene:0 };
    async function refreshPersonaSuggestion(type, button) {
      const field = document.getElementById(type === "pain" ? "personaFormPain" : "personaFormScenes");
      const groups = personaAiSuggestions[type] || [];
      if (!field || !groups.length || button?.disabled) return;
      if (field.value.trim() && !confirm(`将替换当前${type === "pain" ? "人群核心痛点" : "使用场景"}，是否继续？`)) return;
      const originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = "生成中…";
      await new Promise(resolve => setTimeout(resolve, 420));
      personaAiSuggestionIndex[type] = (personaAiSuggestionIndex[type] + 1) % groups.length;
      field.value = groups[personaAiSuggestionIndex[type]].join("\n");
      button.disabled = false;
      button.textContent = originalLabel;
      showToast("已换一组建议，可继续手动编辑");
    }
    function resetPersonaForm(persona = null) {
      document.getElementById("personaFormName").value = persona?.name || "";
      document.getElementById("personaFormProduct").value = personaProducts(persona)[0] || "";
      document.getElementById("personaFormPain").value = persona?.pain?.join("\n") || "";
      document.getElementById("personaFormScenes").value = persona?.scenes?.join("\n") || "";
      setPersonaChoice("audience", persona?.audience || "精致妈妈");
      setPersonaChoice("gender", persona?.gender || "不限");
      const standardAges = ["18–23", "24–30", "31–40", "41–50", "51+"];
      const age = persona?.age || "24–30";
      const custom = !standardAges.includes(age);
      setPersonaChoice("age", custom ? "自定义" : age);
      const customFields = personaModal?.querySelector("[data-persona-custom-age]");
      if (customFields) customFields.hidden = !custom;
      if (custom) {
        const parts = age.split(/[–-]/);
        document.getElementById("personaFormAgeMin").value = parts[0] || "25";
        document.getElementById("personaFormAgeMax").value = parts[1] || "35";
      }
    }
    function openPersonaModal(id = "") {
      editingPersonaId = id;
      const persona = personaCatalog.find(item => item.id === id) || null;
      document.getElementById("personaTemplateTitle").textContent = persona ? "编辑人群画像" : "新建人群画像";
      resetPersonaForm(persona);
      personaModal?.classList.add("show");
      setTimeout(() => document.getElementById("personaFormName")?.focus(), 50);
    }
    function closePersonaModal() { personaModal?.classList.remove("show"); editingPersonaId = ""; }
    function readPersonaForm() {
      const activeText = group => personaModal?.querySelector(`[data-persona-form-single="${group}"] > button.active`)?.textContent.trim() || "";
      let age = activeText("age");
      if (age === "自定义") age = `${document.getElementById("personaFormAgeMin").value || 18}–${document.getElementById("personaFormAgeMax").value || 35}`;
      const product = document.getElementById("personaFormProduct").value;
      return {
        name:document.getElementById("personaFormName").value.trim(), product, linkedProducts:product ? [product] : [],
        audience:activeText("audience"), gender:activeText("gender"), age,
        pain:personaLines(document.getElementById("personaFormPain").value), scenes:personaLines(document.getElementById("personaFormScenes").value)
      };
    }
    function personaComparable(value) { return Array.isArray(value) ? value.join("；") : String(value || ""); }
    function savePersonaTemplate() {
      const form = readPersonaForm();
      if (!form.name || !form.audience || !form.gender || !form.age) return showToast("请补全标记 * 的人群画像信息");
      if (!form.pain.length && !form.scenes.length) return showToast("请至少填写一条核心痛点或使用场景");
      const ageParts = form.age.split(/[–-]/).map(Number);
      if (ageParts.length === 2 && ageParts[0] > ageParts[1]) return showToast("年龄起始值不能大于结束值");
      const duplicate = personaCatalog.find(item => item.id !== editingPersonaId && item.name === form.name && personaScope(item) === personaScope(form));
      if (duplicate) return showToast("相同适用范围内已存在同名人群画像");
      const time = personaNow();
      if (editingPersonaId) {
        const index = personaCatalog.findIndex(item => item.id === editingPersonaId);
        const previous = personaCatalog[index];
        Object.keys(personaFieldLabels).forEach(key => {
          const before = personaComparable(previous[key]);
          const after = personaComparable(form[key]);
          if (before !== after) (personaHistories[editingPersonaId] ||= []).unshift({ time, user:"嗡大发", field:personaFieldLabels[key], before:before || "—", after:after || "—" });
        });
        const linkedProducts = form.product ? [form.product] : [];
        personaCatalog[index] = { ...previous, ...form, linkedProducts, product:linkedProducts[0] || "", updated:time };
        showToast("人群画像已更新；已在使用的任务仍保留原画像快照");
      } else {
        const id = `persona-${Date.now()}`;
        personaCatalog.unshift({ id, ...form, usage:0, updated:time });
        personaHistories[id] = [{ time, user:"嗡大发", field:"创建画像", before:"—", after:form.name }];
        showToast("人群画像已新增，可在创作中选择");
      }
      closePersonaModal();
      renderPersonaLibrary();
    }
    function openPersonaHistory(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      document.getElementById("personaHistoryTitle").textContent = `“${persona.name}”编辑记录`;
      const history = personaHistories[id] || [];
      document.getElementById("personaHistoryList").innerHTML = history.length ? history.map(item => `<article class="persona-history-item"><div class="persona-history-meta"><span>${escapeHtml(item.time)} · ${escapeHtml(item.user)}</span><span>${escapeHtml(item.field)}</span></div><div class="persona-history-change"><strong>${escapeHtml(item.field)}</strong><span>${escapeHtml(item.before)}</span><i>→</i><span>${escapeHtml(item.after)}</span></div></article>`).join("") : `<div class="persona-library-empty">暂无编辑记录</div>`;
      personaHistoryModal?.classList.add("show");
    }
    function copyPersona(id) {
      const source = personaCatalog.find(item => item.id === id);
      if (!source) return;
      const newId = `persona-${Date.now()}`;
      const time = personaNow();
      const copy = { ...source, id:newId, name:`${source.name}（副本）`, pain:[...source.pain], scenes:[...source.scenes], usage:0, updated:time };
      personaCatalog.unshift(copy);
      personaHistories[newId] = [{ time, user:"嗡大发", field:"复制画像", before:source.name, after:copy.name }];
      renderPersonaLibrary();
      showToast("人群画像已复制，可继续编辑");
    }
    function openPersonaDelete(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      deletingPersonaId = id;
      document.getElementById("personaDeleteTitle").textContent = `删除“${persona.name}”？`;
      const note = personaDeleteModal?.querySelector(".persona-delete-copy");
      if (note) note.textContent = persona.usage ? `该画像已被调用 ${persona.usage} 次。删除后无法继续用于新任务，历史会话和已生成资产仍保留当时使用的人群信息。` : "删除后无法继续用于新任务，历史会话和已生成资产仍保留当时使用的人群信息。";
      personaDeleteModal?.classList.add("show");
    }
    function closePersonaDelete() { personaDeleteModal?.classList.remove("show"); deletingPersonaId = ""; }

    document.getElementById("createPersonaTemplate")?.addEventListener("click", () => openPersonaModal());
    document.getElementById("personaLibrarySearch")?.addEventListener("input", renderPersonaLibrary);
    document.getElementById("personaLibraryProductFilter")?.addEventListener("change", renderPersonaLibrary);
    personaTbody?.addEventListener("click", event => {
      const edit = event.target.closest("[data-persona-edit]");
      const history = event.target.closest("[data-persona-history]");
      const copy = event.target.closest("[data-persona-copy]");
      const remove = event.target.closest("[data-persona-delete]");
      if (edit) openPersonaModal(edit.dataset.personaEdit);
      else if (history) openPersonaHistory(history.dataset.personaHistory);
      else if (copy) copyPersona(copy.dataset.personaCopy);
      else if (remove) openPersonaDelete(remove.dataset.personaDelete);
    });
    personaModal?.addEventListener("click", event => {
      if (event.target === personaModal || event.target.closest("[data-close-persona-modal]")) return closePersonaModal();
      const aiSuggest = event.target.closest("[data-persona-ai-suggest]");
      if (aiSuggest) { refreshPersonaSuggestion(aiSuggest.dataset.personaAiSuggest, aiSuggest); return; }
      const choice = event.target.closest("[data-persona-form-single] > button");
      if (!choice) return;
      const row = choice.parentElement;
      row.querySelectorAll(":scope > button").forEach(button => button.classList.toggle("active", button === choice));
      if (row.dataset.personaFormSingle === "age") {
        const custom = row.querySelector("[data-persona-custom-age]");
        if (custom) custom.hidden = !choice.matches("[data-persona-custom-age-trigger]");
      }
    });
    document.getElementById("savePersonaTemplate")?.addEventListener("click", savePersonaTemplate);
    document.querySelectorAll("[data-close-persona-history]").forEach(button => button.addEventListener("click", () => personaHistoryModal?.classList.remove("show")));
    personaHistoryModal?.addEventListener("click", event => { if (event.target === personaHistoryModal) personaHistoryModal.classList.remove("show"); });
    document.querySelectorAll("[data-close-persona-delete]").forEach(button => button.addEventListener("click", closePersonaDelete));
    personaDeleteModal?.addEventListener("click", event => { if (event.target === personaDeleteModal) closePersonaDelete(); });
    document.getElementById("confirmPersonaDelete")?.addEventListener("click", () => {
      const index = personaCatalog.findIndex(item => item.id === deletingPersonaId);
      if (index < 0) return closePersonaDelete();
      personaCatalog.splice(index, 1);
      delete personaHistories[deletingPersonaId];
      closePersonaDelete();
      renderPersonaLibrary();
      showToast("人群画像已删除，历史会话和生成资产未受影响");
    });

    function personaPickerProductContext() {
      return {
        name:dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || "",
        brand:dynamicForm.querySelector("[data-original-brand]")?.value.trim() || "",
        category:dynamicForm.querySelector("[data-original-category]")?.value.trim() || ""
      };
    }
    function isPersonaRecommended(persona, context) { return Boolean(!personaProducts(persona).length || (context.name && personaProducts(persona).includes(context.name))); }
    window.addEventListener("message", event => {
      const message = event.data || {};
      if (message.type !== "content-compass:persona-product-picker-open") return;
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      const items = Object.entries(productCatalog).map(([id, product]) => ({ id, ...product }));
      const selected = items.find(item => item.name === message.selectedProduct);
      window.CreationProductPicker.open({
        title:"关联产品",
        description:"选择后，该画像仅在这个产品的 AI 创作中展示。",
        items,
        selectedId:selected?.id || "",
        onConfirm(productId, product) {
          event.source?.postMessage({ type:"content-compass:persona-product-picker-selected", productName:product?.name || "" }, "*");
        }
      });
    });
    window.addEventListener("content-compass:persona-catalog-updated", event => {
      const records = Array.isArray(event.detail) ? event.detail : [];
      records.forEach(record => {
        if (!record?.id || !record.name) return;
        const [audience = "", gender = "不限"] = String(record.audience || "").split(" · ");
        const next = {
          id:record.id, name:record.name, audience, gender,
          age:String(record.age || "").replace(/岁$/, ""),
          pain:String(record.pain || "").split("；").filter(Boolean), scenes:String(record.scene || "").split("；").filter(Boolean),
          linkedProducts:Array.isArray(record.linkedProducts) && record.linkedProducts.length ? [record.linkedProducts[0]] : (record.product ? [record.product] : []), usage:Number(record.usage || 0),
          updated:String(record.updated || "").replace(/^嗡大发 · /, "")
        };
        const index = personaCatalog.findIndex(item => item.id === next.id);
        if (index > -1) personaCatalog[index] = { ...personaCatalog[index], ...next };
        else personaCatalog.unshift({ ...next, brand:"", category:"", product:next.linkedProducts[0] || "" });
      });
      renderPersonaLibrary();
    });
    function openPersonaTemplatePicker(picker) {
      if (!window.CreationPersonaPicker) {
        setFormFeedback("人群画像选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const mixRoot = dynamicForm.querySelector(".mix-flow-form");
      const mixProductId = mixRoot?.querySelector("[data-mix-product]")?.value || "";
      const isMix = picker.dataset.personaContext === "mix";
      const context = isMix
        ? { name:mixProductNames[mixProductId] || "", brand:"", category:"" }
        : personaPickerProductContext();
      const items = personaCatalog.map(persona => ({ ...persona, recommended:isPersonaRecommended(persona, context) }));
      if (isMix) {
        const current = String(mixRoot?.querySelector("[data-mix-audience]")?.dataset.personaIds || "").split("|").filter(Boolean);
        const manualValues = String(mixRoot?.querySelector("[data-mix-audience]")?.value || "").split("、").map(value => value.trim()).filter(Boolean)
          .filter(name => !personaCatalog.some(persona => persona.name === name || persona.audience === name));
        window.CreationPersonaPicker.open({
          items,
          productName: context.name,
          multiple: true,
          maxSelected: 3,
          selectedIds: current,
          allowManual: true,
          manualValues,
          onConfirm(personas) {
            const selected = (Array.isArray(personas) ? personas : [personas]).filter(Boolean)
              .filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
            const input = mixRoot?.querySelector("[data-mix-audience]");
            const label = mixRoot?.querySelector("[data-mix-audience-label]");
            const applied = picker.querySelector("[data-persona-applied]");
            const personaNames = selected.map(p => p.name || p.audience);
            if (input) {
              input.value = personaNames.join("、");
              input.dataset.personaId = selected[0]?.id || "";
              input.dataset.personaIds = selected.map(p => p.id).join("|");
            }
            if (label) {
              label.innerHTML = personaNames.length
                ? `<span class="mix-audience-summary"><span class="mix-audience-secondary-list">${personaNames.map(name => `<em>${escapeHtml(name)}</em>`).join("")}</span>${personaNames.length > 1 ? `<em class="mix-audience-more">+${personaNames.length - 1}</em>` : ""}</span>`
                : "请选择人群";
            }
            const selectedLabel = picker.querySelector("[data-persona-selected]");
            if (selectedLabel) selectedLabel.textContent = personaNames.length ? `已选 ${personaNames.length} 个人群画像` : "选择人群画像模板";
            if (applied) {
              applied.hidden = !personaNames.length;
              const span = applied.querySelector("span");
              if (span) span.textContent = personaNames.length ? `已应用：${personaNames.join("、")}` : "";
            }
            picker.dataset.personaId = selected[0]?.id || "";
            picker.dataset.personaIds = selected.map(p => p.id).join("|");
            showToast(`已应用 ${selected.length} 个人群画像`);
          }
        });
        return;
      }
      window.CreationPersonaPicker.open({
        items,
        productName: context.name,
        selectedId: picker.dataset.personaId || "",
        onConfirm(persona) {
          const source = personaCatalog.find(item => item.id === persona?.id);
          if (source) applyPersonaToCurrentForm(picker, source);
        }
      });
    }
    function activatePersonaChoice(row, text) {
      if (!row) return;
      row.querySelectorAll(".choice-chip, .audience-chip, .rewrite-audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === text));
    }
    function applyPersonaAge(persona, rewrite = false) {
      const role = rewrite ? "rewrite-age" : "age";
      const row = dynamicForm.querySelector(`[data-role="${role}"]`);
      if (!row) return;
      const standard = [...row.querySelectorAll(".choice-chip")].find(button => button.textContent.trim() === persona.age);
      const customTrigger = row.querySelector(rewrite ? "[data-rewrite-custom-age-trigger]" : "[data-custom-age-trigger]");
      const choice = standard || customTrigger;
      row.querySelectorAll(".choice-chip").forEach(button => button.classList.toggle("active", button === choice));
      const custom = row.querySelector(rewrite ? "[data-rewrite-custom-age]" : "[data-custom-age]");
      if (custom) custom.hidden = Boolean(standard);
      if (!standard) {
        const parts = persona.age.split(/[–-]/);
        const min = row.querySelector(rewrite ? "[data-rewrite-age-min]" : "[data-age-min]");
        const max = row.querySelector(rewrite ? "[data-rewrite-age-max]" : "[data-age-max]");
        if (min) min.value = parts[0] || "25";
        if (max) max.value = parts[1] || "35";
      }
    }
    function applyPersonaToCurrentForm(picker, persona) {
      if (picker.dataset.personaContext === "mix") {
        const root = dynamicForm.querySelector(".mix-flow-form");
        if (!root) return;
        const input = root.querySelector("[data-mix-audience]");
        if (input) { input.value = persona.name || persona.audience; input.dataset.personaId = persona.id; input.dataset.personaIds = persona.id; }
        renderMixAudienceEditor(root, [persona.name || persona.audience]);
        picker.dataset.personaId = persona.id;
        picker.querySelector("[data-persona-selected]").textContent = persona.name;
        const applied = picker.querySelector("[data-persona-applied]");
        applied.hidden = false;
        applied.querySelector("span").textContent = `已应用：${persona.name} · ${persona.audience} · ${persona.gender} · ${persona.age}岁`;
        return;
      }
      const rewrite = picker.dataset.personaContext === "rewrite";
      if (rewrite) {
        const box = dynamicForm.querySelector("[data-rewrite-audience-box]");
        box?.querySelectorAll(".rewrite-audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === persona.audience));
        activatePersonaChoice(dynamicForm.querySelector('[data-role="rewrite-gender"]'), persona.gender);
      } else {
        const box = dynamicForm.querySelector("[data-audience-box]");
        box?.querySelectorAll(".audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === persona.audience));
        activatePersonaChoice(dynamicForm.querySelector('[data-role="gender"]'), persona.gender);
      }
      applyPersonaAge(persona, rewrite);
      const pain = dynamicForm.querySelector('[data-field="pain"]');
      const scenes = dynamicForm.querySelector('[data-field="scenes"]');
      if (pain) pain.value = persona.pain.join("\n");
      if (scenes) scenes.value = persona.scenes.join("\n");
      if (rewrite) syncRewriteAudienceTarget();
      picker.dataset.personaId = persona.id;
      picker.querySelector("[data-persona-selected]").textContent = persona.name;
      const applied = picker.querySelector("[data-persona-applied]");
      applied.hidden = false;
      applied.querySelector("span").textContent = `已应用：${persona.name} · ${persona.audience} · ${persona.gender} · ${persona.age}岁`;
      creationContext.originalFields.personaTemplateId = persona.id;
      creationContext.originalFields.personaSnapshot = JSON.parse(JSON.stringify(persona));
      persona.usage += 1;
      renderPersonaLibrary();
      showToast("人群画像已回填，可继续修改本次任务字段");
    }
    function clearPersonaPicker(picker, notify = true) {
      delete picker.dataset.personaId;
      picker.querySelector("[data-persona-selected]").textContent = "选择人群画像模板";
      picker.querySelector("[data-persona-applied]").hidden = true;
      creationContext.originalFields.personaTemplateId = "";
      delete creationContext.originalFields.personaSnapshot;
      if (notify) showToast("已切换为自行输入，当前人群字段内容已保留");
    }
    function setPersonaPickerMode(picker, mode, notify = true) {
      const templateMode = mode === "template";
      picker.dataset.personaMode = mode;
      picker.querySelectorAll("[data-persona-source-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaSourceMode === mode));
      const templateSelect = picker.querySelector("[data-persona-template-select]");
      if (templateSelect) templateSelect.hidden = !templateMode;
      if (!templateMode) {
        window.CreationPersonaPicker?.close();
        clearPersonaPicker(picker, notify);
      } else if (notify) {
        showToast("请从模板库选择人群画像，选择后将回填本次任务字段");
      }
    }
    dynamicForm.addEventListener("click", event => {
      const sourceMode = event.target.closest("[data-persona-source-mode]");
      if (sourceMode) {
        const picker = sourceMode.closest("[data-persona-picker]");
        if (picker.dataset.personaMode !== sourceMode.dataset.personaSourceMode) setPersonaPickerMode(picker, sourceMode.dataset.personaSourceMode);
        return;
      }
      const trigger = event.target.closest("[data-persona-trigger]");
      if (trigger) {
        const picker = trigger.closest("[data-persona-picker]");
        openPersonaTemplatePicker(picker);
        return;
      }
      const clear = event.target.closest("[data-persona-clear]");
      if (clear) {
        const picker = clear.closest("[data-persona-picker]");
        if (picker) {
          setPersonaPickerMode(picker, "manual");
        } else {
          const field = clear.closest("[data-mix-audience-field]");
          const root = field ? dynamicForm.querySelector(".mix-flow-form") : null;
          if (field && root) {
            const input = field.querySelector("[data-mix-audience]");
            const placeholder = field.querySelector("[data-mix-audience-placeholder]");
            const chips = field.querySelector("[data-mix-audience-chips]");
            const trigger = field.querySelector("[data-mix-pick-audience]");
            if (input) { input.value = ""; delete input.dataset.personaId; delete input.dataset.personaIds; }
            if (placeholder) placeholder.hidden = false;
            if (chips) { chips.hidden = true; chips.innerHTML = ""; }
            if (clear) clear.hidden = true;
            trigger?.classList.remove("is-filled");
          }
        }
      }
    });
    renderPersonaLibrary();

    // ── 文案库 ──
    const clData = [
      { id:"cl1", text:"99块钱！苏泊尔这个除螨仪，能把床垫里的螨虫全吸出来！以前 Cleaning 靠晒，现在三分钟吸完，孩子过敏少了。", product:"除螨仪", crowd:"宝妈/家庭", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 14:23:05", source:"AI" },
      { id:"cl2", text:"别再用烤箱预热了！苏泊尔空气炸锅，200度15分钟，鸡翅外酥里嫩，不用一滴油，少吃油不长胖。", product:"空气炸锅", crowd:"年轻白领", structure:[{t:"compare",l:"对比"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:154, duration:28, updated:"08-04 11:07:42", source:"AI" },
      { id:"cl3", text:"苏泊尔洗地机，吸拖洗一体，干湿垃圾一次搞定，清洁力提升3倍，省时省力更省心。", product:"洗地机", crowd:"家庭主妇", structure:[{t:"proof",l:"证据"},{t:"sell",l:"卖点"}], chars:168, duration:30, updated:"08-03 16:55:18", source:"手工新增" },
      { id:"cl4", text:"姐妹们！这个面霜我真的要用喇叭喊！干皮亲妈不是吹的，用完第二天脸嫩到想摸自己一百遍。核心成分玻色因+神经酰胺，修护屏障同时锁水保湿，质地像冰淇淋一样一抹就化。现在拍一发三，错过等半年！", product:"焕颜修护面霜", crowd:"干皮/敏感肌", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 09:45:11", source:"AI" },
      { id:"cl5", text:"你是不是买了一堆护肤品，结果该起皮还是起皮？因为你根本没修屏障！XXX专研屏障修护13年，这个精华水含5重神经酰胺，3秒吸收不粘腻。现在买正装送同款旅行装。", product:"屏障修护精华水", crowd:"屏障受损/混油皮", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:142, duration:24, updated:"08-03 20:30:18", source:"AI" },
      { id:"cl6", text:"夏天出门三件套：防晒+散粉+定妆喷雾。这款防晒SPF50+PA++++，关键是跟妆不搓泥，成膜之后哑光雾面感。今天直播间拍防晒送散粉小样。", product:"哑光防晒霜", crowd:"通勤/混油皮", structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:128, duration:22, updated:"08-03 15:22:45", source:"手工新增" },
      { id:"cl7", text:"给孩子挑枕头一定要看这三点：第一材质要透气，第二高度要可调，第三枕套要能拆洗。这款儿童乳胶枕，分段护颈设计，0-12岁都能用。", product:"儿童乳胶枕", crowd:"宝妈/3-12岁", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"scene",l:"场景"}], chars:144, duration:25, updated:"08-02 22:10:33", source:"AI" },
      { id:"cl8", text:"出差党看过来！这个折叠烧水壶只有一部手机大小，5分钟烧开，316不锈钢内胆。折叠后塞包里就走，再也不用酒店的水壶了。", product:"折叠烧水壶", crowd:"出差党/旅游", structure:[{t:"scene",l:"场景"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:120, duration:20, updated:"08-02 12:08:19", source:"AI" }
    ];

    const clChipInfo = {
      hook:   {cls:"cl-chip-hook",    txt:"钩子"},
      pain:   {cls:"cl-chip-pain",    txt:"痛点"},
      sell:   {cls:"cl-chip-sell",    txt:"卖点"},
      cta:    {cls:"cl-chip-cta",     txt:"逼单"},
      proof:  {cls:"cl-chip-proof",   txt:"信任"},
      scene:  {cls:"cl-chip-scene",   txt:"场景"},
      compare:{cls:"cl-chip-compare", txt:"对比"}
    };

    function clRenderChips(struct) {
      if (!struct || !struct.length) return '<span style="color:#888;font-size:11px;">-</span>';
      const parts = struct.map(s => {
        const info = clChipInfo[s.t] || {cls:"cl-chip-other", txt:s.l||s.t};
        return '<span class="cl-chip ' + info.cls + '">' + info.txt + '</span>';
      });
      // join with +
      let html = '';
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) html += '<span style="color:#888;margin:0 2px;">+</span>';
        html += parts[i];
      }
      return '<span class="cl-chips-text">' + html + '</span>';
    }

    function clRender(data) {
      const tbody = document.getElementById("clTbody");
      const empty = document.getElementById("clEmpty");
      if (!data.length) { tbody.innerHTML = ""; empty.hidden = false; return; }
      empty.hidden = true;
      tbody.innerHTML = data.map(r => {
        const chips = clRenderChips(r.structure);
        const isAI = r.source === "AI";
        const sourceLabel = r.source === "AI" ? "AI生成" : r.source;
        const sourceTag = '<span class="cl-source-tag ' + (isAI ? 'ai' : 'import') + '">' + sourceLabel + '</span>';
        const editBtn = '<button class="cl-act-btn" onclick="clEditText(\'' + r.id + '\')">编辑</button>';
        const viewBtn = '<button class="cl-act-btn cl-act-view" onclick="clViewText(\'' + r.id + '\')">查看</button>';
        const aiDropBtn = '<div class="cl-ai-drop"><button class="cl-ai-btn" onclick="clToggleAIMenu(event)">AI <span class="cl-ai-caret">▼</span></button><div class="cl-ai-menu"><button onclick="clAIAction(&quot;rewrite&quot;,&quot;' + r.id + '&quot;)">智能改写</button><button onclick="clAIAction(&quot;clone&quot;,&quot;' + r.id + '&quot;)">爆款仿写</button><button onclick="clAIAction(&quot;script&quot;,&quot;' + r.id + '&quot;)">智能脚本</button><button onclick="clAIAction(&quot;remix&quot;,&quot;' + r.id + '&quot;)">智能混剪</button></div></div>';
        const delBtn = '<button class="cl-act-btn cl-act-danger" onclick="clDelete(&quot;' + r.id + '&quot;)">删除</button>';
        const moreItems = [];
        if (isAI) moreItems.push('<button onclick="clLocate(\'' + r.id + '\')">定位至会话</button>');
        moreItems.push('<button onclick="AssetAudit.showHistory(\'文案\',\'' + r.product.replace(/'/g, "") + '文案\')">查看变更</button>');
        const moreBtn = '<div class="cl-more-drop"><button class="cl-act-btn cl-more-btn" onclick="clToggleMoreMenu(event)" title="更多操作">⋯</button><div class="cl-more-menu">' + moreItems.join('') + '</div></div>';
        const actBtns = viewBtn + editBtn + aiDropBtn + delBtn + moreBtn;
        return '<tr>'
          + '<td class="cl-col-text"><span class="cl-copy-text" data-id="' + r.id + '" title="' + escapeHtml(r.text) + '">' + r.text + '</span></td>'
          + '<td>' + sourceTag + '</td>'
          + '<td>' + r.product + '</td>'
          + '<td>' + r.crowd + '</td>'
          + '<td class="cl-col-struct">' + chips + '</td>'
          + '<td class="cl-col-chars">' + r.chars + '字/' + r.duration + 's</td>'
          + '<td class="asset-audit-cell"><b>' + (r.createdBy || '嗡大发') + '</b><small>' + (r.createdAt || '08/01 10:20') + '</small></td>'
          + '<td class="asset-audit-cell"><b>' + (r.updatedBy || '嗡大发') + '</b><small>' + r.updated.replace(/-/g, '/') .replace(/:([0-9]{2})$/, '') + '</small></td>'
          + '<td class="cl-col-act"><div class="cl-act-group">' + actBtns + '</div></td>'
          + '</tr>';
      }).join("");
    }

    // ===== 文案编辑弹窗 =====
    const clEditModal = document.getElementById("clEditModal");
    let clEditingId = null;

    function clEditText(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!item) return;
      clEditingId = id;
      // 填充字段
      // 关联产品:从文本反查 productId(可能在档案库中)
      const matchedEntry = Object.entries(productCatalog).find(function(entry) { return entry[1].name === item.product; });
      const productId = matchedEntry ? matchedEntry[0] : "";
      setClEditProduct(productId, matchedEntry ? matchedEntry[1] : null, item.product);
      document.getElementById("clEditText").value = item.text || "";
      // 元信息(只读)
      document.getElementById("clEditMetaSource").textContent = item.source || "—";
      document.getElementById("clEditMetaChars").textContent = (item.chars || item.text.length) + "字 / " + (item.duration || "—") + "s";
      document.getElementById("clEditMetaUpdated").textContent = item.updated || "—";
      clHydrateEditPersona(item);
      // 清除校验态
      clClearEditValidation();
      clUpdateEditCounter();
      // 打开弹窗
      clEditModal.classList.add("show");
      setTimeout(function() { clEditModal.querySelector("[data-cl-edit-product-picker]")?.focus(); }, 0);
    }

    function setClEditProduct(productId, product, fallbackName) {
      const input = document.getElementById("clEditProduct");
      const label = clEditModal.querySelector("[data-cl-edit-product-label]");
      if (!input || !label) return;
      input.value = productId || "";
      const displayName = product?.name || fallbackName || "选择产品";
      label.textContent = displayName;
      label.classList.toggle("placeholder", !displayName || displayName === "选择产品");
    }

    function openClEditProductPicker() {
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        items: Object.entries(productCatalog).map(function(entry) { return { id: entry[0], ...entry[1] }; }),
        selectedId: document.getElementById("clEditProduct").value,
        onConfirm: function(productId, product) {
          setClEditProduct(productId, product, product?.name);
        }
      });
    }

    function clClearEditValidation() {
      clEditModal.querySelectorAll(".cl-edit-field").forEach(function(f) { f.classList.remove("invalid"); });
      const err = document.getElementById("clEditModalError");
      err.hidden = true;
      err.textContent = "";
    }

    function clUpdateEditCounter() {
      const ta = document.getElementById("clEditText");
      const counter = document.getElementById("clEditCounter");
      const len = ta.value.length;
      counter.textContent = len + " / 500 字";
      counter.classList.toggle("over", len > 500);
    }

    function clCloseEditModal() {
      clEditModal.classList.remove("show");
      clEditingId = null;
    }

    // ===== 文案查看弹窗(只读) =====
    const clViewModal = document.getElementById("clViewModal");
    let clViewingId = null;

    function clViewText(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!item) return;
      clViewingId = id;
      // 元信息
      const sourceLabel = item.source === "AI" ? "AI生成" : (item.source || "—");
      document.getElementById("clViewMetaSource").textContent = sourceLabel;
      document.getElementById("clViewMetaChars").textContent = (item.chars || (item.text || "").length) + "字 / " + (item.duration || "—") + "s";
      document.getElementById("clViewMetaUpdated").textContent = item.updated || "—";
      // 基础信息
      document.getElementById("clViewProduct").textContent = item.product || "—";
      document.getElementById("clViewText").textContent = item.text || "—";
      // 人群快照(优先快照,无快照取顶层)
      const p = item.personaSnapshot || {
        audiences: item.crowd ? [item.crowd] : [],
        gender: "不限",
        age: "",
        pain: [],
        scenes: []
      };
      document.getElementById("clViewAudience").textContent = (p.audiences || []).join("、") || "—";
      document.getElementById("clViewGender").textContent = p.gender || "不限";
      document.getElementById("clViewAge").textContent = p.age || "—";
      document.getElementById("clViewPain").textContent = (p.pain || []).length ? (p.pain || []).map(function(line) { return "· " + line; }).join("\n") : "—";
      document.getElementById("clViewScenes").textContent = (p.scenes || []).length ? (p.scenes || []).map(function(line) { return "· " + line; }).join("\n") : "—";
      // 打开弹窗
      clViewModal.classList.add("show");
    }

    function clCloseViewModal() {
      clViewModal.classList.remove("show");
      clViewingId = null;
    }

    function clHydrateEditPersona(item) {
      const snapshot = item.personaSnapshot || {};
      const mode = snapshot.source || (item.personaTemplateId ? "template" : "manual");
      clSetEditAudienceMode(mode);
      clSetEditAudienceValues(snapshot.audiences?.length ? snapshot.audiences : (item.crowd ? [item.crowd] : []));
      clSetEditSingleChoice("gender", snapshot.gender || "不限");
      clSetEditAge(snapshot.age || "");
      document.getElementById("clEditPersonaPain").value = Array.isArray(snapshot.pain) ? snapshot.pain.join("\n") : "";
      document.getElementById("clEditPersonaScenes").value = Array.isArray(snapshot.scenes) ? snapshot.scenes.join("\n") : "";
      if (mode === "template") clSetEditPersonaTemplate(snapshot.templateId || item.personaTemplateId || "", !item.personaSnapshot);
    }

    function clSetEditAudienceMode(mode, openTemplatePicker = false) {
      const templateMode = mode === "template";
      clEditModal.dataset.audienceMode = mode;
      clEditModal.querySelectorAll("[data-cl-audience-mode]").forEach(button => button.classList.toggle("active", button.dataset.clAudienceMode === mode));
      clEditModal.querySelector("[data-cl-audience-template]").hidden = !templateMode;
      if (!templateMode) {
        delete clEditModal.dataset.personaTemplateId;
        clEditModal.querySelector("[data-cl-persona-selected]").textContent = "选择人群画像模板";
        window.CreationPersonaPicker?.close();
      } else if (openTemplatePicker) {
        clOpenEditPersonaTemplatePicker();
      }
    }

    function clSetEditAudienceValues(values) {
      const selected = new Set(values || []);
      clEditModal.querySelectorAll("[data-cl-audience]").forEach(button => button.classList.toggle("active", selected.has(button.dataset.clAudience)));
    }

    function clSetEditSingleChoice(type, value) {
      const selector = type === "gender" ? "[data-cl-gender]" : "[data-cl-age]";
      clEditModal.querySelectorAll(selector).forEach(button => button.classList.toggle("active", button.dataset[type === "gender" ? "clGender" : "clAge"] === value));
    }

    function clSetEditAge(value) {
      const age = value === "51+" ? "50+" : value;
      const standard = [...clEditModal.querySelectorAll("[data-cl-age]")].some(button => button.dataset.clAge === age);
      clSetEditSingleChoice("age", standard ? age : (age ? "custom" : ""));
      const custom = clEditModal.querySelector("[data-cl-custom-age]");
      custom.hidden = standard || !age;
      if (!standard && age) {
        const [min, max] = age.split(/[–-]/);
        document.getElementById("clEditAgeMin").value = min || "";
        document.getElementById("clEditAgeMax").value = max || "";
      } else {
        document.getElementById("clEditAgeMin").value = "";
        document.getElementById("clEditAgeMax").value = "";
      }
    }

    function clSetEditPersonaTemplate(id, applyFields = true) {
      const persona = personaCatalog.find(item => item.id === id);
      const label = clEditModal.querySelector("[data-cl-persona-selected]");
      if (!persona) {
        delete clEditModal.dataset.personaTemplateId;
        label.textContent = "选择人群画像模板";
        return;
      }
      clEditModal.dataset.personaTemplateId = persona.id;
      label.textContent = persona.name;
      if (!applyFields) return;
      clSetEditAudienceValues([persona.audience]);
      clSetEditSingleChoice("gender", persona.gender || "不限");
      clSetEditAge(persona.age || "");
      document.getElementById("clEditPersonaPain").value = (persona.pain || []).join("\n");
      document.getElementById("clEditPersonaScenes").value = (persona.scenes || []).join("\n");
    }

    function clOpenEditPersonaTemplatePicker() {
      if (!window.CreationPersonaPicker) return showToast("人群模板选择器加载失败，请刷新页面后重试。");
      const product = (clEditModal.querySelector("[data-cl-edit-product-label]")?.textContent || "").trim();
      window.CreationPersonaPicker.open({
        items: personaCatalog,
        productName:product,
        selectedId:clEditModal.dataset.personaTemplateId || "",
        onConfirm(persona) { clSetEditPersonaTemplate(persona?.id || ""); }
      });
    }

    function clReadEditPersona() {
      const audiences = [...clEditModal.querySelectorAll("[data-cl-audience].active")].map(button => button.dataset.clAudience);
      const gender = clEditModal.querySelector("[data-cl-gender].active")?.dataset.clGender || "不限";
      const ageChoice = clEditModal.querySelector("[data-cl-age].active")?.dataset.clAge || "";
      const age = ageChoice === "custom"
        ? [document.getElementById("clEditAgeMin").value.trim(), document.getElementById("clEditAgeMax").value.trim()].filter(Boolean).join("–")
        : ageChoice;
      const splitLines = id => document.getElementById(id).value.split("\n").map(value => value.trim()).filter(Boolean);
      return {
        source:clEditModal.dataset.audienceMode || "manual",
        templateId:clEditModal.dataset.personaTemplateId || "",
        audiences,
        gender,
        age,
        pain:splitLines("clEditPersonaPain"),
        scenes:splitLines("clEditPersonaScenes")
      };
    }

    function clApplyEditAiSuggestion(type) {
      const product = (clEditModal.querySelector("[data-cl-edit-product-label]")?.textContent || "").trim() || "产品";
      const samples = type === "pain"
        ? [[`担心${product}使用效果不稳定`, "不想花太多时间处理日常麻烦"], ["希望一次解决核心问题", "更在意使用过程是否省心"]]
        : [[`${product}的日常使用场景`, "需要快速处理问题的即时场景"], ["周末集中使用场景", "家人共同使用的生活场景"]];
      const key = type === "pain" ? "painSuggestionIndex" : "sceneSuggestionIndex";
      const index = Number(clEditModal.dataset[key] || 0) % samples.length;
      document.getElementById(type === "pain" ? "clEditPersonaPain" : "clEditPersonaScenes").value = samples[index].join("\n");
      clEditModal.dataset[key] = String(index + 1);
    }

    function clSaveEditModal() {
      if (!clEditingId) return;
      const product = (clEditModal.querySelector("[data-cl-edit-product-label]")?.textContent || "").trim();
      const persona = clReadEditPersona();
      const text = document.getElementById("clEditText").value.trim();
      // 校验
      clClearEditValidation();
      let firstInvalid = null;
      const mark = function(el) {
        const field = el.closest(".cl-edit-field");
        if (field) field.classList.add("invalid");
        if (!firstInvalid) firstInvalid = el;
      };
      if (!product) mark(document.getElementById("clEditProduct"));
      if (!persona.audiences.length || (persona.source === "template" && !persona.templateId)) mark(document.getElementById("clEditPersonaField"));
      if (text.length < 5 || text.length > 500) mark(document.getElementById("clEditText"));
      if (firstInvalid) {
        const err = document.getElementById("clEditModalError");
        err.hidden = false;
        const msgs = [];
        if (!product) msgs.push("关联产品");
        if (!persona.audiences.length) msgs.push("核心目标人群");
        else if (persona.source === "template" && !persona.templateId) msgs.push("人群画像模板");
        if (text.length < 5) msgs.push("文案不能少于 5 字");
        else if (text.length > 500) msgs.push("文案不能超过 500 字");
        err.textContent = "请检查：" + msgs.join("、");
        firstInvalid.focus();
        return;
      }
      const item = clData.find(function(r) { return r.id === clEditingId; });
      if (!item) { clCloseEditModal(); return; }
      item.text = text;
      item.product = product;
      item.crowd = persona.audiences.join("、");
      const previousPersonaId = item.personaTemplateId || "";
      item.personaTemplateId = persona.templateId;
      item.personaSnapshot = persona;
      if (item.personaTemplateId && item.personaTemplateId !== previousPersonaId) {
        const persona = personaCatalog.find(entry => entry.id === item.personaTemplateId);
        if (persona) persona.usage += 1;
      }
      item.chars = text.length;
      item.updated = new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
      clCloseEditModal();
      clFilterAndRender();
      showToast("文案已更新");
    }

    // 弹窗事件绑定
    if (clEditModal) {
      clEditModal.addEventListener("click", function(e) {
        if (e.target === clEditModal) clCloseEditModal();
        if (e.target.closest("[data-cl-edit-product-picker]")) return openClEditProductPicker();
        const modeButton = e.target.closest("[data-cl-audience-mode]");
        if (modeButton) {
          clSetEditAudienceMode(modeButton.dataset.clAudienceMode, modeButton.dataset.clAudienceMode === "template");
          return;
        }
        if (e.target.closest("[data-cl-persona-trigger]")) clOpenEditPersonaTemplatePicker();
        const audienceButton = e.target.closest("[data-cl-audience]");
        if (audienceButton) audienceButton.classList.toggle("active");
        const genderButton = e.target.closest("[data-cl-gender]");
        if (genderButton) clSetEditSingleChoice("gender", genderButton.dataset.clGender);
        const ageButton = e.target.closest("[data-cl-age]");
        if (ageButton) {
          clSetEditSingleChoice("age", ageButton.dataset.clAge);
          clEditModal.querySelector("[data-cl-custom-age]").hidden = ageButton.dataset.clAge !== "custom";
        }
        const aiSuggest = e.target.closest("[data-cl-ai-suggest]");
        if (aiSuggest) clApplyEditAiSuggestion(aiSuggest.dataset.clAiSuggest);
      });
      document.querySelectorAll("[data-close-cl-edit]").forEach(function(b) { b.addEventListener("click", clCloseEditModal); });
      document.getElementById("clEditSave")?.addEventListener("click", clSaveEditModal);
      // 字数实时计数
      document.getElementById("clEditText")?.addEventListener("input", clUpdateEditCounter);
      // Esc 关闭 / Cmd+Enter 保存
      clEditModal.addEventListener("keydown", function(e) {
        if (e.key === "Escape") { e.preventDefault(); clCloseEditModal(); }
        else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); clSaveEditModal(); }
      });
    }

    // 文案查看弹窗事件绑定
    if (clViewModal) {
      clViewModal.addEventListener("click", function(e) {
        if (e.target === clViewModal) clCloseViewModal();
      });
      document.querySelectorAll("[data-close-cl-view]").forEach(function(b) { b.addEventListener("click", clCloseViewModal); });
      document.getElementById("clViewEditBtn")?.addEventListener("click", function() {
        if (!clViewingId) return;
        const id = clViewingId;
        clCloseViewModal();
        clEditText(id);
      });
      clViewModal.addEventListener("keydown", function(e) {
        if (e.key === "Escape") { e.preventDefault(); clCloseViewModal(); }
      });
    }

    function clCloseActionMenus() {
      document.querySelectorAll(".cl-ai-menu.show, .cl-more-menu.show").forEach(m => m.classList.remove("show"));
      document.querySelectorAll(".cl-col-act.cl-menu-open").forEach(cell => cell.classList.remove("cl-menu-open"));
    }

    function clToggleAIMenu(e) {
      e.stopPropagation();
      const menu = e.target.closest(".cl-ai-drop").querySelector(".cl-ai-menu");
      const shouldOpen = !menu.classList.contains("show");
      clCloseActionMenus();
      if (shouldOpen) {
        menu.classList.add("show");
        menu.closest(".cl-col-act")?.classList.add("cl-menu-open");
      }
    }

    function clToggleMoreMenu(e) {
      e.stopPropagation();
      const menu = e.target.closest(".cl-more-drop").querySelector(".cl-more-menu");
      const shouldOpen = !menu.classList.contains("show");
      clCloseActionMenus();
      if (shouldOpen) {
        menu.classList.add("show");
        menu.closest(".cl-col-act")?.classList.add("cl-menu-open");
      }
    }

    function clAIAction(action, id) {
      const labels = {rewrite:"智能改写", clone:"爆款仿写", script:"智能脚本", remix:"智能混剪"};
      showToast('「' + (labels[action]||action) + '」已创建任务，跳转至 AI 创作...');
      clCloseActionMenus();
      setTimeout(function() { document.querySelector('.nav-item[data-page="creation"]').click(); }, 600);
    }

    function clLocate(id) {
      const item = clData.find(function(r) { return r.id === id; });
      showToast("已定位至「" + item.product + "」的生成会话");
    }

    function clDelete(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!confirm('确定删除文案「' + item.product + '」？\n\n此操作不可撤销。')) return;
      const idx = clData.findIndex(function(r) { return r.id === id; });
      if (idx > -1) { clData.splice(idx, 1); }
      clFilterAndRender();
      showToast("文案已删除");
    }

    function clUpdateHeadStats() {
      const ai = clData.filter(function(r) { return r.source === "AI"; }).length;
      const manual = clData.filter(function(r) { return r.source === "手工新增"; }).length;
      const video = clData.filter(function(r) { return r.source === "视频识别"; }).length;
      const el = document.getElementById("clHeadStats");
      if (el) el.textContent = '共 ' + clData.length + ' 条 · AI生成 ' + ai + ' · 手工新增 ' + manual + ' · 视频识别 ' + video;
    }

    function clFilterAndRender() {
      const src = document.getElementById("clSourceFilter")?.value || "all";
      const kw = (document.getElementById("clSearchInput")?.value || "").trim().toLowerCase();
      let filtered = clData;
      if (src !== "all") filtered = filtered.filter(function(r) { return r.source === src; });
      if (kw) filtered = filtered.filter(function(r) { return r.text.toLowerCase().includes(kw) || r.product.toLowerCase().includes(kw) || r.crowd.toLowerCase().includes(kw); });
      clRender(filtered);
    }

    // 绑定 & 初始化
    (function() {
      const srcF = document.getElementById("clSourceFilter");
      const kwF = document.getElementById("clSearchInput");
      if (srcF) srcF.addEventListener("change", clFilterAndRender);
      if (kwF) kwF.addEventListener("input", clFilterAndRender);
      clRender(clData);
    })();

    document.addEventListener("click", clCloseActionMenus);
    const clCreateModal = document.getElementById("clCreateModal");
    const clParseStatus = document.getElementById("clParseStatus");
    let clCreateSource = "manual";
    const clCreateTextState = {
      manual:{ text:"", parse:null },
      library:{ text:"", parse:null },
      upload:{ text:"", parse:null }
    };
    const clVideoCopyMap = {
      "7553983811703193643":"你以为床垫看着干净就够了吗？实际走一遍才知道，藏在纤维深处的细小灰尘根本不是换床单能解决的。轻净 Pro 除螨仪拍打和吸尘同步进行，透明尘杯里吸出了什么，清洁结果当场就能看见。床垫、沙发和布艺都能用，尘杯还能拆下来清洗。想看完整清洁过程，点进商品看实测。",
      "7553983811703197228":"下班回家不想守在厨房，就把食材放进轻享空气炸锅 A8。可视窗口能直接看到上色情况，不用反复开盖，家庭容量一次就能做够。炸篮用完可以拆洗，今晚直播间还有配套赠品，具体优惠以页面展示为准。"
    };
    const clVideoAudienceMap = {
      "7553983811703193643":{ audience:"精致妈妈", gender:"女性", age:"24–30", pain:"床垫深处灰尘难以日常清理\n孩子接触织物后容易敏感", scenes:"宝宝家庭的床垫日常清洁\n布艺沙发与毛绒玩具清洁" },
      "7553983811703197228":{ audience:"新锐白领", gender:"不限", age:"24–30", pain:"下班后做饭时间不足\n传统烹饪需要反复看守", scenes:"工作日晚餐快速制作\n周末家庭小食制作" }
    };
    const clCreateVideoFallback = [
      { id:"7553983811703193643", source:"finished", title:"除螨仪结果冲击型主视频", channel:"历史投放", product:"轻净 Pro 除螨仪", duration:"00:32", origin:"千川素材", status:"已分析", updated:"08-04 14:20", tags:["结果前置","清洁演示"], auxiliary:"素材 ID 7553983811703193643", transcript:clVideoCopyMap["7553983811703193643"] },
      { id:"7553983811703197228", source:"finished", title:"空气炸锅晚餐场景视频", channel:"历史投放", product:"轻享空气炸锅 A8", duration:"00:28", origin:"千川素材", status:"已分析", updated:"08-04 11:07", tags:["晚餐场景","效率卖点"], auxiliary:"素材 ID 7553983811703197228", transcript:clVideoCopyMap["7553983811703197228"] },
      { id:"ref-clean-001", source:"external", title:"床褥清洁结果型参考视频", channel:"抖音", product:"未关联产品", duration:"00:36", origin:"外部参考", status:"已分析", updated:"08-03 18:30", tags:["痛点冲突","结果证明"], auxiliary:"拆解版本 V3", transcript:"床褥表面看着干净，深层问题却常常被忽略。先解决核心问题，再展示实际清洁结果，整个过程更有说服力。" },
      { id:"ref-kitchen-002", source:"external", title:"一人食效率场景参考视频", channel:"抖音", product:"未关联产品", duration:"00:24", origin:"外部参考", status:"已分析", updated:"08-02 12:08", tags:["场景开场","节奏紧凑"], auxiliary:"拆解版本 V2", transcript:"下班回家时间有限，做饭最怕步骤复杂。用更简单的方式把晚餐安排好，日常才更轻松。" }
    ];

    function setClAudienceChoice(group, value) {
      const host = clCreateModal.querySelector(`[data-cl-choice-group="${group}"]`);
      if (!host) return;
      const matched = [...host.querySelectorAll(".cl-audience-chip")].find(button => button.dataset.value === value);
      host.querySelectorAll(".cl-audience-chip").forEach(button => button.classList.toggle("active", button === matched));
      if (group === "age") document.getElementById("clCustomAge")?.classList.toggle("show", value === "custom");
    }
    function getClAudienceChoice(group) {
      return clCreateModal.querySelector(`[data-cl-choice-group="${group}"] .cl-audience-chip.active`)?.dataset.value || "";
    }
    function resetClAudienceFields() {
      setClAudienceChoice("audience", "精致妈妈");
      setClAudienceChoice("gender", "不限");
      setClAudienceChoice("age", "24–30");
      document.getElementById("clAgeMin").value = "";
      document.getElementById("clAgeMax").value = "";
      document.getElementById("clCreatePain").value = "";
      document.getElementById("clCreateScenes").value = "";
    }

    function setClCreatePersonaMode(mode, openTemplatePicker = false) {
      const templateMode = mode === "template";
      clCreateModal.dataset.personaMode = mode;
      clCreateModal.querySelectorAll("[data-cl-create-persona-mode]").forEach(button => button.classList.toggle("active", button.dataset.clCreatePersonaMode === mode));
      clCreateModal.querySelector("[data-cl-create-template-select]").hidden = !templateMode;
      if (!templateMode) {
        delete clCreateModal.dataset.personaTemplateId;
        clCreateModal.querySelector("[data-cl-create-persona-selected]").textContent = "选择人群画像模板";
        window.CreationPersonaPicker?.close();
      } else if (openTemplatePicker) {
        openClCreatePersonaTemplatePicker();
      }
    }

    function setClCreatePersonaTemplate(id) {
      const persona = personaCatalog.find(item => item.id === id);
      const label = clCreateModal.querySelector("[data-cl-create-persona-selected]");
      if (!persona) {
        delete clCreateModal.dataset.personaTemplateId;
        label.textContent = "选择人群画像模板";
        return;
      }
      clCreateModal.dataset.personaTemplateId = persona.id;
      label.textContent = persona.name;
      setClAudienceChoice("audience", persona.audience || "");
      setClAudienceChoice("gender", persona.gender || "不限");
      const age = persona.age === "50+" ? "51+" : persona.age;
      const standard = [...clCreateModal.querySelectorAll('[data-cl-choice-group="age"] .cl-audience-chip')].some(button => button.dataset.value === age);
      setClAudienceChoice("age", standard ? age : "custom");
      if (!standard) {
        const [min, max] = String(persona.age || "").split(/[–-]/);
        document.getElementById("clAgeMin").value = min || "";
        document.getElementById("clAgeMax").value = max || "";
      }
      document.getElementById("clCreatePain").value = (persona.pain || []).join("\n");
      document.getElementById("clCreateScenes").value = (persona.scenes || []).join("\n");
    }

    function openClCreatePersonaTemplatePicker() {
      if (!window.CreationPersonaPicker) return showToast("人群模板选择器加载失败，请刷新页面后重试。");
      const product = productCatalog[document.getElementById("clCreateProduct").value]?.name || "";
      window.CreationPersonaPicker.open({
        items:personaCatalog,
        productName:product,
        selectedId:clCreateModal.dataset.personaTemplateId || "",
        onConfirm(persona) { setClCreatePersonaTemplate(persona?.id || ""); }
      });
    }

    function applyClCreateAiSuggestion(type) {
      const product = productCatalog[document.getElementById("clCreateProduct").value]?.name || "产品";
      const samples = type === "pain"
        ? [[`担心${product}实际效果不稳定`, "不想为日常问题反复花时间"], ["希望一次解决核心问题", "更在意使用过程是否省心"]]
        : [[`${product}的日常使用场景`, "需要快速处理问题的即时场景"], ["周末集中使用场景", "家人共同使用的生活场景"]];
      const key = type === "pain" ? "painSuggestionIndex" : "sceneSuggestionIndex";
      const index = Number(clCreateModal.dataset[key] || 0) % samples.length;
      document.getElementById(type === "pain" ? "clCreatePain" : "clCreateScenes").value = samples[index].join("\n");
      clCreateModal.dataset[key] = String(index + 1);
    }

    function getClCreateVideoItems() {
      const catalog = typeof readReferenceVideoCatalog === "function" ? readReferenceVideoCatalog() : [];
      const ids = new Set(catalog.map(item => item.id));
      return [...catalog, ...clCreateVideoFallback.filter(item => !ids.has(item.id))];
    }

    function setClCreateProduct(productId, product = productCatalog[productId]) {
      const input = document.getElementById("clCreateProduct");
      const label = clCreateModal.querySelector("[data-cl-create-product-label]");
      if (!input || !label) return;
      const currentPersona = personaCatalog.find(item => item.id === clCreateModal.dataset.personaTemplateId);
      if (currentPersona && personaProducts(currentPersona).length && !personaProducts(currentPersona).includes(product?.name || "")) {
        if (!window.confirm("切换产品将清空当前不适用的人群画像及其自动回填内容，是否继续？")) return false;
        setClCreatePersonaTemplate("");
        resetClAudienceFields();
        showToast("已清空不适用的人群画像，请按新产品重新选择");
      }
      input.value = productId || "";
      label.textContent = product?.name || "选择产品";
      label.classList.toggle("placeholder", !product?.name);
      return true;
    }

    function openClCreateProductPicker() {
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        items:Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId:document.getElementById("clCreateProduct").value,
        onConfirm(productId, product) {
          setClCreateProduct(productId, product);
        }
      });
    }

    function getClCreateTextState(source = clCreateSource) {
      return clCreateTextState[source] || (clCreateTextState[source] = { text:"", parse:null });
    }

    function storeClCreateText(source = clCreateSource) {
      const field = document.getElementById("clCreateText");
      if (field) getClCreateTextState(source).text = field.value;
    }

    function renderClCreateParseState(source = clCreateSource) {
      const state = getClCreateTextState(source);
      const parse = state.parse;
      if (!parse) {
        clParseStatus.hidden = true;
        clParseStatus.classList.remove("is-parsing");
        return;
      }
      clParseStatus.hidden = false;
      clParseStatus.classList.toggle("is-parsing", parse.status === "parsing");
      clParseStatus.querySelector("b").textContent = parse.status === "parsing" ? "" : "✓";
      clParseStatus.querySelector("span").textContent = parse.message;
    }

    function startClCreateParse(source, label, text) {
      const state = getClCreateTextState(source);
      const parseToken = `${Date.now()}-${Math.random()}`;
      state.text = "";
      state.parseToken = parseToken;
      state.parse = { status:"parsing", message:`正在解析“${label}”的口播文案…` };
      if (clCreateSource === source) {
        document.getElementById("clCreateText").value = "";
        renderClCreateParseState(source);
      }
      window.setTimeout(() => {
        if (state.parseToken !== parseToken) return;
        state.text = text;
        state.parse = { status:"done", message:`“${label}”口播识别完成，可继续修改后保存。` };
        if (clCreateSource === source) {
          document.getElementById("clCreateText").value = text;
          renderClCreateParseState(source);
        }
        showToast("视频口播识别完成");
      }, 700);
    }

    function applyClCreateVideo(video) {
      if (!video) return;
      const matchedProduct = Object.entries(productCatalog).find(([, product]) => product.name === video.product);
      if (matchedProduct) setClCreateProduct(matchedProduct[0], matchedProduct[1]);
      const audience = clVideoAudienceMap[video.id];
      if (audience) {
        setClAudienceChoice("audience", audience.audience);
        setClAudienceChoice("gender", audience.gender);
        setClAudienceChoice("age", audience.age);
        document.getElementById("clCreatePain").value = audience.pain;
        document.getElementById("clCreateScenes").value = audience.scenes;
      }
      setClCreatePersonaMode("manual");
      const trigger = clCreateModal.querySelector("[data-cl-create-video-trigger-text]");
      trigger.textContent = "重新选择视频";
      const selected = clCreateModal.querySelector("[data-cl-create-selected-video]");
      selected.hidden = false;
      selected.innerHTML = `<strong>${escapeHtml(video.title || "已选视频")}</strong><span>${escapeHtml(video.source === "external" ? "外部参考视频" : "成片视频")} · ${escapeHtml(video.channel || "—")} · ${escapeHtml(video.duration || "—")}</span>`;
      clCreateModal.dataset.selectedVideoId = video.id || "";
      const state = getClCreateTextState("library");
      state.videoId = video.id || "";
      startClCreateParse("library", video.title || "已选视频", video.transcript || clVideoCopyMap[video.id] || "该视频已完成口播解析，请根据识别结果补充或调整文案内容。");
    }

    function openClCreateVideoPicker() {
      if (!window.CreationVideoPicker) return showToast("视频选择器加载失败，请刷新页面后重试。");
      window.CreationVideoPicker.open({
        items:getClCreateVideoItems(),
        selectedId:clCreateModal.dataset.selectedVideoId || "",
        onConfirm(video) { applyClCreateVideo(video); }
      });
    }

    function setClCreateSource(source, openVideoPicker = false) {
      storeClCreateText(clCreateSource);
      clCreateSource = source;
      clCreateModal.querySelectorAll("[data-cl-create-source]").forEach(button => button.classList.toggle("active", button.dataset.clCreateSource === source));
      clCreateModal.querySelectorAll("[data-cl-create-panel]").forEach(panel => { panel.hidden = panel.dataset.clCreatePanel !== source; });
      document.getElementById("clCreateText").value = getClCreateTextState(source).text;
      renderClCreateParseState(source);
      if (source === "library" && openVideoPicker) openClCreateVideoPicker();
    }

    function openClCreateModal() {
      clCreateModal.querySelectorAll("input:not([type=file]), textarea").forEach(field => { field.value = ""; });
      Object.keys(clCreateTextState).forEach(source => { clCreateTextState[source] = { text:"", parse:null }; });
      document.getElementById("clVideoUploadInput").value = "";
      setClCreateProduct("");
      delete clCreateModal.dataset.selectedVideoId;
      const videoTrigger = clCreateModal.querySelector("[data-cl-create-video-trigger-text]");
      if (videoTrigger) videoTrigger.textContent = "从视频库选择";
      const selectedVideo = clCreateModal.querySelector("[data-cl-create-selected-video]");
      if (selectedVideo) { selectedVideo.hidden = true; selectedVideo.innerHTML = ""; }
      renderClCreateParseState("manual");
      resetClAudienceFields();
      setClCreatePersonaMode("manual");
      setClCreateSource("manual");
      clCreateModal.classList.add("show");
      setTimeout(() => {
        const body = clCreateModal.querySelector(".modal-body");
        if (body) body.scrollTop = 0;
        clCreateModal.querySelector("[data-cl-create-product-picker]")?.focus();
      }, 0);
    }

    document.getElementById("clCreateBtn")?.addEventListener("click", openClCreateModal);
    document.querySelectorAll("[data-close-cl-create]").forEach(button => button.addEventListener("click", () => clCreateModal.classList.remove("show")));
    clCreateModal?.addEventListener("click", event => {
      if (event.target === clCreateModal) return clCreateModal.classList.remove("show");
      const source = event.target.closest("[data-cl-create-source]");
      if (source) return setClCreateSource(source.dataset.clCreateSource, source.dataset.clCreateSource === "library" && !clCreateModal.dataset.selectedVideoId);
      if (event.target.closest("[data-cl-create-video-picker]")) return openClCreateVideoPicker();
      if (event.target.closest("[data-cl-create-product-picker]")) return openClCreateProductPicker();
      const personaMode = event.target.closest("[data-cl-create-persona-mode]");
      if (personaMode) return setClCreatePersonaMode(personaMode.dataset.clCreatePersonaMode, personaMode.dataset.clCreatePersonaMode === "template");
      if (event.target.closest("[data-cl-create-persona-trigger]")) return openClCreatePersonaTemplatePicker();
      const aiSuggest = event.target.closest("[data-cl-create-ai-suggest]");
      if (aiSuggest) return applyClCreateAiSuggestion(aiSuggest.dataset.clCreateAiSuggest);
      const choice = event.target.closest(".cl-audience-chip");
      if (choice) {
        const group = choice.closest("[data-cl-choice-group]")?.dataset.clChoiceGroup;
        if (group) setClAudienceChoice(group, choice.dataset.value);
        return;
      }
    });
    document.getElementById("clVideoUploadTrigger")?.addEventListener("click", () => document.getElementById("clVideoUploadInput").click());
    document.getElementById("clVideoUploadInput")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      startClCreateParse("upload", file.name, "先别只看表面，真正影响使用体验的是核心问题有没有被解决。这个产品通过实际操作完成主要处理，并把结果直接展示出来；日常使用步骤更少，后续整理也更方便。想看完整使用过程，可以继续查看产品演示。");
    });
    copyStructureDetailModal?.addEventListener("click", event => {
      const tab = event.target.closest("[data-copy-detail-tab]");
      if (tab) {
        copyStructureDetailModal.querySelectorAll("[data-copy-detail-tab]").forEach(button => button.classList.toggle("active", button === tab));
        copyStructureDetailModal.querySelectorAll("[data-copy-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.copyDetailPanel === tab.dataset.copyDetailTab));
        return;
      }
      const toggle = event.target.closest("[data-copy-stage-toggle]");
      if (toggle) return toggle.closest("[data-copy-stage-card]").classList.toggle("expanded");
      if (event.target.closest("[data-copy-stage-copy]")) {
        const text = event.target.closest("[data-copy-stage-card]").querySelector(".copy-stage-talk p")?.textContent || "";
        navigator.clipboard?.writeText(text);
        return showToast("可复用话术已复制");
      }
      const jump = event.target.closest("[data-copy-jump-source]");
      if (jump) showToast(`已定位参考成品的第 ${Number(jump.dataset.copyJumpSource) + 1} 个结构阶段`);
    });
    document.getElementById("clCreateText")?.addEventListener("input", event => {
      getClCreateTextState().text = event.target.value;
    });
    document.getElementById("clCreateSave")?.addEventListener("click", () => {
      const productId = document.getElementById("clCreateProduct").value;
      const product = productCatalog[productId]?.name || "";
      const audience = getClAudienceChoice("audience");
      const gender = getClAudienceChoice("gender");
      let age = getClAudienceChoice("age");
      if (age === "custom") {
        const min = Number(document.getElementById("clAgeMin").value);
        const max = Number(document.getElementById("clAgeMax").value);
        if (!min || !max || min > max) return showToast("请填写正确的自定义年龄区间");
        age = `${min}–${max}`;
      }
      const crowd = `${audience} / ${gender} / ${age}`;
      const pain = document.getElementById("clCreatePain").value.trim();
      const scenes = document.getElementById("clCreateScenes").value.trim();
      const text = document.getElementById("clCreateText").value.trim();
      if (getClCreateTextState().parse?.status === "parsing") return showToast("视频口播正在解析，请完成后再保存");
      if (!productId) return showToast("请选择关联产品");
      if (!audience || !gender || !age) return showToast("请完整选择目标人群、性别和年龄");
      if (clCreateModal.dataset.personaMode === "template" && !clCreateModal.dataset.personaTemplateId) return showToast("请从模板库选择人群画像");
      if (!text) return showToast("请填写或识别文案内容");
      const chars = text.replace(/\s/g, "").length;
      const now = new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
      const personaSnapshot = { source:clCreateModal.dataset.personaMode || "manual", templateId:clCreateModal.dataset.personaTemplateId || "", audiences:[audience], gender, age, pain:pain.split("\n").map(value => value.trim()).filter(Boolean), scenes:scenes.split("\n").map(value => value.trim()).filter(Boolean) };
      if (personaSnapshot.templateId) {
        const persona = personaCatalog.find(item => item.id === personaSnapshot.templateId);
        if (persona) persona.usage += 1;
      }
      clData.unshift({ id:`cl-${Date.now()}`, text, product, crowd, pain, scenes, personaTemplateId:personaSnapshot.templateId, personaSnapshot, structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"行动引导"}], chars, duration:Math.max(1,Math.round(chars/4)), updated:now, source:clCreateSource === "manual" ? "手工新增" : "视频识别" });
      clCreateModal.classList.remove("show");
      document.getElementById("clSourceFilter").value = "all";
      document.getElementById("clSearchInput").value = "";
      clFilterAndRender();
      clUpdateHeadStats();
      showToast("文案已新增并保存到文案库");
    });

    /* ===== 组织权限与公共事实库增强（原型交互） ===== */
    (() => {
      const permissionModules = [
        { name:"AI创作", actions:["查看", "发起创作", "保存资产", "删除会话"] },
        { name:"品牌库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"产品库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"文案库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"模板库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"系统管理", actions:["查看成员权限", "配置角色", "同步钉钉人员"] }
      ];
      const roles = {
        admin:{ name:"管理员", desc:"拥有当前团队全部菜单和按钮权限", permissions:{} },
        creator:{ name:"运营／创作成员", desc:"可创作并维护业务资产，不可管理系统权限", permissions:{} },
        viewer:{ name:"只读成员", desc:"仅可查看授权范围内的菜单与资产", permissions:{} }
      };
      permissionModules.forEach(module => module.actions.forEach(action => {
        const key = `${module.name}:${action}`;
        roles.admin.permissions[key] = true;
        roles.creator.permissions[key] = module.name !== "系统管理" && !["删除"].includes(action);
        roles.viewer.permissions[key] = action === "查看";
      }));
      const members = [
        { name:"嗡大发", dept:"抖音三区", role:"admin", scope:"all", status:"在职" },
        { name:"林运营", dept:"内容运营·小家电组", role:"creator", scope:"team", status:"在职" },
        { name:"王剪辑", dept:"视频中心·混剪组", role:"creator", scope:"personal", status:"在职" },
        { name:"陈观察", dept:"经营分析组", role:"viewer", scope:"team", status:"在职" }
      ];
      let activeRole = "admin";
      const roleList = document.getElementById("permissionRoleList");
      const tree = document.getElementById("permissionTree");
      const memberRows = document.getElementById("permissionMemberRows");
      const roleTitle = document.getElementById("permissionRoleTitle");
      const roleDesc = document.getElementById("permissionRoleDesc");

      function renderPermissionTree() {
        if (!tree || !roles[activeRole]) return;
        tree.innerHTML = permissionModules.map(module => `<section class="permission-tree-group"><div class="permission-tree-head"><strong>${module.name}</strong><label><input type="checkbox" data-module-all="${module.name}"> 全选</label></div><div class="permission-actions">${module.actions.map(action => { const key = `${module.name}:${action}`; return `<label><input type="checkbox" data-permission-key="${key}" ${roles[activeRole].permissions[key] ? "checked" : ""}> ${action}</label>`; }).join("")}</div></section>`).join("");
        tree.querySelectorAll("[data-module-all]").forEach(box => {
          const children = [...tree.querySelectorAll(`[data-permission-key^="${box.dataset.moduleAll}:"]`)];
          box.checked = children.every(child => child.checked);
          box.indeterminate = !box.checked && children.some(child => child.checked);
        });
      }
      function renderMembers() {
        if (!memberRows) return;
        memberRows.innerHTML = members.map((member, index) => `<tr><td><strong>${member.name}</strong></td><td>${member.dept}</td><td><select data-member-role="${index}">${Object.entries(roles).map(([key, role]) => `<option value="${key}" ${member.role === key ? "selected" : ""}>${role.name}</option>`).join("")}</select></td><td><select data-member-scope="${index}"><option value="personal" ${member.scope === "personal" ? "selected" : ""}>仅个人</option><option value="team" ${member.scope === "team" ? "selected" : ""}>个人及团队</option><option value="all" ${member.scope === "all" ? "selected" : ""}>当前公司全部</option></select></td><td><span class="badge green">${member.status}</span></td></tr>`).join("");
      }
      function selectRole(key) {
        if (!roles[key]) return;
        activeRole = key;
        roleList?.querySelectorAll("[data-permission-role]").forEach(button => button.classList.toggle("active", button.dataset.permissionRole === key));
        roleTitle.textContent = roles[key].name;
        roleDesc.textContent = roles[key].desc;
        renderPermissionTree();
      }
      roleList?.addEventListener("click", event => {
        const role = event.target.closest("[data-permission-role]");
        if (role) selectRole(role.dataset.permissionRole);
      });
      tree?.addEventListener("change", event => {
        const box = event.target;
        if (box.matches("[data-permission-key]")) roles[activeRole].permissions[box.dataset.permissionKey] = box.checked;
        if (box.matches("[data-module-all]")) {
          tree.querySelectorAll(`[data-permission-key^="${box.dataset.moduleAll}:"]`).forEach(child => { child.checked = box.checked; roles[activeRole].permissions[child.dataset.permissionKey] = box.checked; });
        }
        renderPermissionTree();
        showToast("角色权限已保存");
      });
      memberRows?.addEventListener("change", event => {
        const roleSelect = event.target.closest("[data-member-role]");
        const scopeSelect = event.target.closest("[data-member-scope]");
        if (roleSelect) members[Number(roleSelect.dataset.memberRole)].role = roleSelect.value;
        if (scopeSelect) members[Number(scopeSelect.dataset.memberScope)].scope = scopeSelect.value;
        showToast("成员权限已更新");
      });
      document.getElementById("syncDingMembers")?.addEventListener("click", event => {
        const button = event.currentTarget;
        button.disabled = true; button.textContent = "同步中…";
        setTimeout(() => { button.disabled = false; button.textContent = "同步钉钉人员"; renderMembers(); showToast("已同步 4 名在职成员，未发现组织变更"); }, 900);
      });

      const roleModal = document.createElement("div");
      roleModal.className = "modal-backdrop";
      roleModal.innerHTML = `<div class="modal" style="max-width:520px"><div class="modal-head"><div><span class="badge">成员权限</span><h3>新建角色</h3></div><button class="close-btn" type="button" data-close-new-role>×</button></div><div class="modal-body"><div class="field"><label>角色名称<span class="required-mark">*</span></label><input data-new-role-name placeholder="例如：高级运营"></div><div class="field"><label>角色说明</label><textarea data-new-role-desc placeholder="说明该角色负责的业务范围"></textarea></div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-close-new-role>取消</button><button class="primary-btn" type="button" data-save-new-role>创建角色</button></div></div>`;
      document.body.append(roleModal);
      document.getElementById("newPermissionRole")?.addEventListener("click", () => { roleModal.classList.add("show"); roleModal.querySelector("[data-new-role-name]").focus(); });
      roleModal.addEventListener("click", event => {
        if (event.target === roleModal || event.target.closest("[data-close-new-role]")) return roleModal.classList.remove("show");
        if (!event.target.closest("[data-save-new-role]")) return;
        const name = roleModal.querySelector("[data-new-role-name]").value.trim();
        if (!name) return showToast("请输入角色名称");
        if (Object.values(roles).some(role => role.name === name)) return showToast("角色名称已存在");
        const key = `role-${Date.now()}`;
        roles[key] = { name, desc:roleModal.querySelector("[data-new-role-desc]").value.trim() || "自定义业务角色", permissions:{} };
        permissionModules.forEach(module => module.actions.forEach(action => roles[key].permissions[`${module.name}:${action}`] = false));
        const button = document.createElement("button"); button.type="button"; button.className="permission-role"; button.dataset.permissionRole=key; button.textContent=name; roleList.append(button);
        roleModal.classList.remove("show"); selectRole(key); renderMembers(); showToast(`角色“${name}”已创建`);
      });
      selectRole(activeRole); renderMembers();

      function renderBrandRelations() {
        const container = document.getElementById("brandRelatedProducts");
        const count = document.getElementById("brandRelatedCount");
        if (!container || !brandCatalog[currentBrandId]) return;
        const brandName = brandCatalog[currentBrandId].name;
        const products = Object.entries(productDetailData).filter(([, product]) => product.brand === brandName);
        if (count) count.textContent = `${products.length} 个产品`;
        container.innerHTML = products.length ? products.map(([id, product]) => `<button type="button" class="brand-related-product" data-brand-related-product="${id}"><span class="brand-related-thumb"></span><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category || "未分类")} · ${escapeHtml(product.price || "价格待补充")}</small></span><b>查看详情 ›</b></button>`).join("") : `<div class="empty-state"><strong>暂无关联产品</strong><span>在产品库为产品选择该品牌后，将自动显示在这里。</span></div>`;
      }
      function syncBrandCardCounts() {
        brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => {
          const brand = brandCatalog[card.dataset.brandId];
          if (!brand) return;
          const total = Object.values(productDetailData).filter(product => product.brand === brand.name).length;
          const countNode = card.querySelector(".brand-card-foot span:first-child");
          if (countNode) countNode.textContent = `关联产品 ${total}`;
        });
      }
      window.syncBrandCardCounts = syncBrandCardCounts;
      brandGrid?.addEventListener("click", event => { if (event.target.closest("[data-brand-id]") && !event.target.closest("[data-toggle-card-menu],[data-delete-brand]")) setTimeout(renderBrandRelations, 0); }, true);
      document.getElementById("brandRelatedProducts")?.addEventListener("click", event => { const target = event.target.closest("[data-brand-related-product]"); if (target) openProductDetail(target.dataset.brandRelatedProduct); });
      syncBrandCardCounts();
    })();
  
