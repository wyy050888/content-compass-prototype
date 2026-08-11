(function () {
  const script = document.currentScript;
  if (!script) return;
  script.insertAdjacentHTML('beforebegin', `
    <section class="page embedded-library-page" id="page-creation-videos">
      <iframe
        class="embedded-library-frame"
        src="embedded-pages/创作素材.html?v=20260811a"
        title="创作素材"
      ></iframe>
    </section>
  `);
})();
