export function contentPage({ articles, keywords, products, activeTab = 'articles', message }) {
  const articleSlugs = articles.map(a => a.slug);

  const tabs = [
    { id: 'articles', label: 'Articles', count: articles.length },
    { id: 'keywords', label: 'Keywords', count: keywords.length },
    { id: 'products', label: 'Products', count: products.length },
  ];

  return `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Content Manager</h1>
    </div>

    ${message ? `<div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">${escHtml(message)}</div>` : ''}

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex gap-0 -mb-px">
        ${tabs.map(t => `
          <button
            data-tab="${t.id}"
            class="tab-btn px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }"
          >
            ${t.label}
            <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
            }">${t.count}</span>
          </button>
        `).join('')}
      </nav>
    </div>

    <!-- Articles Tab -->
    <div id="tab-articles" class="tab-panel ${activeTab !== 'articles' ? 'hidden' : ''}">
      ${articlesTab(articles)}
    </div>

    <!-- Keywords Tab -->
    <div id="tab-keywords" class="tab-panel ${activeTab !== 'keywords' ? 'hidden' : ''}">
      ${keywordsTab(keywords, articleSlugs)}
    </div>

    <!-- Products Tab -->
    <div id="tab-products" class="tab-panel ${activeTab !== 'products' ? 'hidden' : ''}">
      ${productsTab(products)}
    </div>

    <script>
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.dataset.tab;
          // Update URL without reload
          const url = new URL(window.location);
          url.searchParams.set('tab', tabId);
          window.history.replaceState({}, '', url);
          // Hide all panels
          document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
          // Show selected panel
          document.getElementById('tab-' + tabId).classList.remove('hidden');
          // Update tab styles
          document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('border-brand-600', 'text-brand-700');
            b.classList.add('border-transparent', 'text-gray-500');
            b.querySelector('span').classList.remove('bg-brand-100', 'text-brand-700');
            b.querySelector('span').classList.add('bg-gray-100', 'text-gray-500');
          });
          btn.classList.remove('border-transparent', 'text-gray-500');
          btn.classList.add('border-brand-600', 'text-brand-700');
          btn.querySelector('span').classList.remove('bg-gray-100', 'text-gray-500');
          btn.querySelector('span').classList.add('bg-brand-100', 'text-brand-700');
        });
      });
    </script>
  `;
}

// ─── Articles tab ───────────────────────────────────────────

function articlesTab(articles) {
  const sorted = [...articles].sort((a, b) =>
    new Date(b.dateModified || b.modified).getTime() - new Date(a.dateModified || a.modified).getTime()
  );

  return `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Words</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${sorted.map(a => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${escHtml(a.title || a.filename)}</div>
                <div class="text-xs text-gray-400">${a.slug || a.filename}</div>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full ${typeColor(a.type)}">${a.type || '—'}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">${a.category || '—'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${a.wordCount?.toLocaleString() || '—'}</td>
              <td class="px-4 py-3 text-sm text-gray-500">${formatDate(a.dateModified || a.modified)}</td>
            </tr>
          `).join('')}
          ${sorted.length === 0 ? '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-400">No articles yet</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Keywords tab ───────────────────────────────────────────

function keywordsTab(keywords, articleSlugs) {
  return `
    <div class="flex items-center justify-between mb-4">
      <div></div>
      <form method="POST" action="/content/keywords/generate-all">
        <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700">
          Generate All Pending
        </button>
      </form>
    </div>

    <!-- Add keyword form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Keyword</h2>
      <form method="POST" action="/content/keywords" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input name="keyword" placeholder="Keyword (e.g., best robot vacuum for pet hair)" required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        <input name="slug" placeholder="slug (auto-generated if empty)"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        <select name="type" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="best-for">best-for</option>
          <option value="vs">vs</option>
          <option value="info">info</option>
        </select>
        <div class="flex gap-2">
          <input name="category" placeholder="category slug" required
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
          <button type="submit" class="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 whitespace-nowrap">
            Add
          </button>
        </div>
      </form>
    </div>

    <!-- Keywords table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${keywords.map(k => {
            const hasArticle = articleSlugs.includes(k.slug);
            return `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${escHtml(k.keyword)}</div>
                <div class="text-xs text-gray-400">${k.slug}</div>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full ${typeColor(k.type)}">${k.type}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">${k.category}</td>
              <td class="px-4 py-3">
                ${hasArticle
                  ? '<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Generated</span>'
                  : '<span class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pending</span>'}
              </td>
              <td class="px-4 py-3">
                ${!hasArticle ? `
                <form method="POST" action="/content/keywords/generate" class="inline">
                  <input type="hidden" name="keyword" value="${escHtml(k.keyword)}" />
                  <button type="submit" class="text-xs bg-brand-600 text-white px-3 py-1 rounded hover:bg-brand-700">Generate</button>
                </form>
                ` : `
                <form method="POST" action="/content/keywords/generate" class="inline">
                  <input type="hidden" name="keyword" value="${escHtml(k.keyword)}" />
                  <input type="hidden" name="force" value="1" />
                  <button type="submit" class="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">Regenerate</button>
                </form>
                `}
              </td>
            </tr>
            `;
          }).join('')}
          ${keywords.length === 0 ? '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-400">No keywords yet</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Products tab ───────────────────────────────────────────

function productsTab(products) {
  return `
    <!-- Add product form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Product</h2>
      <form method="POST" action="/content/products" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="name" placeholder="Product name" required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="brand" placeholder="Brand" required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="category" placeholder="Category slug" required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input name="price" type="number" step="0.01" placeholder="Price" required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="rating" type="number" step="0.1" min="1" max="5" placeholder="Rating (1-5)"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="asin" placeholder="Amazon ASIN"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" class="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800">
            Add Product
          </button>
        </div>
      </form>
    </div>

    <!-- Products table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ASIN</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${products.map(p => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">${escHtml(p.name)}</div>
                <div class="text-xs text-gray-400">${p.id}</div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">${escHtml(p.brand)}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${p.category || '—'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">$${p.price?.toFixed(2) || '—'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${p.rating || '—'}/5</td>
              <td class="px-4 py-3 text-xs text-gray-400 font-mono">${p.asin || '—'}</td>
            </tr>
          `).join('')}
          ${products.length === 0 ? '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No products yet</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Helpers ────────────────────────────────────────────────

function typeColor(type) {
  switch (type) {
    case 'best-for': return 'bg-green-100 text-green-700';
    case 'vs': return 'bg-purple-100 text-purple-700';
    case 'info': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
