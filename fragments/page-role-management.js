(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <!-- 角色管理 -->
      <section class="page" id="page-role-management">
        <div class="page-pad permission-page-pad">
          <div class="page-head permission-page-head">
            <div><h1>角色管理</h1><p>分别配置角色可以进入的菜单、页面和按钮，以及可以操作的数据范围。</p></div>
          </div>
          <div class="permission-layout">
            <aside class="permission-side">
              <div class="permission-side-head">
                <div><h3>角色组与角色</h3></div>
                <span class="permission-count" id="permissionRoleCount">0</span>
              </div>
              <div class="permission-tree-create-actions"><button type="button" id="newPermissionRoleGroup">＋ 角色组</button><button type="button" id="newPermissionRole">＋ 角色</button></div>
              <div class="permission-role-list" id="permissionRoleList"></div>
            </aside>
            <section class="permission-main">
              <div class="permission-toolbar permission-main-head">
                <div class="permission-role-heading">
                  <div class="permission-role-title-line"><h3 id="permissionRoleTitle">管理员</h3><input id="permissionRoleNameInput" class="permission-role-name-input" type="text" maxlength="30" aria-label="角色名称" hidden></div>
                </div>
                <div class="permission-role-detail-actions" id="permissionRoleActions" hidden><button class="text-btn" type="button" data-role-command="edit">编辑角色</button><button class="text-btn" type="button" data-role-command="move">移动分组</button><button class="text-btn danger" type="button" data-role-command="delete">删除角色</button></div>
                <div class="permission-tabs" role="tablist" aria-label="角色权限类型">
                  <button class="permission-tab active" type="button" data-permission-tab="function" role="tab" aria-selected="true">功能权限</button>
                  <button class="permission-tab" type="button" data-permission-tab="data" role="tab" aria-selected="false">数据权限</button>
                </div>
              </div>

              <div class="permission-panel active" data-permission-panel="function">
                <div class="permission-panel-toolbar">
                  <div><strong>菜单、页面与按钮</strong><small id="permissionSelectedCount">已选择 0 项</small></div>
                  <div class="permission-panel-actions"><button class="text-btn" type="button" id="expandPermissionTree">全部展开</button><button class="text-btn" type="button" id="collapsePermissionTree">全部收起</button></div>
                </div>
                <div class="permission-tree" id="permissionTree"></div>
              </div>

              <div class="permission-panel" data-permission-panel="data">
                <div class="permission-data-wrap">
                  <table class="permission-data-table">
                    <thead><tr>
                      <th>资产类型</th>
                      <th><span class="permission-column-help">查看范围<button type="button" aria-label="查看范围说明">?</button><span role="tooltip"><b>无权限</b>：不可查看该类资产<br><b>仅本人</b>：仅查看自己创建或导入的资产<br><b>本部门</b>：查看同一钉钉直接部门成员创建或导入的资产<br><b>全部</b>：查看当前公司全部有效资产</span></span></th>
                      <th><span class="permission-column-help">维护范围<button type="button" aria-label="维护范围说明">?</button><span role="tooltip"><b>无权限</b>：不可维护该类资产<br><b>仅本人</b>：仅维护自己创建或导入的资产<br><b>本部门</b>：维护同一钉钉直接部门成员创建或导入的资产<br><b>全部</b>：维护当前公司全部有效资产</span></span></th>
                      <th><span class="permission-column-help">删除范围<button type="button" aria-label="删除范围说明">?</button><span role="tooltip"><b>无权限</b>：不可删除该类资产<br><b>仅本人</b>：仅删除自己创建或导入的资产<br><b>本部门</b>：删除同一钉钉直接部门成员创建或导入的资产<br><b>全部</b>：删除当前公司全部有效资产</span></span></th>
                    </tr></thead>
                    <tbody id="permissionDataRows"></tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>`);})();
