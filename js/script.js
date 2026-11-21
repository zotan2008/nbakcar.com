// ===== NBAKCAR 工厂产品展厅 =====
// 配套 index.html 使用，依赖其中的 ID：
//   #header-search / #lang-switch / #nav-menu / #contact-btn / #contact-panel
//   #grid-home  #grid-products  #home-pager  #prod-pager
//   #home-page-info  #prod-page-info
//   #lightbox #lb-img #lb-cap #lb-close #lb-prev #lb-next

(function () {
  'use strict';

  var PAGE_SIZE = 9;          // 每页 9 张
  var products = [];          // 由 HTML 里的卡片自动收集
  var lang = 'zh';

  var i18n = {
    zh: { homeTitle:'NBAKCAR 工厂产品展厅', homeSub:'工厂直供 · 精选产品展示',
          prodTitle:'全部产品', prodSub:'共 {n} 款产品，点击图片查看大图',
          search:'搜索产品...', pageInfo:'第 {cur} / {total} 页，共 {n} 款',
          prev:'上一页', next:'下一页', video:'▶ 视频', noVideo:'该产品的视频链接待添加',
          noResult:'没有找到相关产品',
          facTitle:'工厂展示' },
    en: { homeTitle:'NBAKCAR Factory Showroom', homeSub:'Direct from factory · Featured products',
          prodTitle:'All Products', prodSub:'{n} products in total, click image to enlarge',
          search:'Search products...', pageInfo:'Page {cur} of {total}, {n} products',
          prev:'Prev', next:'Next', video:'▶ Video', noVideo:'Video link to be added',
          noResult:'No products found',
          facTitle:'Factory' },
    es: { homeTitle:'Salón de Productos NBAKCAR', homeSub:'Directo de fábrica · Productos destacados',
          prodTitle:'Todos los productos', prodSub:'{n} productos, haz clic para ampliar',
          search:'Buscar productos...', pageInfo:'Página {cur} de {total}, {n} productos',
          prev:'Anterior', next:'Siguiente', video:'▶ Video', noVideo:'Enlace de video por añadir',
          noResult:'No se encontraron productos',
          facTitle:'Fábrica' },
    ja: { homeTitle:'NBAKCAR 工場製品ショールーム', homeSub:'工場直送 · おすすめ製品',
          prodTitle:'全製品', prodSub:'全 {n} 点、画像をクリックで拡大',
          search:'製品を検索...', pageInfo:'{cur} / {total} ページ（全 {n} 点）',
          prev:'前へ', next:'次へ', video:'▶ 動画', noVideo:'動画リンクは追加予定です',
          noResult:'該当する製品がありません',
          facTitle:'工場見学' },
    ar: { homeTitle:'معرض منتجات NBAKCAR', homeSub:'مباشر من المصنع · منتجات مختارة',
          prodTitle:'كل المنتجات', prodSub:'{n} منتج، اضغط على الصورة للتكبير',
          search:'ابحث عن المنتجات...', pageInfo:'صفحة {cur} من {total}، {n} منتج',
          prev:'السابق', next:'التالي', video:'▶ فيديو', noVideo:'رابط الفيديو سيُضاف',
          noResult:'لم يتم العثور على منتجات',
          facTitle:'المصنع' }
  };

  function t(key, vars) {
    var s = (i18n[lang] && i18n[lang][key]) || i18n.zh[key] || '';
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.replace('{' + k + '}', vars[k]);
      });
    }
    return s;
  }

  // ---------- 收集商品数据 ----------
  function collectProducts() {
    var cards = document.querySelectorAll('#grid-products .product-card');
    products = Array.prototype.slice.call(cards).map(function (card, i) {
      var img = card.querySelector('.thumb');
      var titleEl = card.querySelector('.product-title');
      return {
        card: card,
        src: img ? img.getAttribute('src') : '',
        title: titleEl ? titleEl.textContent.trim() : ('NBAKCAR ' + (i + 1)),
        index: i
      };
    });
  }

  // ---------- 渲染卡片（供首页 / 产品页复用） ----------
  function buildCard(p) {
    var art = document.createElement('article');
    art.className = 'product-card';

    var img = document.createElement('img');
    img.className = 'thumb';
    img.src = p.src;
    img.alt = p.title;
    img.loading = 'lazy';
    img.addEventListener('click', function () { openLightbox(p.index); });

    var info = document.createElement('div');
    info.className = 'product-info';
    var tt = document.createElement('div');
    tt.className = 'product-title';
    tt.textContent = p.title;
    info.appendChild(tt);
    var cat = document.createElement('div');
    cat.className = 'product-cat';
    cat.textContent = 'NBAKCAR';
    info.appendChild(cat);

    var slot = document.createElement('div');
    slot.className = 'video-slot';
    var vb = document.createElement('button');
    vb.className = 'video-btn';
    vb.type = 'button';
    vb.textContent = t('video');
    vb.addEventListener('click', function () {
      var url = vb.getAttribute('data-video') || '';
      if (url) { window.open(url, '_blank'); }
      else { alert(t('noVideo')); }
    });
    slot.appendChild(vb);

    art.appendChild(img);
    art.appendChild(info);
    art.appendChild(slot);
    return art;
  }

  // ---------- 分页器 ----------
  var state = {
    home: { grid:null, pager:null, info:null, page:1, kw:'' },
    prod: { grid:null, pager:null, info:null, page:1, kw:'' }
  };

  function filtered(kw) {
    kw = (kw || '').trim().toLowerCase();
    if (!kw) return products;
    return products.filter(function (p) {
      return p.title.toLowerCase().indexOf(kw) > -1;
    });
  }

  function render(name) {
    var st = state[name];
    if (!st || !st.grid) return;

    var list = filtered(st.kw);
    var total = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (st.page > total) st.page = total;

    st.grid.innerHTML = '';

    if (list.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = t('noResult');
      st.grid.appendChild(empty);
    } else {
      var start = (st.page - 1) * PAGE_SIZE;
      var slice = list.slice(start, start + PAGE_SIZE);
      slice.forEach(function (p) { st.grid.appendChild(buildCard(p)); });
    }

    // 页码条
    st.pager.innerHTML = '';
    if (list.length > 0) {
      var prev = document.createElement('button');
      prev.textContent = '‹';
      prev.setAttribute('aria-label', t('prev'));
      prev.disabled = st.page <= 1;
      prev.addEventListener('click', function () { st.page--; render(name); scrollTop(st); });
      st.pager.appendChild(prev);

      for (var i = 1; i <= total; i++) {
        (function (n) {
          var b = document.createElement('button');
          b.textContent = n;
          if (n === st.page) b.className = 'active';
          b.addEventListener('click', function () { st.page = n; render(name); scrollTop(st); });
          st.pager.appendChild(b);
        })(i);
      }

      var next = document.createElement('button');
      next.textContent = '›';
      next.setAttribute('aria-label', t('next'));
      next.disabled = st.page >= total;
      next.addEventListener('click', function () { st.page++; render(name); scrollTop(st); });
      st.pager.appendChild(next);
    }

    st.info.textContent = t('pageInfo', { cur: st.page, total: total, n: list.length });
  }

  function scrollTop(st) {
    var el = st.grid.closest('.view') || st.grid;
    if (el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- 菜单切换 ----------
  function switchView(name) {
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
    document.querySelectorAll('.nav-link[data-view]').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-view') === name);
    });
    closeContact();
  }

  // ---------- 联系我们下拉 ----------
  function closeContact() {
    var p = document.getElementById('contact-panel');
    if (p) p.classList.remove('open');
  }

  // ---------- 灯箱 ----------
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var lbIndex = 0;

  function openLightbox(i) {
    lbIndex = i;
    showLightbox();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function showLightbox() {
    var p = products[lbIndex];
    if (!p) return;
    lbImg.src = p.src;
    lbImg.alt = p.title;
    lbCap.textContent = p.title + '  (' + (lbIndex + 1) + ' / ' + products.length + ')';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function step(d) {
    lbIndex = (lbIndex + d + products.length) % products.length;
    showLightbox();
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  // ---------- 语言切换 ----------
  function applyLang() {
    var sel = document.getElementById('lang-switch');
    lang = sel ? sel.value : 'zh';

    document.documentElement.setAttribute('lang', lang);

    var homeTitle = document.getElementById('home-title');
    var homeSub = document.getElementById('home-sub');
    var prodTitle = document.getElementById('prod-title');
    var prodSub = document.getElementById('prod-sub');
    var facTitle = document.getElementById('fac-title');
    var search = document.getElementById('header-search');

    if (homeTitle) homeTitle.textContent = t('homeTitle');
    if (homeSub) homeSub.textContent = t('homeSub');
    if (prodTitle) prodTitle.textContent = t('prodTitle');
    if (prodSub) prodSub.textContent = t('prodSub', { n: products.length });
    if (facTitle) facTitle.textContent = t('facTitle');
    if (search) search.setAttribute('placeholder', t('search'));

    document.querySelectorAll('[data-zh]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v !== null && !el.classList.contains('nav-link') === false) {
        // 菜单项与下拉内文案都跟随语言
        el.textContent = v;
      }
    });

    document.querySelectorAll('.video-btn').forEach(function (b) { b.textContent = t('video'); });

    render('home');
    render('prod');
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById('header-search');
  var searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        var kw = searchInput.value;
        state.home.kw = kw; state.home.page = 1;
        state.prod.kw = kw; state.prod.page = 1;
        // 输入时若停在其他页，自动跳到产品页展示结果
        if (kw.trim() !== '') switchView('products');
        render('home');
        render('prod');
      }, 180);
    });
  }

  // ---------- 初始化 ----------
  document.addEventListener('DOMContentLoaded', function () {
    collectProducts();

    state.home.grid = document.getElementById('grid-home');
    state.home.pager = document.getElementById('home-pager');
    state.home.info = document.getElementById('home-page-info');
    state.prod.grid = document.getElementById('grid-products');
    state.prod.pager = document.getElementById('prod-pager');
    state.prod.info = document.getElementById('prod-page-info');

    document.querySelectorAll('.nav-link[data-view]').forEach(function (l) {
      l.addEventListener('click', function () { switchView(l.getAttribute('data-view')); });
    });

    var logo = document.querySelector('.logo');
    if (logo) logo.addEventListener('click', function (e) { e.preventDefault(); switchView('home'); });

    var cbtn = document.getElementById('contact-btn');
    if (cbtn) {
      cbtn.addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementById('contact-panel').classList.toggle('open');
      });
    }
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.contact-wrap')) closeContact();
    });

    applyLang();
  });
})();
