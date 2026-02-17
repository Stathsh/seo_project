export function homePage({ articles, products, totalWords, siteName, quicklinks = [] }) {
  const byType = { 'best-for': 0, vs: 0, info: 0 };
  const byCategory = {};
  articles.forEach(a => {
    if (a.type) byType[a.type] = (byType[a.type] || 0) + 1;
    if (a.category) byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  });

  const avgWords = articles.length > 0 ? Math.round(totalWords / articles.length) : 0;

  const defaultLinks = [
    { name: 'Amazon Associates', url: 'https://affiliate-program.amazon.com/', icon: 'cart' },
    { name: 'Google AdSense', url: 'https://www.google.com/adsense/', icon: 'ad' },
    { name: 'Google Search Console', url: 'https://search.google.com/search-console', icon: 'search' },
    { name: 'Google Analytics', url: 'https://analytics.google.com/', icon: 'chart' },
  ];

  return `
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      ${statCard('Total Articles', articles.length, 'text-brand-600')}
      ${statCard('Total Words', totalWords.toLocaleString(), 'text-green-600')}
      ${statCard('Avg Words/Article', avgWords.toLocaleString(), 'text-purple-600')}
      ${statCard('Products', products.length, 'text-amber-600')}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- By Type -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Articles by Type</h2>
        <div class="space-y-3">
          ${typeBar('Best-For', byType['best-for'], articles.length, 'bg-green-500')}
          ${typeBar('VS Comparison', byType['vs'], articles.length, 'bg-purple-500')}
          ${typeBar('Informational', byType['info'], articles.length, 'bg-blue-500')}
        </div>
      </div>

      <!-- By Category -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Articles by Category</h2>
        <div class="space-y-3">
          ${Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => typeBar(cat, count, articles.length, 'bg-brand-500'))
            .join('')}
          ${Object.keys(byCategory).length === 0 ? '<p class="text-sm text-gray-400">No articles yet</p>' : ''}
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        ${defaultLinks.map(link => quicklinkCard(link.name, link.url, link.icon)).join('')}
        ${quicklinks.map((link, i) => quicklinkCard(link.name, link.url, 'link', i)).join('')}
      </div>

      <div class="border-t border-gray-100 pt-4">
        <form action="/quicklinks/add" method="POST" class="flex items-end gap-3">
          <div class="flex-1 min-w-0">
            <label class="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input type="text" name="name" required placeholder="My Link"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div class="flex-[2] min-w-0">
            <label class="block text-xs font-medium text-gray-500 mb-1">URL</label>
            <input type="url" name="url" required placeholder="https://example.com"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <button type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors whitespace-nowrap">
            + Add Link
          </button>
        </form>
      </div>
    </div>

  `;
}

function statCard(label, value, colorClass) {
  return `
    <div class="bg-white rounded-lg border border-gray-200 p-5">
      <p class="text-sm text-gray-500">${label}</p>
      <p class="text-3xl font-bold ${colorClass} mt-1">${value}</p>
    </div>
  `;
}

function quicklinkIcon(type) {
  const icons = {
    cart: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />',
    ad: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />',
    search: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />',
    chart: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
    link: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />',
  };
  return icons[type] || icons.link;
}

function quicklinkCard(name, url, icon, deleteIndex) {
  const safeUrl = url.replace(/"/g, '&quot;');
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const deleteBtn = deleteIndex !== undefined ? `
    <form action="/quicklinks/delete" method="POST" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <input type="hidden" name="index" value="${deleteIndex}" />
      <button type="submit" class="p-1 text-gray-400 hover:text-red-500 rounded" title="Remove link">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </form>
  ` : '';
  return `
    <a href="${safeUrl}" target="_blank" rel="noopener"
      class="group relative flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
      ${deleteBtn}
      <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
        <svg class="w-4 h-4 text-gray-500 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${quicklinkIcon(icon)}
        </svg>
      </div>
      <span class="text-sm font-medium text-gray-700 group-hover:text-brand-700 truncate">${safeName}</span>
    </a>
  `;
}

function typeBar(label, count, total, bgColor) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span class="text-gray-700">${label}</span>
        <span class="text-gray-500">${count} (${pct}%)</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-2">
        <div class="${bgColor} h-2 rounded-full" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

