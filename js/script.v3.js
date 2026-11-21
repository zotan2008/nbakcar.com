var currentLang = 'en';
var currentPage = 1;
var currentProductPage = 1;
var productsPerPage = 8;
var searchKeyword = '';

var productBaseNames = {
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

var langMap = {
  '座椅靠背覆盖': {
    en: 'Seat Back Cover',
    es: 'Cubierta del Respaldo',
    ja: 'シートバックカバー',
    ar: 'غطاء ظهر المقعد'
  }
};

var productVideos = {
  'images/NBAKCAR00101.PNG': '',
  'images/NBAKCAR00102.PNG': '',
  'images/NBAKCAR00103.PNG': '',
  'images/NBAKCAR00104.PNG': '',
  'images/NBAKCAR00105.PNG': '',
  'images/NBAKCAR00106.PNG': '',
  'images/NBAKCAR00107.PNG': '',
  'images/NBAKCAR00108.PNG': '',
  'images/NBAKCAR00109.PNG': '',
  'images/NBAKCAR00110.PNG': '',
  'images/NBAKCAR00111.PNG': '',
  'images/NBAKCAR00112.PNG': '',
  'images/NBAKCAR00113.PNG': '',
  'images/NBAKCAR00114.PNG': '',
  'images/NBAKCAR00115.PNG': '',
  'images/NBAKCAR00116.PNG': '',
  'images/NBAKCAR00117.PNG': '',
  'images/NBAKCAR00118.PNG': '',
  'images/NBAKCAR00119.PNG': '',
  'images/NBAKCAR00120.PNG': ''
};

function getProductName(imgSrc) {
  var baseName = productBaseNames[imgSrc] || '座椅靠背覆盖';
  if (currentLang === 'zh') return baseName;
  var translated = langMap[baseName];
  if (translated && translated[currentLang]) {
    return translated[currentLang];
  }
  return baseName;
}

function getProductVideo(imgSrc) {
  return productVideos[imgSrc] || '';
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('nbakcar_lang', lang);
  document.documentElement.lang = lang;

  var elements = document.querySelectorAll('[data-' + lang + ']');
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var text = el.getAttribute('data-' + lang);
    if (text) el.textContent = text;
  }

  var placeholders = document.querySelectorAll('[data-' + lang + '-placeholder]');
  for (var j = 0; j < placeholders.length; j++) {
    var pel = placeholders[j];
    var ph = pel.getAttribute('data-' + lang + '-placeholder');
    if (ph) pel.placeholder = ph;
  }

  if (document.getElementById('home-section').style.display !== 'none') {
    renderHomePage();
  }
  if (document.getElementById('product-section').style.display !== 'none') {
    renderProductPage();
  }

  var indicator = document.getElementById('lang-indicator');
  if (indicator) {
    var labels = { 'zh': '中', 'en': 'EN', 'es': 'ES', 'ja': '日', 'ar': 'ع' };
    indicator.textContent = labels[lang] || lang.toUpperCase();
  }
}

function init() {
  var savedLang = localStorage.getItem('nbakcar_lang');
  if (savedLang) {
    currentLang = savedLang;
  } else {
    currentLang = 'en';
  }

  applyLanguage(currentLang);

  var langSwitch = document.getElementById('lang-switch');
  if (langSwitch) {
    langSwitch.value = currentLang;
    langSwitch.addEventListener('change', function() {
      applyLanguage(this.value);
    });
  }

  document.getElementById('nav-home').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('home');
    setActiveNav('home');
  });

  document.getElementById('nav-products').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('products');
    setActiveNav('products');
  });

  document.getElementById('nav-factory').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('factory');
    setActiveNav('factory');
  });

  document.getElementById('nav-contact').addEventListener('click', function(e) {
    e.preventDefault();
    toggleContactPanel();
  });

  document.getElementById('contact-btn').addEventListener('click', function(e) {
    e.preventDefault();
    toggleContactPanel();
  });

  document.getElementById('header-search').addEventListener('input', function() {
    searchKeyword = this.value.toLowerCase().trim();
    if (document.getElementById('home-section').style.display !== 'none') {
      currentPage = 1;
      renderHomePage();
    }
    if (document.getElementById('product-section').style.display !== 'none') {
      currentProductPage = 1;
      renderProductPage();
    }
  });

  renderHomePage();
  showSection('home');
  setActiveNav('home');
}

