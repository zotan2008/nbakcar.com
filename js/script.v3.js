// ============================================================
//  NBAKCAR 展厅  script.v3.js
//  以后加图 / 改名字，只改下面「配置区」三张表就行
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

  // 2) 中文显示名：客户看到的中文。20 张全部叫「座椅靠背覆盖」
  var productNames = {
    'images/NBAKCAR00101.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00102.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00103.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00104.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00105.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00106.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00107.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00108.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00109.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00110.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00111.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00112.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00113.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00114.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00115.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00116.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00117.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00118.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00119.PNG': '座椅靠背覆盖',
    'images/NBAKCAR00120.PNG': '座椅靠背覆盖'
  };

  // 3) 英文显示名：切英文时看到的。20 张全部叫「Seat Back Cover」
  var productNamesEn = {
    'images/NBAKCAR00101.PNG': 'Seat Back Cover',
    'images/NBAKCAR00102.PNG': 'Seat Back Cover',
    'images/NBAKCAR00103.PNG': 'Seat Back Cover',
    'images/NBAKCAR00104.PNG': 'Seat Back Cover',
    'images/NBAKCAR00105.PNG': 'Seat Back Cover',
    'images/NBAKCAR00106.PNG': 'Seat Back Cover',
    'images/NBAKCAR00107.PNG': 'Seat Back Cover',
    'images/NBAKCAR00108.PNG': 'Seat Back Cover',
    'images/NBAKCAR00109.PNG': 'Seat Back Cover',
    'images/NBAKCAR00110.PNG': 'Seat Back Cover',
    'images/NBAKCAR00111.PNG': 'Seat Back Cover',
    'images/NBAKCAR00112.PNG': 'Seat Back Cover',
    'images/NBAKCAR00113.PNG': 'Seat Back Cover',
    'images/NBAKCAR00114.PNG': 'Seat Back Cover',
    'images/NBAKCAR00115.PNG': 'Seat Back Cover',
    'images/NBAKCAR00116.PNG': 'Seat Back Cover',
    'images/NBAKCAR00117.PNG': 'Seat Back Cover',
    'images/NBAKCAR00118.PNG': 'Seat Back Cover',
    'images/NBAKCAR00119.PNG': 'Seat Back Cover',
    'images/NBAKCAR00120.PNG': 'Seat Back Cover'
  };

  // 视频链接（以后填，格式：'images/xxx.PNG': 'https://...'）
  var productVideos = {};

  // 每页显示几张
  var PER_PAGE = 8;

  /* ================== 配置区结束，下面不用动 ================== */

  var currentLang = 'en';               // 默认英文
  var currentPage = { home: 1, products: 1 };
  var searching = false;

  function getTitle(src) {
    if (currentLang === 'en') return productNamesEn[src] || productNames[src] || '';
    return productNames[src] || productNamesEn[src] || '';
  }

  function getVideo(src) { return productVideos[src] || ''; }

  function videoLabel() {
    var m = { zh: '▶ 视频', en: '▶ Video', es: '▶ Video', ja: '▶ 動画', ar: '▶ فيديو' };
    return m[currentLang] || '▶ Video';
  }
  function videoTip() {
    var m = { zh: '视频链接待添加', en: 'Video link to be added', es: 'Enlace de video por añadir', ja: '動画リンク未追加', ar: 'رابط الفيديو سيُضاف' };
    return m[currentLang] || 'Video link to be added';
  }
  function noMoreLabel() {
    var m = { zh: '没有更多了', en: 'No more', es: 'No hay más', ja: 'これ以上なし', ar: 'لا المزيد' };
    return m[currentLang] || 'No more';
  }
  function nextLabel() {
    var m = { zh: '下一页', en: 'Next Page', es: 'Siguiente', ja: '次のページ', ar: 'الصفحة التالية' };
    return m[currentLang] || 'Next Page';
  }

  function cardHTML(src, index) {
    var title = getTitle(src);
    var vid = getVideo(src);
    return '<article class="product-card" data-index="' + index + '">' +
      '<img class="thumb" src="' + src + '" alt="' + title + '" loading="lazy">' +
      '<div class="product-info"><div class="product-title">' + title + '</div></div>' +
      '<div class="video-slot"><button class="video-btn" type="button" data-video="' + vid + '">' + videoLabel() + '</button></div>' +
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
        else { alert(videoTip()); }
      });
    });
  }

  function renderGrid(gridId, pagerKey) {
    var container = document.getElementById(gridId);
    if (!container) return;

    var list = images;
    var page = currentPage[pagerKey];
    var start = (page - 1) * PER_PAGE;
    var slice = list.slice(start, start + PER_PAGE);

    container.innerHTML = '';
    slice.forEach(function (src, i) { container.insertAdjacentHTML('beforeend', cardHTML(src, start + i)); });
    bindCards(container);

    var btn = document.getElementById('next-' + pagerKey);
    if (btn) {
      if (start + PER_PAGE >= list.length) {
        btn.textContent = noMoreLabel();
        btn.disabled = true;
      } else {
        btn.textContent = nextLabel();
        btn.disabled = false;
      }
    }
  }

  function renderSearch(q) {
    var container = document.getElementById('product-grid');
    var noRes = document.getElementById('no-result');
    var matched = images.filter(function (src) {
      var hay = (productNames[src] || '') + ' ' + (productNamesEn[src] || '') + ' ' + src;
      return hay.toLowerCase().indexOf(q) !== -1;
    });
    container.innerHTML = '';
    matched.forEach(function (src, i) { container.insertAdjacentHTML('beforeend', cardHTML(src, i)); });
    bindCards(container);
    if (noRes) noRes.style.display = matched.length ? 'none' : 'block';
    var btn = document.getElementById('next-products');
    if (btn) { btn.textContent = nextLabel(); btn.disabled = true; }
  }

  /* ---------- 语言切换 ---------- */
  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang);

    // 自检标记：显示当前语言，确认新 JS 已生效（不想显示可删掉这几行）
    var badge = document.getElementById('lang-badge');
    if (badge) {
      badge.textContent = ({ zh: '中', en: 'EN', es: 'ES', ja: '日', ar: 'ع' })[lang] || lang;
      badge.setAttribute('title', 'current language: ' + lang);
    }

    // 1) 普通文本
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
    // 2) placeholder 等属性
    ['placeholder', 'title', 'alt'].forEach(function (attr) {
      document.querySelectorAll('[data-' + lang + '-' + attr + ']').forEach(function (el) {
        el.setAttribute(attr, el.getAttribute('data-' + lang + '-' + attr));
      });
    });
    // 3) 重画卡片（标题跟随语言）
    if (searching) {
      var q = (document.getElementById('header-search').value || '').trim().toLowerCase();
      if (q) { renderSearch(q); return; }
      searching = false;
    }
    currentPage.home = 1;
    currentPage.products = 1;
    renderGrid('home-grid', 'home');
    renderGrid('product-grid', 'products');
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
    // 切走时清搜索
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
    document.getElementById('lb-cap').textContent = getTitle(images[i]);
    document.getElementById('lightbox').classList.add('show');
  }
  function closeLightbox() { document.getElementById('lightbox').classList.remove('show'); }
  function lightboxNav(d) {
    lightboxIndex = (lightboxIndex + d + images.length) % images.length;
    openLightbox(lightboxIndex);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    // 菜单 / LOGO 点击
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
      langSel.value = currentLang;                 // 保证下拉与默认语言一致
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

    // 应用默认语言（英文）并渲染
    applyLanguage(currentLang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
