/* NBAKCAR site script v4 — 自包含版本
 * 以后只改最上面这三张表：images / productNames / productNamesEn
 */
(function () {
  'use strict';

  /* ===== 1. 图片文件（底层文件名，不用改也能正常显示）===== */
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

  /* ===== 2. 客户看到的显示名（全部同名）===== */
  var TITLE_ZH = '座椅靠背覆盖';
  var TITLE_EN = 'Seat Back Cover';

  var productNames = {};
  var productNamesEn = {};
  images.forEach(function (src) {
    productNames[src] = TITLE_ZH;
    productNamesEn[src] = TITLE_EN;
  });

  /* ===== 3. 视频链接（没有就留空）===== */
  var productVideos = {};

  /* ===== 以下为逻辑，一般不用动 ===== */
  var PER_PAGE = 8;
  var currentPage = { home: 1, products: 1 };
  var currentLang = 'en';
  var lightboxIndex = 0;
  var brokenReported = false;

  function t(key, lang) {
    var map = { zh: '中文', en: 'English', es: 'Español', ja: '日本語', ar: 'العربية' };
    var table = {
      video: { zh: '视频', en: 'Video', es: 'Video', ja: '動画', ar: 'فيديو' },
      noVideo: {
        zh: '视频链接待添加', en: 'Video link to be added',
        es: 'Video por agregar', ja: '動画リンク未追加', ar: 'فيديو سيتم إضافته'
      },
      noResult: { zh: '没有找到相关产品', en: 'No matching products', es: 'Sin resultados', ja: '該当なし', ar: 'لا نتائج' },
      noMore: { zh: '没有更多了', en: 'No more', es: 'No hay más', ja: 'これ以上なし', ar: 'لا المزيد' }
    };
    if (key === 'langName') return map[lang] || lang;
    return (table[key] && table[key][lang]) || table[key].en;
  }

  function getTitle(src) {
    if (currentLang === 'en') return productNamesEn[src] || productNames[src] || src;
    return productNames[src] || productNamesEn[src] || src;
  }

  function cardHTML(src, index) {
    var title = getTitle(src);
    var video = productVideos[src] || '';
    return '<article class="product-card" data-index="' + index + '">' +
      '<img class="pc-img" src="' + src + '" alt="' + title + '" loading="lazy">' +
      '<div class="product-info"><div class="product-title">' + title + '</div></div>' +
      '<button class="video-btn" data-video="' + video + '">&#9654; ' + t('video', currentLang) + '</button>' +
      '</article>';
  }

  /* 图片挂了就打印真实路径，方便一眼看出是路径错了还是文件没传 */
  function bindImageDebug(container) {
    container.querySelectorAll('.pc-img').forEach(function (img) {
      img.addEventListener('error', function () {
        if (brokenReported) return;
        brokenReported = true;
        console.error('[NBAKCAR] 图片加载失败，浏览器实际请求的路径是：' + img.src);
        console.error('[NBAKCAR] 请检查仓库里这个文件是否存在、大小写是否一致（.PNG / .png）');
        var tip = document.createElement('div');
        tip.className = 'placeholder';
        tip.style.color = '#c62828';
        tip.textContent = 'Images not loaded: ' + img.src;
        container.insertBefore(tip, container.firstChild);
      });
    });
  }

  function renderGrid(containerId, pageKey) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var start = (currentPage[pageKey] - 1) * PER_PAGE;
    var pageImages = images.slice(start, start + PER_PAGE);

    if (!pageImages.length) {
      container.innerHTML = '';
      var p = document.createElement('div');
      p.className = 'placeholder';
      p.textContent = t('noResult', currentLang);
      container.appendChild(p);
    } else {
      container.innerHTML = pageImages.map(function (src, i) {
        return cardHTML(src, start + i);
      }).join('');
      bindImageDebug(container);
      container.querySelectorAll('.product-card').forEach(function (card) {
        card.addEventListener('click', function () {
          openLightbox(parseInt(card.getAttribute('data-index'), 10));
        });
      });
      container.querySelectorAll('.video-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var url = btn.getAttribute('data-video');
          if (url) window.open(url, '_blank');
          else alert(t('noVideo', currentLang));
        });
      });
    }

    var nextBtn = document.getElementById('next-' + pageKey);
    if (nextBtn) {
      var isLast = start + PER_PAGE >= images.length;
      nextBtn.textContent = isLast ? t('noMore', currentLang) : t('next', currentLang);
      nextBtn.disabled = isLast;
    }
  }

  function renderAll() {
    renderGrid('home-grid', 'home');
    renderGrid('product-grid', 'products');
  }

  function openLightbox(index) {
    lightboxIndex = index;
    var img = document.getElementById('lightbox-img');
    img.src = images[index];
    document.getElementById('lightbox').classList.add('show');
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('show');
  }

  function lightboxNav(dir) {
    lightboxIndex += dir;
    if (lightboxIndex < 0) lightboxIndex = images.length - 1;
    if (lightboxIndex >= images.length) lightboxIndex = 0;
    document.getElementById('lightbox-img').src = images[lightboxIndex];
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      if (el.tagName === 'INPUT') return;
      el.textContent = el.getAttribute('data-' + lang);
    });

    ['placeholder', 'title', 'alt'].forEach(function (attr) {
      document.querySelectorAll('[data-' + lang + '-' + attr + ']').forEach(function (el) {
        el.setAttribute(attr, el.getAttribute('data-' + lang + '-' + attr));
      });
    });

    var sel = document.getElementById('lang-switch');
    if (sel) sel.value = lang;

    renderAll();
  }

  function switchView(view) {
    document.querySelectorAll('.view-page').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + view);
    });
    document.querySelectorAll('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-nav') === view);
    });
    if (view === 'home') renderGrid('home-grid', 'home');
    if (view === 'products') renderGrid('product-grid', 'products');
  }

  function doSearch() {
    var input = document.getElementById('header-search');
    var q = (input ? input.value : '').trim().toLowerCase();
    if (!q) { switchView('home'); return; }
    switchView('products');

    var matched = images.filter(function (src) {
      var hay = (productNames[src] || '') + ' ' + (productNamesEn[src] || '') + ' ' + src;
      return hay.toLowerCase().indexOf(q) !== -1;
    });

    var container = document.getElementById('product-grid');
    if (!container) return;
    container.innerHTML = '';
    if (!matched.length) {
      var p = document.createElement('div');
      p.className = 'placeholder';
      p.textContent = t('noResult', currentLang);
      container.appendChild(p);
    } else {
      container.innerHTML = matched.map(function (src, i) { return cardHTML(src, i); }).join('');
      bindImageDebug(container);
      container.querySelectorAll('.product-card').forEach(function (card) {
        card.addEventListener('click', function () {
          openLightbox(parseInt(card.getAttribute('data-index'), 10));
        });
      });
    }
    var nextBtn = document.getElementById('next-products');
    if (nextBtn) nextBtn.style.display = 'none';
  }

  function init() {
    applyLanguage('en');

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        switchView(link.getAttribute('data-nav'));
      });
    });

    var trigger = document.querySelector('.contact-trigger');
    var panel = document.getElementById('contact-panel');
    if (trigger && panel) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.toggle('show');
      });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.contact-wrap')) panel.classList.remove('show');
      });
    }

    var sel = document.getElementById('lang-switch');
    if (sel) sel.addEventListener('change', function () { applyLanguage(sel.value); });

    var search = document.getElementById('header-search');
    if (search) {
      var timer = null;
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(doSearch, 200);
      });
    }

    ['home', 'products'].forEach(function (key) {
      var btn = document.getElementById('next-' + key);
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        currentPage[key]++;
        renderGrid(key === 'home' ? 'home-grid' : 'product-grid', key);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    var lb = document.getElementById('lightbox');
    if (lb) {
      document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
      document.getElementById('lightbox-prev').addEventListener('click', function () { lightboxNav(-1); });
      document.getElementById('lightbox-next').addEventListener('click', function () { lightboxNav(1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxNav(-1);
        if (e.key === 'ArrowRight') lightboxNav(1);
      });
    }

    console.log('[NBAKCAR] 已加载图片 ' + images.length + ' 张，默认语言 English');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
