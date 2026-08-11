(function () {
  'use strict';

  window.createProductDetailMediaBridge = function createProductDetailMediaBridge(context) {
    const { state, data, clone, productName, render, toast, openAssociation, mediaPage, mediaLabel } = context;

    function cancelMediaOverlay() {
      state.overlayRequest = null;
      ['material', 'video', 'reference'].forEach(kind => {
        const page = mediaPage(kind);
        const host = document.querySelector(`#page-${page}`);
        const frame = host?.querySelector('iframe');
        host?.classList.remove('pda-bridge-open');
        frame?.contentWindow?.postMessage({ type: 'pda-library-overlay-cancel', kind }, '*');
      });
    }

    function openMediaLibrary(kind, item = null, intent = 'list', anchor = null) {
      if (!item || intent === 'list') {
        openAssociation(kind);
        return;
      }
      const page = mediaPage(kind);
      const host = document.querySelector(`#page-${page}`);
      const frame = host?.querySelector('iframe');
      if (!host || !frame) {
        toast(`${mediaLabel(kind)}交互层加载失败`);
        return;
      }
      cancelMediaOverlay();
      const mainRect = document.querySelector('.main')?.getBoundingClientRect() || { left: 0, top: 0 };
      const anchorRect = anchor ? {
        left: anchor.left - mainRect.left,
        right: anchor.right - mainRect.left,
        top: anchor.top - mainRect.top,
        bottom: anchor.bottom - mainRect.top
      } : null;
      const requestId = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const message = {
        type: 'pda-open-library-asset', requestId, kind, intent, overlay: true, anchor: anchorRect,
        id: item.libraryId, name: item.name, file: item.file || item.name, product: item.product
      };
      const dispatch = () => {
        if (state.overlayRequest?.requestId === requestId && !state.overlayRequest.ready) {
          frame.contentWindow?.postMessage(message, '*');
        }
      };
      state.overlayRequest = { requestId, kind, page };
      dispatch();
      frame.addEventListener('load', dispatch, { once: true });
      setTimeout(dispatch, 180);
      setTimeout(dispatch, 600);
      setTimeout(() => {
        if (state.overlayRequest?.requestId !== requestId || state.overlayRequest.ready) return;
        cancelMediaOverlay();
        toast('交互层加载失败，请重试');
      }, 1800);
    }

    function finishMediaOverlay(message, page, frame) {
      document.querySelector(`#page-${page}`)?.classList.remove('pda-bridge-open');
      if (message.kind === 'reference') {
        frame?.contentWindow?.postMessage({ type: 'pda-library-overlay-cancel', kind: 'reference' }, '*');
      }
      if (!message.requestId || state.overlayRequest?.requestId === message.requestId) state.overlayRequest = null;
      const local = data[message.kind]?.find(item => String(item.libraryId) === String(message.assetId));
      if (!local) return;
      if (message.deleted) local.linked = false;
      else if (message.asset) {
        const asset = message.asset;
        ['name', 'file', 'product', 'productId', 'platform', 'type', 'duration', 'status', 'source', 'created']
          .forEach(key => { if (asset[key] !== undefined) local[key] = asset[key]; });
        if (asset.tags) local.tags = [...asset.tags];
        if (asset.ads) local.ads = clone(asset.ads);
        local.linked = local.product === productName();
      }
      render();
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (!['pda-library-overlay-ready', 'pda-library-overlay-close', 'pda-library-overlay-status'].includes(message?.type)) return;
      const page = mediaPage(message.kind);
      const frame = document.querySelector(`#page-${page} iframe`);
      if (event.source !== frame?.contentWindow) return;
      if (message.type === 'pda-library-overlay-ready') {
        if (state.overlayRequest?.requestId !== message.requestId) return;
        state.overlayRequest.ready = true;
        document.querySelector(`#page-${page}`)?.classList.add('pda-bridge-open');
        return;
      }
      if (message.type === 'pda-library-overlay-status') {
        const request = state.overlayRequest;
        if (!request || request.requestId !== message.requestId || !request.pendingClose) return;
        const pending = request.pendingClose;
        request.pendingClose = null;
        if (message.active) {
          document.querySelector(`#page-${page}`)?.classList.add('pda-bridge-open');
          return;
        }
        finishMediaOverlay(pending, page, frame);
        return;
      }
      if (message.kind === 'reference' && state.overlayRequest?.requestId === message.requestId) {
        state.overlayRequest.pendingClose = message;
        frame.contentWindow?.postMessage({ type: 'pda-library-overlay-probe', kind: 'reference', requestId: message.requestId }, '*');
        setTimeout(() => {
          const request = state.overlayRequest;
          if (request?.requestId !== message.requestId || !request.pendingClose) return;
          const pending = request.pendingClose;
          request.pendingClose = null;
          finishMediaOverlay(pending, page, frame);
        }, 180);
        return;
      }
      finishMediaOverlay(message, page, frame);
    });

    document.addEventListener('click', event => {
      if (event.target.closest('.nav-item[data-page]')) cancelMediaOverlay();
    }, true);

    return { cancelMediaOverlay, openMediaLibrary };
  };
})();
