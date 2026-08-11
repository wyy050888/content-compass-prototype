(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 角色管理 -->
      <section class="page" id="page-role-management">
        <div class="page-pad">
          <div class="page-head">
            <div><h1>角色管理</h1><p>创建业务角色，并统一配置各角色可访问的菜单与可执行的按钮操作。</p></div>
            <div class="product-page-actions"><button class="primary-btn" type="button" id="newPermissionRole">＋ 新建角色</button></div>
          </div>
          <div class="permission-layout">
            <aside class="permission-side">
              <div class="permission-toolbar"><h3>角色列表</h3><small style="color:#8b8597;">一个人员绑定一个角色</small></div>
              <div class="permission-role-list" id="permissionRoleList">
                <button class="permission-role active" type="button" data-permission-role="admin">管理员</button>
                <button class="permission-role" type="button" data-permission-role="creator">运营／创作成员</button>
                <button class="permission-role" type="button" data-permission-role="viewer">只读成员</button>
              </div>
            </aside>
            <section class="permission-main">
              <div class="permission-toolbar">
                <div><h3 id="permissionRoleTitle">管理员</h3><small id="permissionRoleDesc" style="color:#8b8597;">拥有当前团队全部菜单和操作权限</small></div>
                <span class="badge">菜单与按钮权限</span>
              </div>
              <div class="permission-panel active" data-permission-panel="function">
                <div class="permission-tree" id="permissionTree"></div>
                <div class="permission-note">品牌库、产品库为团队公共事实库，成员默认可见；新增、编辑和删除仍由本页按钮权限控制。</div>
              </div>
            </section>
          </div>
        </div>
      </section>`);})();