function showSection(section) {
  document.getElementById('home-section').style.display = 'none';
  document.getElementById('product-section').style.display = 'none';
  document.getElementById('factory-section').style.display = 'none';

  if (section === 'home') {
    document.getElementById('home-section').style.display = 'block';
    renderHomePage();
  } else if (section === 'products') {
    document.getElementById('product-section').style.display = 'block';
    renderProductPage();
  } else if (section === 'factory') {
    document.getElementById('factory-section').style.display = 'block';
  }
}

function setActiveNav(nav) {
  var links = document.querySelectorAll('.nav-links a');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove('active');
  }
  var activeLink = document.getElementById('nav-' + nav);
  if (activeLink) activeLink.classList.add('active');
}

function renderHomePage() {
  var grid = document.getElementById('home-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var allImages = [];
  for (var key in productBaseNames) {
    if (productBaseNames.hasOwnProperty(key)) {
      allImages.push(key);
    }
  }

  var filtered = allImages.filter(function(img) {
    if (!searchKeyword) return true;
    var name = getProductName(img).toLowerCase();
    return name.indexOf(searchKeyword) !== -1;
  });

  var start = (currentPage - 1) * productsPerPage;
  var end = start + productsPerPage;
  var pageImages = filtered.slice(start, end);

  for (var i = 0; i < pageImages.length; i++) {
    var imgSrc = pageImages[i];
    var card = document.createElement('div');
    card.className = 'product-card';

    var img = document.createElement('img');
    img.src = imgSrc;
    img.alt = getProductName(imgSrc);
    img.onerror = function() {
      this.style.display = 'none';
      var err = document.createElement('div');
      err.className = 'img-error';
      err.textContent = '图片加载失败';
      this.parentNode.insertBefore(err, this.nextSibling);
    };

    var title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = getProductName(imgSrc);

    card.appendChild(img);
    card.appendChild(title);
    grid.appendChild(card);
  }

  var nextBtn = document.getElementById('home-next-btn');
  if (nextBtn) {
    if (end >= filtered.length) {
      nextBtn.textContent = getLangText('noMore');
      nextBtn.disabled = true;
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.textContent = getLangText('nextPage');
      nextBtn.disabled = false;
      nextBtn.classList.remove('disabled');
    }
  }
}

function renderProductPage() {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var allImages = [];
  for (var key in productBaseNames) {
    if (productBaseNames.hasOwnProperty(key)) {
      allImages.push(key);
    }
  }

  var filtered = allImages.filter(function(img) {
    if (!searchKeyword) return true;
    var name = getProductName(img).toLowerCase();
    return name.indexOf(searchKeyword) !== -1;
  });

  var start = (currentProductPage - 1) * productsPerPage;
  var end = start + productsPerPage;
  var pageImages = filtered.slice(start, end);

  for (var i = 0; i < pageImages.length; i++) {
    var imgSrc = pageImages[i];
    var card = document.createElement('div');
    card.className = 'product-card';

    var img = document.createElement('img');
    img.src = imgSrc;
    img.alt = getProductName(imgSrc);
    img.onerror = function() {
      this.style.display = 'none';
      var err = document.createElement('div');
      err.className = 'img-error';
      err.textContent = '图片加载失败';
      this.parentNode.insertBefore(err, this.nextSibling);
    };

    var title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = getProductName(imgSrc);

    card.appendChild(img);
    card.appendChild(title);
    grid.appendChild(card);
  }

  var nextBtn = document.getElementById('product-next-btn');
  if (nextBtn) {
    if (end >= filtered.length) {
      nextBtn.textContent = getLangText('noMore');
      nextBtn.disabled = true;
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.textContent = getLangText('nextPage');
      nextBtn.disabled = false;
      nextBtn.classList.remove('disabled');
    }
  }
}

function getLangText(key) {
  var texts = {
    'zh': { nextPage: '下一页', noMore: '没有更多了', searchPlaceholder: '搜索产品...' },
    'en': { nextPage: 'Next Page', noMore: 'No More', searchPlaceholder: 'Search products...' },
    'es': { nextPage: 'Siguiente', noMore: 'No hay más', searchPlaceholder: 'Buscar productos...' },
    'ja': { nextPage: '次のページ', noMore: 'これ以上ありません', searchPlaceholder: '製品を検索...' },
    'ar': { nextPage: 'الصفحة التالية', noMore: 'لا مزيد', searchPlaceholder: 'ابحث عن المنتجات...' }
  };
  return (texts[currentLang] && texts[currentLang][key]) || texts['en'][key];
}

function toggleContactPanel() {
  var panel = document.getElementById('contact-panel');
  if (panel.style.display === 'block') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
