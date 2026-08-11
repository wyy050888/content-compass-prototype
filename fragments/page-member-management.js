(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 人员管理 -->
      <section class="page" id="page-member-management">
        <div class="page-pad">
          <div class="page-head">
            <div><h1>人员管理</h1><p>同步钉钉在职人员，为人员绑定角色并设置内容资产的数据可见范围。</p></div>
            <div class="product-page-actions"><button class="ghost-btn" type="button" id="syncDingMembers">同步钉钉人员</button></div>
          </div>
          <section class="permission-main permission-member-main">
            <div class="permission-toolbar">
              <div><h3>人员列表</h3><small style="color:#8b8597;">角色决定菜单与按钮权限，数据范围决定可查看的内容资产</small></div>
              <span class="badge">钉钉组织同步</span>
            </div>
            <div class="permission-panel active">
              <table class="member-table"><thead><tr><th>人员</th><th>钉钉部门</th><th>角色</th><th>内容资产数据范围</th><th>状态</th></tr></thead><tbody id="permissionMemberRows"></tbody></table>
              <div class="permission-note">“全部可见”仅指当前公司内全部团队资产。文案、脚本、图片、视频和模板应用数据范围；品牌与产品最低为团队可见。</div>
            </div>
          </section>
        </div>
      </section>`);})();
