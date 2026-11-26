/* ============================================================
   NBAKCAR 产品展示 — main.js
   纯静态版（GitHub Pages 可直接用，无后端依赖）
   ------------------------------------------------------------
   优化点：
   1. 渲染逻辑合并，首页 / 产品页共用一套函数，消除重复代码
   2. 完整分页：上一页 + 页码（智能省略）+ 下一页 + 页码信息
   3. 多语言文案补全（分页、空结果、图片错误、加载提示）
   4. 搜索同时匹配「产品名 + 产品编号」
   5. 产品数据抽成 JSON 风格数组，增删产品只改 PRODUCTS
   6. 搜索 300ms 防抖，避免频繁重绘
   7. 图片懒加载 loading="lazy"
   8. 预留 fetchProducts() 异步入口，将来接后端只改这一处
   ============================================================ */
'use strict';

/* ============================================================
   1. 全局状态
   ============================================================ */
var currentLang = 'en';
var currentPage = 1;          // 首页当前页
var currentProductPage = 1;   // 产品页当前页
var productsPerPage = 8;
var searchKeyword = '';

/* ============================================================
   2. 产品数据（唯一数据源）
   ------------------------------------------------------------
   以后加产品，只需要在下面数组里加一行：
   { id: 'NBAKCAR00121', image: 'images/NBAKCAR00121.PNG', name: '座椅靠背覆盖', video: '' }
   ============================================================ */
var PRODUCTS = [
  { id: 'NBAKCAR00101', image: 'images/NBAKCAR00101.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00102', image: 'images/NBAKCAR00102.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00103', image: 'images/NBAKCAR00103.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00104', image: 'images/NBAKCAR00104.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00105', image: 'images/NBAKCAR00105.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00106', image: 'images/NBAKCAR00106.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00107', image: 'images/NBAKCAR00107.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00108', image: 'images/NBAKCAR00108.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00109', image: 'images/NBAKCAR00109.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00110', image: 'images/NBAKCAR00110.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00111', image: 'images/NBAKCAR00111.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00112', image: 'images/NBAKCAR00112.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00113', image: 'images/NBAKCAR00113.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00114', image: 'images/NBAKCAR00114.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00115', image: 'images/NBAKCAR00115.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00116', image: 'images/NBAKCAR00116.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00117', image: 'images/NBAKCAR00117.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00118', image: 'images/NBAKCAR00118.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00119', image: 'images/NBAKCAR00119.PNG', name: '座椅靠背覆盖', video: '' },
  { id: 'NBAKCAR00120', image: 'images/NBAKCAR00120.PNG', name: '座椅靠背覆盖', video: '' }
];

/* ============================================================
   3. 多语言产品名
   ============================================================ */
var langMap = {
  '座椅靠背覆盖': {
    en: 'Seat Back Cover',
    es: 'Cubierta del Respaldo',
    ja: 'シートバックカバー',
    ar: 'غطاء ظهر المقعد'
  }
};

/* ============================================================
   4. UI 多语言文案（补全版）
   ============================================================ */
var uiText = {
  nextPage:    { zh: '下一页',       en: 'Next',            es: 'Siguiente',       ja: '次のページ',     ar: 'التالي' },
  prevPage:    { zh: '上一页',       en: 'Prev',            es: 'Anterior',        ja: '前のページ',     ar: 'السابق' },
  noMore:      { zh: '没有更多了',   en: 'No More',         es: 'No hay más',      ja: 'これ以上なし',   ar: 'لا مزيد' },
  imgError:    { zh: '图片加载失败', en: 'Image failed',    es: 'Error al cargar', ja: '読み込み失敗',   ar: 'فشل التحميل' },
  emptyResult: { zh: '没有找到匹配的产品', en: 'No products found', es: 'No se encontraron productos', ja: '該当する製品がありません', ar: 'لم يتم العثور على منتجات' },
  pageInfo:    { zh: '第 {cur} / {total} 页', en: 'Page {cur} of {total}', es: 'Página {cur} de {total}', ja: '{cur} / {total} ページ', ar: 'صفحة {cur} من {total}' }
};

function getLangText(key) {
  var entry = uiText[key];
  if (!entry) return '';
  return entry[currentLang] || entry.en || '';
}

