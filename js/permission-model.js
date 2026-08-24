(function () {
  "use strict";

  const button = (id, label, kind = "maintain", children = []) => ({ id, label, type: "button", kind, children });
  const page = (id, label, children) => ({ id, label, type: "page", children });
  const menu = (id, label, children = []) => ({ id, label, type: "menu", children });

  const functionTree = [
    menu("ai", "AI 创作", [
      menu("ai.copy", "智能文案"),
      menu("ai.imitate", "爆款文案仿写"),
      menu("ai.rewrite", "智能改写"),
      menu("ai.script", "智能脚本"),
      menu("ai.mix", "智能混剪"),
      menu("ai.breakdown", "爆款拆解")
    ]),
    menu("asset", "资产库", [
      menu("asset.brand", "品牌库", [
        page("asset.brand.list", "品牌列表页", [
          button("asset.brand.create", "新建品牌", "create"),
          button("asset.brand.delete.card", "删除品牌（列表卡片）", "delete")
        ]),
        page("asset.brand.detail", "品牌详情页", [
          button("asset.brand.history", "查看变更", "view"),
          button("asset.brand.edit", "编辑品牌"),
          button("asset.brand.product.open", "查看关联产品详情", "view"),
          button("asset.brand.delete.detail", "删除品牌（详情头部）", "delete")
        ])
      ]),
      menu("asset.product", "产品库", [
        page("asset.product.list", "产品列表页", [
          button("asset.product.create", "新建产品", "create"),
          button("asset.product.delete.card", "删除产品（列表卡片）", "delete")
        ]),
        page("asset.product.detail", "产品详情页", [
          button("asset.product.history", "查看变更", "view"),
          button("asset.product.edit", "编辑产品"),
          button("asset.product.delete.detail", "删除产品（详情头部）", "delete")
        ])
      ]),
      menu("asset.copy", "文案库", [
        page("asset.copy.list", "文案列表页", [
          button("asset.copy.create", "新增文案", "create"),
          button("asset.copy.view", "查看文案", "view"),
          button("asset.copy.session", "定位至会话", "view"),
          button("asset.copy.edit", "编辑文案"),
          button("asset.copy.history", "查看变更", "view"),
          button("asset.copy.delete", "删除文案", "delete")
        ])
      ]),
      menu("asset.script", "脚本库", [
        page("asset.script.list", "脚本列表页", [
          button("asset.script.view", "查看脚本详情", "view", [
            button("asset.script.storyboard.edit", "修改脚本分镜")
          ]),
          button("asset.script.session", "定位会话", "view"),
          button("asset.script.history", "查看变更", "view"),
          button("asset.script.download", "下载脚本", "view"),
          button("asset.script.delete", "删除脚本", "delete")
        ])
      ]),
      menu("asset.video", "视频库", [
        menu("asset.material", "创作素材", [
          page("asset.material.list", "素材列表页", [
            button("asset.material.import", "导入素材", "create"),
            button("asset.material.folder.create", "新增素材文件夹", "directory"),
            button("asset.material.folder.edit", "编辑素材文件夹", "directory"),
            button("asset.material.folder.delete", "删除素材文件夹", "directory"),
            button("asset.material.download", "下载素材", "view"),
            button("asset.material.manage", "维护创作素材"),
            button("asset.material.history", "查看变更", "view"),
            button("asset.material.delete", "删除素材", "delete")
          ])
        ]),
        menu("asset.finished", "成片视频", [
          page("asset.finished.list", "成片列表页", [
            button("asset.finished.import", "导入成片", "create"),
            button("asset.finished.folder.create", "新增成片文件夹", "directory"),
            button("asset.finished.folder.edit", "编辑成片文件夹", "directory"),
            button("asset.finished.folder.delete", "删除成片文件夹", "directory"),
            button("asset.finished.download", "下载成片", "view"),
            button("asset.finished.manage", "维护成片视频"),
            button("asset.finished.result.download", "下载拆解结果", "view"),
            button("asset.finished.history", "查看变更", "view"),
            button("asset.finished.delete", "删除成片", "delete")
          ])
        ]),
        menu("asset.reference", "外部参考视频", [
          page("asset.reference.list", "参考视频列表页", [
            button("asset.reference.collect", "爆款采集", "create"),
            button("asset.reference.import", "导入外部参考视频", "create"),
            button("asset.reference.download", "下载外部参考视频", "view"),
            button("asset.reference.manage", "维护外部参考视频"),
            button("asset.reference.breakdown", "拆解外部参考视频", "execute"),
            button("asset.reference.history", "查看变更", "view"),
            button("asset.reference.delete", "删除外部参考视频", "delete")
          ])
        ])
      ]),
      menu("asset.template", "模板库", [
        menu("asset.persona", "人群画像", [
          page("asset.persona.list", "人群画像列表页", [
            button("asset.persona.create", "新建画像", "create"),
            button("asset.persona.edit", "编辑画像"),
            button("asset.persona.history", "查看变更", "view"),
            button("asset.persona.copy", "复制画像", "view"),
            button("asset.persona.delete", "删除画像", "delete")
          ])
        ]),
        menu("asset.structure", "爆款内容结构", [
          page("asset.structure.list", "内容结构列表页", [
            button("asset.structure.extract", "爆款视频提炼", "create"),
            button("asset.structure.view", "查看结构详情", "view"),
            button("asset.structure.retry", "重新解析", "execute"),
            button("asset.structure.delete", "删除结构", "delete")
          ])
        ])
      ])
    ]),
    menu("system", "系统管理", [
      menu("system.role", "角色管理", [
        page("system.role.page", "角色管理页", [
          button("system.role.group.create", "新建角色组", "create"),
          button("system.role.group.edit", "编辑角色组"),
          button("system.role.group.delete", "删除角色组", "delete"),
          button("system.role.create", "新建角色", "create"),
          button("system.role.edit", "编辑角色"),
          button("system.role.move", "移动角色分组"),
          button("system.role.delete", "删除角色", "delete"),
          button("system.role.function", "配置功能权限"),
          button("system.role.data", "配置数据权限")
        ])
      ]),
      menu("system.member", "用户管理", [
        page("system.member.page", "用户管理页", [
          button("system.member.sync", "同步钉钉用户"),
          button("system.member.assign", "分配角色"),
          button("system.member.toggle", "启用／禁用用户"),
          button("system.member.reset", "重置密码")
        ])
      ])
    ])
  ];

  const dataObjects = [
    { id: "brand", label: "品牌", root: "asset.brand", note: "品牌档案与品牌策略" },
    { id: "product", label: "产品", root: "asset.product", note: "产品事实与关联资产" },
    { id: "copy", label: "文案", root: "asset.copy", note: "文案资产" },
    { id: "script", label: "脚本", root: "asset.script", note: "脚本与分镜" },
    { id: "material", label: "创作素材", root: "asset.material", note: "维护不额外限制导入人" },
    { id: "finished", label: "成片视频", root: "asset.finished", note: "维护不额外限制导入人" },
    { id: "reference", label: "外部参考视频", root: "asset.reference", note: "维护不额外限制导入人" },
    { id: "persona", label: "人群画像", root: "asset.persona", note: "公共模板资产" },
    { id: "structure", label: "爆款内容结构", root: "asset.structure", note: "仍受来源与状态限制", scopeKeys: ["view", "delete"] }
  ];

  window.ContentCompassPermissionModel = {
    functionTree,
    dataObjects,
    scopeOptions: [
      { value: "none", label: "无权限", level: 0 },
      { value: "self", label: "仅本人", level: 1 },
      { value: "department", label: "本部门", level: 2 },
      { value: "all", label: "全部", level: 3 }
    ]
  };
})();
