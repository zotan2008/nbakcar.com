// ============================================================
//  NBAKCAR 展厅  script.v3.js   —— 与 index.html 严格配对
//  以后加图 / 改名字，只改下面「配置区」四张表就行
// ============================================================
(function () {
  'use strict';

  /* ==================== 配置区（要改就改这里） ==================== */

  // 1) 图片列表：底层文件名。加新图就往这里加一行
  var images = [
    'images/NBAKCAR00101.PNG',
    'images/NBAKCAR00102.PNG',
    'images/NBAKCAR00103.PNG',
    'images/NBAKCAR00104.PNG',
    'images/NBAKCAR00105.PNG',
    'images/NBAKCAR00106.PNG',
    'images/NBAKCAR00107.PNG',
    'images/NBAKCAR00108.PNG',
    'images/NBAKCAR00109.PNG',
    'images/NBAKCAR00110.PNG',
    'images/NBAKCAR00111.PNG',
    'images/NBAKCAR00112.PNG',
    'images/NBAKCAR00113.PNG',
    'images/NBAKCAR00114.PNG',
    'images/NBAKCAR00115.PNG',
    'images/NBAKCAR00116.PNG',
    'images/NBAKCAR00117.PNG',
    'images/NBAKCAR00118.PNG',
    'images/NBAKCAR00119.PNG',
    'images/NBAKCAR00120.PNG'
  ];

  // 2) 产品名称（五种语言）。加图时五张表都要补一行，否则会显示空白
  var NAME = {
    zh: '座椅靠背覆盖',
    en: 'Seat Back Cover',
    es: 'Funda de respaldo',
    ja: 'シートバックカバー',
    ar: 'غطاء ظهر المقعد'
  };

  // 3) 单张图单独改名（可选）。不填就用上面 NAME 里的通用名
  var nameOverride = {};
  // 例：'images/NBAKCAR00101.PNG': { zh:'前排座椅套', en:'Front Seat Cover' }

  // 4) 视频链接（以后填，格式：'images/xxx.PNG': 'https://...'）
  var productVideos = {};

  // 每页显示几张
  var PER_PAGE = 8;

  // 默认语言（首次打开没选过时用这个）
  var DEFAULT_LANG = 'en';

  /* ================== 配置区结束，下面不用动 ================== */

  var currentLang = DEFAULT_LANG;
  var currentPage = { home: 1, products: 1 };
  var searching = false;

  // 记住用户手动选过的语言，刷新后仍在
  try {
    var saved = localStorage.getItem('nbakcar_lang');
    if (saved && NAME[saved]) currentLang = saved;
  } catch (e) {}

  function getTitle(src) {
    if (nameOverride[src] && nameOverride[src][currentLang]) return nameOverride[src][currentLang];
    return NAME[currentLang] || NAME.en || '';
  }
  function getVideo(src) { return productVideos[src] || ''; }

  /* ---------- JS 自己生成的那些文字（卡片按钮、提示等） ---------- */
  var DICT = {
    videoLabel: { zh: '▶ 视频', en: '▶ Video', es: '▶ Video', ja: '▶ 動画', ar: '▶ فيديو' },
    videoTip:   { zh: '视频链接待添加', en: 'Video link to be added', es: 'Enlace de video por añadir', ja: '動画リンク未追加', ar: 'رابط الفيديو سيُضاف' },
    noMore:     { zh: '没有更多了', en: 'No more', es: 'No hay más', ja: 'これ以上なし', ar: 'لا المزيد' },
    next:       { zh: '下一页', en: 'Next Page', es: 'Siguiente', ja: '次のページ', ar: 'الصفحة التالية' },
    lightboxOf: { zh: '第 {i} / {n} 张', en: '{i} / {n}', es: '{i} / {n}', ja: '{i} / {n}', ar: '{i} / {n}' }
  };
  function t(key) { return (DICT[key] && DICT[key][currentLang]) || (DICT[key] && DICT[key].en) || ''; }

  function cardHTML(src, index) {
    var title = getTitle(src);
    var vid = getVideo(src);
    return '<article class="product-card" data-index="' + index + '">' +
      '<img class="thumb" src="' + src + '" alt="' + title + '" loading="lazy">' +
      '<div class="product-info"><div class="product-title">' + title + '</div></div>' +
      '<div class="video-slot"><button class="video-btn" type="button" data-video="' + vid + '">' + t('videoLabel') + '</button></div>' +
    '</article>';
  }

  function bindCards(container) {
    container.querySelectorAll('.product-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openLightbox(parseInt(this.getAttribute('data-index'), 10));
      });
    });
    container.querySelectorAll('.video-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var url = this.getAttribute('data-video');
        if (url) { window.open(url, '_blank'); }
        else { alert(t('videoTip')); }
      });
    });
  }

  function renderGrid(gridId, pagerKey) {
    var container = document.getElementById(gridId);
    if (!container) return;

    var page = currentPage[pagerKey];
    var start = (page - 1) * PER_PAGE;
    var slice = images.slice(start, start + PER_PAGE);

    container.innerHTML = '';
    slice.forEach(function (src, i) { container.insertAdjacentHTML('beforeend', cardHTML(src, start + i)); });
    bindCards(container);

    var btn = document.getElementById('next-' + pagerKey);
    if (btn) {
      if (start + PER_PAGE >= images.length) {
        btn.textContent = t('noMore');
        btn.disabled = true;
      } else {
        btn.textContent = t('next');
        btn.disabled = false;
      }
    }
  }

  function renderSearch(q) {
    var container = document.getElementById('product-grid');
    var noRes = document.getElementById('no-result');
    var matched = images.filter(function (src) {
      // 五种语言的名字都参与匹配，切到任意语言都能搜到
      var hay = NAME.zh + ' ' + NAME.en + ' ' + NAME.es + ' ' + NAME.ja + ' ' + NAME.ar + ' ' + src;
      return hay.toLowerCase().indexOf(q) !== -1;
    });
    container.innerHTML = '';
    matched.forEach(function (src, i) { container.insertAdjacentHTML('beforeend', cardHTML(src, i)); });
    bindCards(container);
    if (noRes) noRes.style.display = matched.length ? 'none' : 'block';
    var btn = document.getElementById('next-products');
    if (btn) { btn.textContent = t('next'); btn.disabled = true; }
  }

  /* ---------- 语言切换：菜单 / 产品名 / 页脚 / 按钮 一次全换 ---------- */
  function applyLanguage(lang) {
    if (!NAME[lang]) lang = DEFAULT_LANG;
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang);

    // 自检标记：确认这份新 JS 真的生效了（不想显示可删掉这三行）
    var badge = document.getElementById('lang-badge');
    if (badge) badge.textContent = ({ zh: '中', en: 'EN', es: 'ES', ja: '日', ar: 'ع' })[lang] || lang;

    // 1) 普通文字（菜单、页脚各栏、标题、提示……凡是 HTML 里写了 data-xx 的）
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
    // 2) 属性类（搜索框占位提示等）
    ['placeholder', 'title', 'alt'].forEach(function (attr) {
      document.querySelectorAll('[data-' + lang + '-' + attr + ']').forEach(function (el) {
        el.setAttribute(attr, el.getAttribute('data-' + lang + '-' + attr));
      });
    });
    // 3) 卡片重画，产品名称跟着换
    if (searching) {
      var input0 = document.getElementById('header-search');
      var q = (input0 && input0.value || '').trim().toLowerCase();
      if (q) { renderSearch(q); return; }
      searching = false;
    }
    currentPage.home = 1;
    currentPage.products = 1;
    renderGrid('home-grid', 'home');
    renderGrid('product-grid', 'products');
    // 4) 灯箱说明如果正开着，也跟着换
    if (document.getElementById('lightbox').classList.contains('show')) {
      document.getElementById('lb-cap').textContent = getTitle(images[lightboxIndex]);
    }

    try { localStorage.setItem('nbakcar_lang', lang); } catch (e) {}
  }

  /* ---------- 视图切换 ---------- */
  function switchView(view) {
    ['home', 'products', 'factory'].forEach(function (v) {
      var sec = document.getElementById('view-' + v);
      if (sec) sec.classList.toggle('active', v === view);
    });
    document.querySelectorAll('.nav-link[data-go]').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-go') === view);
    });
    if (view !== 'products') {
      searching = false;
      var input = document.getElementById('header-search');
      if (input) input.value = '';
      currentPage.products = 1;
      renderGrid('product-grid', 'products');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 灯箱 ---------- */
  var lightboxIndex = 0;
  function openLightbox(i) {
    lightboxIndex = i;
    document.getElementById('lb-img').src = images[i];
    document.getElementById('lb-img').alt = getTitle(images[i]);
    document.getElementById('lb-cap').textContent =
      getTitle(images[i]) + '  ·  ' + t('lightboxOf').replace('{i}', i + 1).replace('{n}', images.length);
    document.getElementById('lightbox').classList.add('show');
  }
  function closeLightbox() { document.getElementById('lightbox').classList.remove('show'); }
  function lightboxNav(d) {
    lightboxIndex = (lightboxIndex + d + images.length) % images.length;
    openLightbox(lightboxIndex);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    // 菜单 / LOGO / 页脚里带 data-go 的都能点
    document.querySelectorAll('[data-go]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        switchView(this.getAttribute('data-go'));
      });
    });

    // 联系我们下拉
    var contactBtn = document.getElementById('contact-btn');
    var contactPanel = document.getElementById('contact-panel');
    if (contactBtn && contactPanel) {
      contactBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        contactPanel.classList.toggle('show');
      });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.contact-dropdown')) contactPanel.classList.remove('show');
      });
    }

    // 语言切换
    var langSel = document.getElementById('lang-switch');
    if (langSel) {
      langSel.value = currentLang;
      langSel.addEventListener('change', function () { applyLanguage(this.value); });
    }

    // 搜索
    var input = document.getElementById('header-search');
    if (input) {
      input.addEventListener('input', function () {
        var q = this.value.trim().toLowerCase();
        if (!q) {
          searching = false;
          currentPage.products = 1;
          renderGrid('product-grid', 'products');
          var noRes0 = document.getElementById('no-result');
          if (noRes0) noRes0.style.display = 'none';
          return;
        }
        searching = true;
        switchView('products');
        renderSearch(q);
      });
    }

    // 下一页
    ['home', 'products'].forEach(function (key) {
      var btn = document.getElementById('next-' + key);
      if (btn) {
        btn.addEventListener('click', function () {
          if (this.disabled) return;
          currentPage[key]++;
          renderGrid(key === 'home' ? 'home-grid' : 'product-grid', key);
          document.getElementById('view-' + key).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });

    // 灯箱
    var lb = document.getElementById('lightbox');
    document.getElementById('lb-close').addEventListener('click', closeLightbox);
    document.getElementById('lb-prev').addEventListener('click', function () { lightboxNav(-1); });
    document.getElementById('lb-next').addEventListener('click', function () { lightboxNav(1); });
    lb.addEventListener('click', function (e) { if (e.target === this) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!document.getElementById('lightbox').classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxNav(-1);
      if (e.key === 'ArrowRight') lightboxNav(1);
    });

    applyLanguage(currentLang);   // 应用语言并首次渲染卡片
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