/* ============================================================
   5. 兼容层
   ------------------------------------------------------------
   保留你原来的 productBaseNames / productVideos 变量，
   这样即使 HTML 里有别的地方引用也不会报错。
   两者现在都由 PRODUCTS 自动生成，不用再手动维护两份。
   ============================================================ */
var productBaseNames = {};
var productVideos = {};

(function buildLegacyMaps() {
  for (var i = 0; i < PRODUCTS.length; i++) {
    productBaseNames[PRODUCTS[i].image] = PRODUCTS[i].name;
    productVideos[PRODUCTS[i].image] = PRODUCTS[i].video || '';
  }
})();

function getProductName(imgSrc) {
  var baseName = productBaseNames[imgSrc] || '座椅靠背覆盖';
  if (currentLang === 'zh') return baseName;
  var translated = langMap[baseName];
  if (translated && translated[currentLang]) return translated[currentLang];
  return baseName;
}

function getProductVideo(imgSrc) {
  return productVideos[imgSrc] || '';
}

/* 由图片路径取产品编号，用于搜索匹配 */
function getProductCode(imgSrc) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].image === imgSrc) return PRODUCTS[i].id;
  }
  return '';
}

/* ============================================================
   6. 数据获取入口（异步预留）
   ------------------------------------------------------------
   现在直接返回本地 PRODUCTS。
   将来接后端时，把 return 换成：
     return fetch('https://你的域名/api/products')
       .then(function(r){ return r.json(); })
       .then(function(list){ PRODUCTS = list; buildLegacyMaps(); });
   ============================================================ */
function fetchProducts() {
  return Promise.resolve(PRODUCTS);
}

/* ============================================================
   7. 语言切换
   ============================================================ */
function applyLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem('nbakcar_lang', lang); } catch (e) {}

  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  var elements = document.querySelectorAll('[data-' + lang + ']');
  for (var i = 0; i < elements.length; i++) {
    var text = elements[i].getAttribute('data-' + lang);
    if (text !== null) elements[i].textContent = text;
  }

  var placeholders = document.querySelectorAll('[data-' + lang + '-placeholder]');
  for (var j = 0; j < placeholders.length; j++) {
    var ph = placeholders[j].getAttribute('data-' + lang + '-placeholder');
    if (ph !== null) placeholders[j].placeholder = ph;
  }

  var homeSec = document.getElementById('home-section');
  if (homeSec && homeSec.style.display !== 'none') renderHomePage();

  var prodSec = document.getElementById('product-section');
  if (prodSec && prodSec.style.display !== 'none') renderProductPage();

  var indicator = document.getElementById('lang-indicator');
  if (indicator) {
    var labels = { zh: '中', en: 'EN', es: 'ES', ja: '日', ar: 'ع' };
    indicator.textContent = labels[lang] || lang.toUpperCase();
  }

  // 搜索框 placeholder 兜底（当 HTML 没写 data-xx-placeholder 时）
  var searchInput = document.getElementById('header-search');
  if (searchInput && !searchInput.getAttribute('data-' + lang + '-placeholder')) {
    searchInput.placeholder = getLangText('searchPlaceholder');
  }
}

/* ============================================================
   8. 过滤 & 分页（共用）
   ============================================================ */
function getFilteredImages() {
  var all = [];
  for (var key in productBaseNames) {
    if (productBaseNames.hasOwnProperty(key)) all.push(key);
  }

  var kw = searchKeyword;
  if (!kw) return all;

  return all.filter(function (img) {
    var name = getProductName(img).toLowerCase();
    var code = getProductCode(img).toLowerCase();
    return name.indexOf(kw) !== -1 || code.indexOf(kw) !== -1;
  });
}

