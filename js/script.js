// ===== NBAKCAR 首页交互 =====
// 依赖 index.html 中的元素：
//   #header-search   搜索框
//   #product-grid    商品容器
//   .product-card    商品卡片（.product-title 为名称）
//   #load-more-btn   加载更多按钮
//   .lang-btn        中 / EN 切换按钮
//   .section-title   区块标题（跟随语言切换）

(function () {
  'use strict';

  var PAGE_SIZE = 16; // 首屏显示数量，与 index.html 中前 16 张一致

  var grid = document.getElementById('product-grid');
  var searchInput = document.getElementById('header-search');
  var loadBtn = document.getElementById('load-more-btn');
  var sectionTitle = document.querySelector('.section-title');
  if (!grid) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
  var expanded = false;

  // 文案
  var i18n = {
    zh: {
      title: '热门商品 · Featured',
      placeholder: '搜索商品...',
      more: '加载更多',
      all: '已显示全部',
      empty: '没有找到相关商品',
      clear: '清空搜索'
    },
    en: {
      title: 'Featured Products',
      placeholder: 'Search products...',
      more: 'Load More',
      all: 'All Loaded',
      empty: 'No products found',
      clear: 'Clear Search'
    }
  };
  var lang = 'zh';

  // ---------- 显示逻辑 ----------
  function applyVisibility() {
    var kw = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var matched = 0;

    cards.forEach(function (card, index) {
      var titleEl = card.querySelector('.product-title');
      var text = titleEl ? titleEl.textContent.toLowerCase() : '';
      var hit = kw === '' || text.indexOf(kw) > -1;
      if (hit) matched++;

      // 搜索时忽略分页，全部匹配项都显示；未搜索时按分页
      var withinPage = expanded || index < PAGE_SIZE;
      card.style.display = hit && withinPage ? '' : 'none';
    });

    showTip(kw !== '' && matched === 0);

    // 按钮状态
    if (loadBtn) {
      if (kw !== '') {
        loadBtn.style.display = 'none';
      } else {
        loadBtn.style.display = '';
        loadBtn.textContent = expanded ? i18n[lang].all : i18n[lang].more;
        loadBtn.disabled = expanded;
      }
    }
  }

  function showTip(show) {
    var tip = document.getElementById('no-results');
    if (show) {
      if (!tip) {
        tip = document.createElement('div');
        tip.id = '#no-results'.replace('#', '');
        tip.className = 'no-results';
        grid.appendChild(tip);
      }
      tip.textContent = i18n[lang].empty;
      tip.style.display = '';
    } else if (tip) {
      tip.remove();
    }
  }

  // ---------- 搜索 ----------
  if (searchInput) {
    searchInput.addEventListener('input', applyVisibility);
  }

  // ---------- 加载更多 ----------
  if (loadBtn) {
    loadBtn.addEventListener('click', function () {
      expanded = true;
      applyVisibility();
    });
  }

  // ---------- 语言切换 ----------
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lang = btn.getAttribute('data-lang') === 'en' ? 'en' : 'zh';

      document.querySelectorAll('.lang-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      if (sectionTitle) sectionTitle.textContent = i18n[lang].title;
      if (searchInput) searchInput.setAttribute('placeholder', i18n[lang].placeholder);
      applyVisibility();
    });
  });

  // ---------- 初始化 ----------
  applyVisibility();
})();
