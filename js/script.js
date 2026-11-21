(function(){
  'use strict';

  // ===== 图片数据（严格按你之前能用的路径）=====
  var images = [];
  for (var i = 1; i <= 20; i++) {
    var num = String(i + 100).slice(1); // 101~120
    images.push('images/NBAKCAR00' + num + '.PNG');
  }

  var PER_PAGE = 9;
  var currentPage = { home: 1, products: 1 };
  var currentLang = 'zh';
  var lightboxIndex = 0;
  var lightboxList = [];

  // ===== 生成卡片 HTML =====
  function cardHTML(src, index) {
    var name = src.replace('images/', '').replace('.PNG', '');
    return '<article class="product-card" data-index="' + index + '">' +
      '<img src="' + src + '" alt="' + name + '" loading="lazy">' +
      '<div class="product-info">' +
        '<div class="product-title">' + name + '</div>' +
      '</div>' +
      '<button class="video-btn" data-video="" onclick="event.stopPropagation()">&#9654; ' + (currentLang==='en'?'Video':currentLang==='es'?'Video':currentLang==='ja'?'動画':currentLang==='ar'?'فيديو':'视频') + '</button>' +
    '</article>';
  }

  // ===== 渲染网格 + 分页 =====
  function renderGrid(containerId, paginationId, pageKey) {
    var container = document.getElementById(containerId);
    var pagination = document.getElementById(paginationId);
    if (!container) return;

    var page = currentPage[pageKey];
    var start = (page - 1) * PER_PAGE;
    var end = start + PER_PAGE;
    var pageImages = images.slice(start, end);

    container.innerHTML = '';
    pageImages.forEach(function(src, i) {
      container.innerHTML += cardHTML(src, start + i);
    });

    // 绑定灯箱
    container.querySelectorAll('.product-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-index'));
        openLightbox(idx);
      });
    });

    // 视频按钮
    container.querySelectorAll('.video-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var videoUrl = this.getAttribute('data-video');
        if (videoUrl) {
          window.open(videoUrl, '_blank');
        } else {
          alert(currentLang === 'zh' ? '视频链接待添加' : 'Video link to be added');
        }
      });
    });

    // 分页
    if (pagination) {
      var totalPages = Math.ceil(images.length / PER_PAGE);
      var html = '';
      html += '<button class="page-btn" data-dir="prev"' + (page <= 1 ? ' disabled' : '') + '>&#8249;</button>';
      for (var p = 1; p <= totalPages; p++) {
        html += '<button class="page-btn' + (p === page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
      }
      html += '<button class="page-btn" data-dir="next"' + (page >= totalPages ? ' disabled' : '') + '>&#8250;</button>';
      pagination.innerHTML = html;

      pagination.querySelectorAll('[data-page]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          currentPage[pageKey] = parseInt(this.getAttribute('data-page'));
          renderGrid(containerId, paginationId, pageKey);
          document.getElementById(containerId).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      pagination.querySelectorAll('[data-dir]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var dir = this.getAttribute('data-dir');
          if (dir === 'prev' && currentPage[pageKey] > 1) currentPage[pageKey]--;
          if (dir === 'next' && currentPage[pageKey] < totalPages) currentPage[pageKey]++;
          renderGrid(containerId, paginationId, pageKey);
          document.getElementById(containerId).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }

  // ===== 灯箱 =====
  function openLightbox(index) {
    lightboxIndex = index;
    lightboxList = images;
    var lb = document.getElementById('lightbox');
    var img = document.getElementById('lightbox-img');
    img.src = images[index];
    lb.classList.add('show');
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

  // ===== 语言切换 =====
  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : (lang === 'en' ? 'en' : lang);
    document.querySelectorAll('[data-' + lang + ']').forEach(function(el) {
      el.textContent = el.getAttribute('data-' + lang + '');
    });
    // 重新渲染当前视图
    renderGrid('home-grid', 'home-pagination', 'home');
    renderGrid('product-grid', 'products-pagination', 'products');
  }

  // ===== 菜单导航 =====
  function switchView(view) {
    document.querySelectorAll('.view-page').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
    if (view === 'home') {
      document.getElementById('view-home').classList.add('active');
      document.querySelector('[data-nav="home"]').classList.add('active');
      renderGrid('home-grid', 'home-pagination', 'home');
    } else if (view === 'products') {
      document.getElementById('view-products').classList.add('active');
      document.querySelector('[data-nav="products"]').classList.add('active');
      renderGrid('product-grid', 'products-pagination', 'products');
    } else if (view === 'factory') {
      document.getElementById('view-factory').classList.add('active');
      document.querySelector('[data-nav="factory"]').classList.add('active');
    }
  }

  // ===== 搜索 =====
  function doSearch() {
    var q = document.getElementById('header-search').value.trim().toLowerCase();
    if (!q) {
      switchView('home');
      return;
    }
    switchView('products');
    var container = document.getElementById('product-grid');
    var filtered = images.filter(function(src) {
      return src.toLowerCase().indexOf(q) !== -1;
    });
    if (filtered.length === 0) {
      container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--gray);padding:40px">No results</p>';
      document.getElementById('products-pagination').innerHTML = '';
      return;
    }
    container.innerHTML = '';
    filtered.forEach(function(src, i) {
      container.innerHTML += cardHTML(src, i);
    });
    document.getElementById('products-pagination').innerHTML = '';
  }

  // ===== 初始化 =====
  function init() {
    // 初始渲染
    renderGrid('home-grid', 'home-pagination', 'home');

    // 菜单点击
    document.querySelectorAll('[data-nav]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        switchView(this.getAttribute('data-nav'));
      });
    });

    // 联系我们
    document.querySelector('.contact-trigger').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('contact-panel').classList.toggle('show');
    });

    // 点击空白关联系面板
    document.addEventListener('click', function(e) {
      var panel = document.getElementById('contact-panel');
      if (!e.target.closest('.contact-trigger') && !e.target.closest('.contact-panel')) {
        panel.classList.remove('show');
      }
    });

    // 语言切换
    document.getElementById('lang-switch').addEventListener('change', function() {
      applyLanguage(this.value);
    });

    // 搜索
    document.getElementById('header-search').addEventListener('input', doSearch);

    // 灯箱事件
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', function() { lightboxNav(-1); });
    document.getElementById('lightbox-next').addEventListener('click', function() { lightboxNav(1); });
    document.getElementById('lightbox').addEventListener('click', function(e) {
      if (e.target === this) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (!document.getElementById('lightbox').classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxNav(-1);
      if (e.key === 'ArrowRight') lightboxNav(1);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