/* 生成页码序列，带智能省略号 */
function buildPageNumbers(cur, total) {
  if (total <= 7) {
    var arr = [];
    for (var i = 1; i <= total; i++) arr.push(i);
    return arr;
  }
  var pages = [1];
  if (cur > 3) pages.push('...');
  var start = Math.max(2, cur - 1);
  var end = Math.min(total - 1, cur + 1);
  for (var j = start; j <= end; j++) pages.push(j);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

/* ============================================================
   9. 渲染（首页 / 产品页共用核心逻辑）
   ============================================================ */
function renderGrid(cfg) {
  var grid = document.getElementById(cfg.gridId);
  if (!grid) return;
  grid.innerHTML = '';

  var filtered = getFilteredImages();
  var totalPages = Math.max(1, Math.ceil(filtered.length / productsPerPage));

  // 搜索或语言变化后，当前页可能越界，修正一下
  if (cfg.getPage() > totalPages) cfg.setPage(totalPages);
  var cur = cfg.getPage();

  var start = (cur - 1) * productsPerPage;
  var pageImages = filtered.slice(start, start + productsPerPage);

  // 空结果
  if (pageImages.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = getLangText('emptyResult');
    grid.appendChild(empty);
  }

  for (var i = 0; i < pageImages.length; i++) {
    var imgSrc = pageImages[i];
    var card = document.createElement('div');
    card.className = 'product-card';

    var img = document.createElement('img');
    img.src = imgSrc;
    img.alt = getProductName(imgSrc);
    img.loading = 'lazy';
    img.onerror = (function (src) {
      return function () {
        this.style.display = 'none';
        var err = document.createElement('div');
        err.className = 'img-error';
        err.textContent = getLangText('imgError');
        this.parentNode.insertBefore(err, this.nextSibling);
      };
    })(imgSrc);

    var title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = getProductName(imgSrc);

    card.appendChild(img);
    card.appendChild(title);
    grid.appendChild(card);
  }

  renderPagination(cfg, filtered.length, totalPages, cur);
}

/* 分页控件：优先渲染 #xxx-pagination 容器，找不到则回退到原来的「下一页」按钮 */
function renderPagination(cfg, total, totalPages, cur) {
  var pagEl = document.getElementById(cfg.pagId);
  var nextBtn = document.getElementById(cfg.btnId);

  // ---- 新写法：分页容器 ----
  if (pagEl) {
    pagEl.innerHTML = '';

    if (total === 0) {
      var info0 = document.createElement('span');
      info0.className = 'page-info';
      info0.textContent = getLangText('emptyResult');
      pagEl.appendChild(info0);
      if (nextBtn) { nextBtn.textContent = getLangText('noMore'); nextBtn.disabled = true; nextBtn.classList.add('disabled'); }
      return;
    }

    // 上一页
    var prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.textContent = '‹ ' + getLangText('prevPage');
    prev.disabled = (cur <= 1);
    prev.addEventListener('click', function () {
      if (cfg.getPage() > 1) { cfg.setPage(cfg.getPage() - 1); renderGrid(cfg); }
    });
    pagEl.appendChild(prev);

    // 页码
    var nums = buildPageNumbers(cur, totalPages);
    for (var i = 0; i < nums.length; i++) {
      (function (p) {
        var btn = document.createElement('button');
        btn.className = 'page-btn';
        if (p === '...') {
          btn.textContent = '...';
          btn.disabled = true;
          btn.style.border = 'none';
          btn.style.background = 'transparent';
          btn.style.cursor = 'default';
        } else {
          btn.textContent = p;
          if (p === cur) btn.classList.add('active');
          btn.addEventListener('click', function () {
            cfg.setPage(p);
            renderGrid(cfg);
          });
        }
        pagEl.appendChild(btn);
      })(nums[i]);
    }

    // 下一页
    var next = document.createElement('button');
    next.className = 'page-btn';
    next.textContent = getLangText('nextPage') + ' ›';
    next.disabled = (cur >= totalPages);
    next.addEventListener('click', function () {
      if (cfg.getPage() < totalPages) { cfg.setPage(cfg.getPage() + 1); renderGrid(cfg); }
    });
    pagEl.appendChild(next);

    // 页码信息
    var info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = getLangText('pageInfo')
      .replace('{cur}', cur)
      .replace('{total}', totalPages);
    pagEl.appendChild(info);

    // 兼容：同步旧按钮状态
    if (nextBtn) {
      nextBtn.textContent = (cur >= totalPages) ? getLangText('noMore') : getLangText('nextPage');
      nextBtn.disabled = (cur >= totalPages);
      nextBtn.classList.toggle('disabled', cur >= totalPages);
    }
    return;
  }

  // ---- 回退写法：只更新原来的「下一页」按钮 ----
  if (!nextBtn) return;
  var end = cur * productsPerPage;
  if (end >= total) {
    nextBtn.textContent = getLangText('noMore');
    nextBtn.disabled = true;
    nextBtn.classList.add('disabled');
  } else {
    nextBtn.textContent = getLangText('nextPage');
    nextBtn.disabled = false;
    nextBtn.classList.remove('disabled');
  }
}

var homeConfig = {
  gridId: 'home-grid',
  btnId: 'home-next-btn',
  pagId: 'home-pagination',
  getPage: function () { return currentPage; },
  setPage: function (p) { currentPage = p; }
};

var productConfig = {
  gridId: 'product-grid',
  btnId: 'product-next-btn',
  pagId: 'product-pagination',
  getPage: function () { return currentProductPage; },
  setPage: function (p) { currentProductPage = p; }
};

function renderHomePage() {
  renderGrid(homeConfig);
}

function renderProductPage() {
  renderGrid(productConfig);
}

/* ============================================================
   10. 页面切换
   ============================================================ */
function showSection(section) {
  var map = {
    home: 'home-section',
    products: 'product-section',
    factory: 'factory-section'
  };

  for (var key in map) {
    if (!map.hasOwnProperty(key)) continue;
    var el = document.getElementById(map[key]);
    if (el) el.style.display = (key === section) ? 'block' : 'none';
  }

  if (section === 'home') renderHomePage();
  if (section === 'products') renderProductPage();
}

function setActiveNav(nav) {
  var links = document.querySelectorAll('.nav-links a');
  for (var i = 0; i < links.length; i++) links[i].classList.remove('active');
  var activeLink = document.getElementById('nav-' + nav);
  if (activeLink) activeLink.classList.add('active');
}

/* ============================================================
   11. 联系面板
   ============================================================ */
function toggleContactPanel() {
  var panel = document.getElementById('contact-panel');
  if (!panel) return;
  panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}

/* ============================================================
   12. 初始化
   ============================================================ */
function init() {
  var savedLang = 'en';
  try { savedLang = localStorage.getItem('nbakcar_lang') || 'en'; } catch (e) {}
  currentLang = savedLang;
  applyLanguage(currentLang);

  var langSwitch = document.getElementById('lang-switch');
  if (langSwitch) {
    langSwitch.value = currentLang;
    langSwitch.addEventListener('change', function () {
      applyLanguage(this.value);
    });
  }

  var navHome = document.getElementById('nav-home');
  if (navHome) navHome.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('home');
    setActiveNav('home');
  });

  var navProducts = document.getElementById('nav-products');
  if (navProducts) navProducts.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('products');
    setActiveNav('products');
  });

  var navFactory = document.getElementById('nav-factory');
  if (navFactory) navFactory.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('factory');
    setActiveNav('factory');
  });

  var navContact = document.getElementById('nav-contact');
  if (navContact) navContact.addEventListener('click', function (e) {
    e.preventDefault();
    toggleContactPanel();
  });

  var contactBtn = document.getElementById('contact-btn');
  if (contactBtn) contactBtn.addEventListener('click', function (e) {
    e.preventDefault();
    toggleContactPanel();
  });

  // 搜索（300ms 防抖）
  var searchTimer = null;
  var searchInput = document.getElementById('header-search');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var val = this.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        searchKeyword = val.toLowerCase().trim();
        currentPage = 1;
        currentProductPage = 1;
        var homeSec = document.getElementById('home-section');
        if (homeSec && homeSec.style.display !== 'none') renderHomePage();
        var prodSec = document.getElementById('product-section');
        if (prodSec && prodSec.style.display !== 'none') renderProductPage();
      }, 300);
    });
  }

  // 旧的「下一页」按钮兼容绑定
  var homeNext = document.getElementById('home-next-btn');
  if (homeNext) homeNext.addEventListener('click', function () {
    currentPage++;
    renderHomePage();
  });

  var productNext = document.getElementById('product-next-btn');
  if (productNext) productNext.addEventListener('click', function () {
    currentProductPage++;
    renderProductPage();
  });

  // 拉取数据（当前为本地数据，接后端时改 fetchProducts 即可）
  fetchProducts().then(function () {
    renderHomePage();
    showSection('home');
    setActiveNav('home');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
