/* NBAKCAR 工厂产品展厅 —— 只负责交互，不生成图片卡片
   图片卡片已写死在 index.html 里，所以即使这段脚本出错，图片照样能显示 */
(function () {
  'use strict';

  var PER_PAGE = 9;
  var page = { home: 1, products: 1 };
  var lang = 'zh';
  var lbList = [], lbIndex = 0;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- 分页：只显示/隐藏已有的卡片，不新建 ---------- */
  function renderPager(gridName) {
    var grid = $('[data-grid="' + gridName + '"]');
    var pager = $('[data-pager="' + gridName + '"]');
    if (!grid || !pager) return;

    var cards = $$('.product-card', grid);
    var searching = grid.getAttribute('data-searching') === '1';
    var total = cards.length;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));

    if (page[gridName] > pages) page[gridName] = 1;
    var cur = page[gridName];

    cards.forEach(function (card, i) {
      var show = searching || (i >= (cur - 1) * PER_PAGE && i < cur * PER_PAGE);
      card.style.display = show ? '' : 'none';
    });

    if (searching) {
      pager.innerHTML = '';
    } else {
      var html = '<button class="page-btn" data-dir="-1"' + (cur <= 1 ? ' disabled' : '') + '>‹</button>';
      for (var p = 1; p <= pages; p++) {
        html += '<button class="page-btn' + (p === cur ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
      }
      html += '<button class="page-btn" data-dir="1"' + (cur >= pages ? ' disabled' : '') + '>›</button>';
      pager.innerHTML = html;

      $$('.page-btn', pager).forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var d = btn.getAttribute('data-dir');
          var n = btn.getAttribute('data-p');
          if (d) page[gridName] = cur + parseInt(d, 10);
          else page[gridName] = parseInt(n, 10);
          renderPager(gridName);
          var v = grid.closest('.view-page') || grid;
          v.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    bindCards(grid);
  }

  /* ---------- 卡片交互：灯箱 + 视频按钮 ---------- */
  function bindCards(grid) {
    $$('.product-card', grid).forEach(function (card) {
      var img = $('.thumb', card);
      if (img && !img.getAttribute('data-lb-bound')) {
        img.setAttribute('data-lb-bound', '1');
        img.addEventListener('click', function () { openLightbox(grid, card); });
      }
      var vb = $('.video-btn', card);
      if (vb && !vb.getAttribute('data-vb-bound')) {
        vb.setAttribute('data-vb-bound', '1');
        vb.addEventListener('click', function (e) {
          e.stopPropagation();
          var url = vb.getAttribute('data-video');
          if (url && url.indexOf('http') === 0) window.open(url, '_blank');
          else alert(lang === 'zh' ? '视频链接待添加' : 'Video link to be added');
        });
      }
    });
  }

  /* ---------- 灯箱：在当前页范围内左右切换 ---------- */
  function openLightbox(grid, card) {
    lbList = $$('.product-card', grid).filter(function (c) { return c.style.display !== 'none'; });
    lbIndex = lbList.indexOf(card);
    if (lbIndex < 0) lbIndex = 0;
    showLightbox();
    $('#lightbox').classList.add('show');
  }
  function showLightbox() {
    var card = lbList[lbIndex];
    if (!card) return;
    var img = $('.thumb', card);
    $('#lb-img').src = img.src;
    var t = $('.product-title', card);
    $('#lb-cap').textContent = t ? t.textContent : '';
  }
  function closeLightbox() { $('#lightbox').classList.remove('show'); }
  function navLightbox(d) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    showLightbox();
  }

  /* ---------- 菜单切换 ---------- */
  function switchView(name) {
    $$('.view-page').forEach(function (v) { v.classList.remove('active'); });
    $$('.nav-link').forEach(function (l) { l.classList.remove('active'); });
    var view = $('#view-' + name);
    if (view) view.classList.add('active');
    $$('[data-go="' + name + '"]').forEach(function (l) { l.classList.add('active'); });
    if (name === 'home') renderPager('home');
    if (name === 'products') renderPager('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 语言 ---------- */
  function applyLang(l) {
    lang = l;
    var htmlLang = { zh: 'zh-CN', en: 'en', es: 'es', ja: 'ja', ar: 'ar' };
    document.documentElement.lang = htmlLang[l] || 'zh';
    document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
    $$('[data-' + l + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + l);
    });
    var ph = { zh: '搜索产品...', en: 'Search products...', es: 'Buscar productos...', ja: '製品を検索...', ar: 'ابحث عن المنتجات...' };
    $('#header-search').placeholder = ph[l] || ph.zh;
    $$('.video-btn').forEach(function (b) {
      b.textContent = (l === 'zh' ? '▶ 视频' : l === 'en' ? '▶ Video' : l === 'es' ? '▶ Video' : l === 'ja' ? '▶ 動画' : '▶ فيديو');
    });
  }

  /* ---------- 搜索：在“产品”页过滤已存在的卡片 ---------- */
  function doSearch() {
    var q = $('#header-search').value.trim().toLowerCase();
    var grid = $('[data-grid="products"]');
    var cards = $$('.product-card', grid);
    if (!q) {
      grid.setAttribute('data-searching', '0');
      $('#no-result').style.display = 'none';
      switchView('home');
      return;
    }
    switchView('products');
    var hit = 0;
    cards.forEach(function (c) {
      var txt = (c.textContent + ' ' + ($('.thumb', c) ? $('.thumb', c).src : '')).toLowerCase();
      var ok = txt.indexOf(q) !== -1;
      c.style.display = ok ? '' : 'none';
      if (ok) hit++;
    });
    grid.setAttribute('data-searching', '1');
    $('[data-pager="products"]').innerHTML = '';
    $('#no-result').style.display = hit ? 'none' : 'block';
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderPager('home');
    renderPager('products');

    $$('[data-go]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.id === 'contact-btn') return;
        switchView(el.getAttribute('data-go'));
      });
    });

    var cp = $('#contact-panel');
    $('#contact-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      cp.classList.toggle('show');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#contact-btn') && !e.target.closest('#contact-panel')) cp.classList.remove('show');
    });

    $('#lang-switch').addEventListener('change', function () {
      applyLang(this.value);
      renderPager('home');
      renderPager('products');
    });

    var timer = null;
    $('#header-search').addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(doSearch, 200);
    });

    $('#lb-close').addEventListener('click', closeLightbox);
    $('#lb-prev').addEventListener('click', function () { navLightbox(-1); });
    $('#lb-next').addEventListener('click', function () { navLightbox(1); });
    $('#lightbox').addEventListener('click', function (e) { if (e.target === this || e.target.id === 'lb-cap') closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!$('#lightbox').classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
