(function(){
  var s=document.currentScript;if(!s)return;
  s.insertAdjacentHTML('beforebegin',`<section class="page embedded-library-page" id="page-reference-videos"><iframe class="embedded-library-frame" src="embedded-pages/外部参考视频.html?v=20260811m" title="外部参考视频"></iframe></section>`);
  var frame=document.querySelector('#page-reference-videos iframe');
  window.addEventListener('message',function(event){
    if(event.source!==frame?.contentWindow||event.data?.type!=='rv-request-products')return;
    var products=Array.from(document.querySelectorAll('[data-open-product-detail][data-product-id]')).map(function(card){return{id:card.dataset.productId,name:(card.querySelector('.product-market-title strong')?.textContent||'').trim()}}).filter(function(item){return item.id&&item.name});
    frame.contentWindow.postMessage({type:'rv-products',products:products},'*');
  });
})();
