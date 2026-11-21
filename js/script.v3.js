
// v3 - 8张/页，连续下一页，工厂展示空白
(function(){
  'use strict';

  var images = [];
  for (var i = 1; i <= 20; i++) {
    var num = String(i + 100).slice(1);
    images.push('images/NBAKCAR00' + num + '.PNG');
  }

  var PER_PAGE = 8;
  var currentPage = { home: 1, products: 1 };
  var currentLang = 'zh';
  var lightboxIndex = 0;

  function cardHTML(src, index) {
    var name = src.replace('images/', '').replace('.PNG', '');
    var videoText = currentLang==='en'?'Video':currentLang==='es'?'Video':currentLang==='ja'?'動画':currentLang==='ar'?'فيديو':'视频';
    return '<article class="product-card" data-index="' + index + '">' +
      '<img src="' + src + '" alt="' + name + '" loading="lazy">' +
      '<div class="product-info">' +
        '<div class="product-title">' + name + '</div>' +
      '</div>' +
      '<button class="video-btn" data-video="" onclick="event.stopPropagation()">&#9654; ' + videoText + '</button>' +
    '</article>';
  }

  function renderGrid(containerId, pageKey) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var page = currentPage[pageKey];
    var start = (page - 1) * PER_PAGE;
    var end = start + PER_PAGE;
    var pageImages = images.slice(start, end);

    container.innerHTML = '';
    pageImages.forEach(function(src, i) {
      container.innerHTML += cardHTML(src, start + i);
    });

    container.querySelectorAll('.product-card').forEach(function(card) {
      card.addEventListener('click', function() {
        openLightbox(parseInt(this.getAttribute('data-index')));
      });
    });

    container.querySelectorAll('.video-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var url = this.getAttribute('data-video');
        if (url) { window.open(url, '_blank'); }
        else { alert(currentLang==='zh'?'视频链接待添加':currentLang==='en'?'Video link to be added':currentLang==='es'?'Video por agregar':currentLang==='ja'?'動画リンク未追加':'فيديو سيتم إضافته'); }
      });
    });

    var nextBtn = document.getElementById('next-' + pageKey);
    if (nextBtn) {
      if (end >= images.length) {
        nextBtn.textContent = currentLang==='zh'?'没有更多了':currentLang==='en'?'No more':currentLang==='es'?'No hay más':currentLang==='ja'?'これ以上なし':'لا المزيد';
        nextBtn.disabled = true;
      } else {
        nextBtn.textContent = currentLang==='zh'?'下一页':currentLang==='en'?'Next Page':currentLang==='es'?'Siguiente':currentLang==='ja'?'次のページ':'الصفحة التالية';
        nextBtn.disabled = false;
      }
    }
  }

  function openLightbox(index) {
    lightboxIndex = index;
    document.getElementById('lightbox-img').src = images[index];
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
    document.querySelectorAll('[data-' + lang + ']').forEach(function(el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
    renderGrid('home-grid', 'home');
    renderGrid('product-grid', 'products');
  }

  function switchView(view) {
    document.querySelectorAll('.view-page').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
    if (view === 'home') {
      document.getElementById('view-home').classList.add('active');
      document.querySelector('[data-nav="home"]').classList.add('active');
      renderGrid('home-grid', 'home');
    } else if (view === 'products') {
      document.getElementById('view-products').classList.add('active');
      document.querySelector('[data-nav="products"]').classList.add('active');
      renderGrid('product-grid', 'products');
    } else if (view === 'factory') {
      document.getElementById('view-factory').classList.add('active');
      document.querySelector('[data-nav="factory"]').classList.add('active');
    }
  }

  function doSearch() {
    var q = document.getElementById('header-search').value.trim().toLowerCase();
    if (!q) { switchView('home'); return; }
    switchView('products');
    var container = document.getElementById('product-grid');
    var filtered = images.filter(function(src) {
      return src.toLowerCase().indexOf(q) !== -1;
    });
    if (filtered.length === 0) {
      container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888;padding:40px">No results</p>';
      return;
    }
    container.innerHTML = '';
    filtered.forEach(function(src, i) {
      container.innerHTML += cardHTML(src, i);
    });
  }

  function init() {
    renderGrid('home-grid', 'home');

    document.querySelectorAll('[data-nav]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        switchView(this.getAttribute('data-nav'));
      });
    });

    document.querySelector('.contact-trigger').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('contact-panel').classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
      var panel = document.getElementById('contact-panel');
      if (!e.target.closest('.contact-trigger') && !e.target.closest('.contact-panel')) {
        panel.classList.remove('show');
      }
    });

    document.getElementById('lang-switch').addEventListener('change', function() {
      applyLanguage(this.value);
    });

    document.getElementById('header-search').addEventListener('input', doSearch);

    ['home','products'].forEach(function(key) {
      var btn = document.getElementById('next-' + key);
      if (btn) {
        btn.addEventListener('click', function() {
          if (this.disabled) return;
          currentPage[key]++;
          renderGrid(key === 'home' ? 'home-grid' : 'product-grid', key);
          document.getElementById(key === 'home' ? 'view-home' : 'view-products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });

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
