
// ===== 语言切换 =====
document.querySelectorAll('.lang-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    this.classList.add('active');
  });
});

// ===== 搜索过滤 =====
var searchInput = document.getElementById('header-search');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    var kw = this.value.trim().toLowerCase();
    var cards = document.querySelectorAll('.product-card');
    var visible = 0;
    cards.forEach(function (card) {
      var titleEl = card.querySelector('.product-title');
      var text = titleEl ? titleEl.textContent.toLowerCase() : '';
      var match = text.indexOf(kw) > -1;
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    showNoResults(kw !== '' && visible === 0);
  });
}

function showNoResults(show) {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  var tip = document.getElementById('no-results');
  if (show) {
    if (!tip) {
      var div = document.createElement('div');
      div.id = 'no-results';
      div.className = 'no-results';
      div.textContent = '没有找到相关商品';
      grid.appendChild(div);
    }
  } else if (tip) {
    tip.remove();
  }
}

// ===== 加载更多 =====
var loadBtn = document.getElementById('load-more-btn');
if (loadBtn) {
  loadBtn.addEventListener('click', function () {
    var hidden = document.querySelectorAll('.product-card[style*="none"]');
    document.querySelectorAll('.product-card').forEach(function (card) {
      card.style.display = '';
    });
    var tip = document.getElementById('no-results');
    if (tip) tip.remove();
    loadBtn.textContent = '已显示全部';
    loadBtn.disabled = true;
  });
}
