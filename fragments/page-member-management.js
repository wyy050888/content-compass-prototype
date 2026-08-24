(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 用户管理 -->
      <section class="page" id="page-member-management">
        <div class="page-pad permission-page-pad">
          <div class="page-head permission-page-head">
            <div><h1>用户管理</h1><p>管理用户账号、启用状态与角色，并同步钉钉用户及直接部门。</p></div>
            <button class="ghost-btn permission-sync-btn" type="button" id="syncDingMembers"><span class="sync-icon">↻</span><span data-sync-label>同步钉钉用户</span></button>
          </div>
          <section class="permission-main permission-member-main">
            <div class="permission-member-toolbar">
              <div class="permission-member-search"><span>⌕</span><input id="permissionMemberSearch" type="search" placeholder="搜索用户、手机号或角色"></div>
              <div class="permission-member-filters">
                <div class="permission-member-search permission-department-search"><span>⌕</span><input id="permissionDeptSearch" type="search" aria-label="搜索钉钉直接部门" placeholder="搜索部门"></div>
                <select id="permissionStatusFilter" aria-label="筛选账号状态"><option value="all">全部账号状态</option><option value="enabled">已启用</option><option value="disabled">已禁用</option></select>
              </div>
            </div>
            <div class="permission-member-table-wrap">
              <table class="member-table"><thead><tr><th>用户</th><th>账号（手机号）</th><th>钉钉直接部门</th><th>角色</th><th>账号状态</th><th>操作</th></tr></thead><tbody id="permissionMemberRows"></tbody></table>
              <div class="permission-empty" id="permissionMemberEmpty" hidden><strong>没有匹配的用户</strong><span>请调整搜索词或筛选条件。</span></div>
            </div>
          </section>
        </div>
      </section>`);})();
