(function () {
  'use strict';

  window.createProductDetailMediaCards = function createProductDetailMediaCards(context) {
    const {
      esc, cardTime, fvTime, matStatusLabel, matStatusTip, matStatusIco,
      fvStatusLabel, fvSourceLabel, fvSourceClass
    } = context;

    function materialCard(item) {
      const status = item.status;
      const isEmpty = !item.product;
      const typeLabel = item.type === 'image' ? '图片' : '视频';
      const createdShort = cardTime(item.created, true);
      const statusLabel = status === 'analyzing' ? '' : (matStatusLabel[status] || '');
      return `<article class="pda-media-card pda-mat pda-mat-card" data-kind="material" data-id="${item.id}">
        <div class="pda-mat-cover" data-pda-cover>
          <span class="pda-mat-status pda-status-${status}" data-act="start-analyze" data-tip="${esc(matStatusTip[status] || '')}">
            <span class="pda-mat-ico">${matStatusIco[status] || ''}</span>
            ${statusLabel ? `<span class="pda-mat-txt">${esc(statusLabel)}</span>` : ''}
          </span>
          ${item.duration ? `<span class="pda-mat-duration">${esc(item.duration)}</span>` : ''}
          <div class="pda-mat-play-overlay"><div class="pda-mat-play-btn" data-tip="预览"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>
          <div class="pda-mat-select-mark" data-pda-select></div>
        </div>
        <div class="pda-mat-info" data-pda-info>
          <div class="pda-mat-name-line"><div class="pda-mat-name" title="${esc(item.name)}">${esc(item.name)}</div><button class="pda-mat-more" type="button" data-pda-menu-toggle data-kind="material" data-id="${item.id}" aria-label="素材操作">···</button></div>
          <div class="pda-mat-meta-line"><div class="pda-mat-product-line"><span class="pda-mat-product ${isEmpty ? 'is-empty' : ''}" data-tip="${isEmpty ? '未关联产品' : '已关联产品'}">${esc(item.product || '未关联产品')}</span></div><span class="pda-mat-type">${typeLabel} · ${esc(item.tags?.[0] || '未打标签')}</span></div>
          <div class="pda-mat-card-created">${esc(createdShort)}</div>
        </div>
      </article>`;
    }

    function finishedVideoCard(item) {
      const status = item.status;
      const source = ['infinite', 'local', 'remix'].includes(item.source) ? item.source : 'local';
      const qianchuan = item.ads?.length ? '<span class="pda-fv-product pda-fv-qc">已关联千川</span>' : '';
      return `<article class="pda-media-card pda-fv" data-kind="video" data-id="${item.id}">
        <div class="pda-fv-cover ${item.theme || 'mix-a'}" data-pda-cover>
          <button class="pda-fv-select" type="button" data-pda-select aria-label="选择视频"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></button>
          <div class="pda-fv-status ${status}"><span class="pda-fv-dot ${status}"></span><span class="pda-fv-status-text">${esc(fvStatusLabel[status] || '待分析')}</span></div>
          <div class="pda-fv-cover-tags"><span class="pda-fv-tag ${fvSourceClass(source)}">${esc(fvSourceLabel(source))}</span></div>
          <button class="pda-fv-play" type="button" data-pda-cover aria-label="预览">▶</button>
          <span class="pda-fv-duration">${esc(fvTime(item.duration))}</span>
        </div>
        <div class="pda-fv-body" data-pda-info>
          <div class="pda-fv-file-line"><span title="${esc(item.file || item.name)}">${esc(item.file || item.name)}</span><button class="pda-fv-more" type="button" data-pda-menu-toggle data-kind="video" data-id="${item.id}" aria-label="更多操作">•••</button></div>
          <div class="pda-fv-tag-line"><span class="pda-fv-product">${esc(item.product || '未关联产品')}</span>${qianchuan}</div>
          <div class="pda-fv-card-created">${esc(cardTime(item.created))}</div>
        </div>
      </article>`;
    }

    function referenceCard(item) {
      const platforms = { douyin: '抖音', kuaishou: '快手', channels: '视频号', xiaohongshu: '小红书', other: '其他' };
      const sourceClass = item.source === '本地' ? 'local' : 'collect';
      return `<article class="pda-media-card pda-fv pda-ref" data-kind="reference" data-id="${item.id}">
        <div class="pda-fv-cover ref-${esc(item.platform || 'other')}" data-pda-cover>
          <button class="pda-fv-select" type="button" data-pda-select aria-label="选择视频"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></button>
          <div class="pda-fv-status ${item.status}"><span class="pda-fv-dot ${item.status}"></span><span class="pda-fv-status-text">${esc(fvStatusLabel[item.status] || '待分析')}</span></div>
          <div class="pda-fv-cover-tags"><span class="pda-ref-tag ${sourceClass}">${esc(item.source)}</span></div>
          <button class="pda-fv-play" type="button" data-pda-cover aria-label="预览">▶</button>
          <span class="pda-fv-duration">${esc(fvTime(item.duration))}</span>
        </div>
        <div class="pda-fv-body" data-pda-info>
          <div class="pda-fv-file-line"><span title="${esc(item.name)}">${esc(item.name)}</span><button class="pda-fv-more" type="button" data-pda-menu-toggle data-kind="reference" data-id="${item.id}" aria-label="更多操作">•••</button></div>
          <div class="pda-ref-row"><span class="pda-ref-tag product ${item.product ? '' : 'empty'}" title="${esc(item.product || '未关联产品')}">${esc(item.product || '未关联产品')}</span><span class="pda-ref-tag platform">${esc(platforms[item.platform] || '其他')}</span></div>
          <div class="pda-fv-card-created">${esc(item.created || '')}</div>
        </div>
      </article>`;
    }

    function mediaCard(kind, item) {
      if (kind === 'video') return finishedVideoCard(item);
      if (kind === 'reference') return referenceCard(item);
      return materialCard(item);
    }

    return { mediaCard };
  };
})();
