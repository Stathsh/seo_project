export function homePage({ articles, keywords, products, totalWords, siteName }) {
  const byType = { 'best-for': 0, vs: 0, info: 0 };
  const byCategory = {};
  articles.forEach(a => {
    if (a.type) byType[a.type] = (byType[a.type] || 0) + 1;
    if (a.category) byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  });

  const pendingKeywords = keywords.filter(k => {
    const slugs = articles.map(a => a.slug);
    return !slugs.includes(k.slug);
  });

  const avgWords = articles.length > 0 ? Math.round(totalWords / articles.length) : 0;

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

    <!-- Pending keywords summary -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Pending Keywords</h2>
        <a href="/content?tab=keywords" class="text-sm text-brand-600 font-medium hover:text-brand-700">View all &rarr;</a>
      </div>
      ${pendingKeywords.length > 0 ? `
        <p class="text-sm text-gray-500 mt-2">${pendingKeywords.length} keyword${pendingKeywords.length !== 1 ? 's' : ''} waiting for article generation.</p>
      ` : '<p class="text-sm text-gray-400 mt-2">All keywords have articles generated</p>'}
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

function typeColor(type) {
  switch (type) {
    case 'best-for': return 'bg-green-100 text-green-700';
    case 'vs': return 'bg-purple-100 text-purple-700';
    case 'info': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
