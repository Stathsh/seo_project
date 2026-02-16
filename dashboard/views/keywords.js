export function keywordsPage({ keywords, articles, message }) {
  const articleSlugs = articles.map(a => a.slug);

  return `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Keywords (${keywords.length})</h1>
      <div class="flex gap-2">
        <form method="POST" action="/keywords/generate-all">
          <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700">
            Generate All Pending
          </button>
        </form>
      </div>
    </div>

    ${message ? `<div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">${message}</div>` : ''}

    <!-- Add keyword form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Keyword</h2>
      <form method="POST" action="/keywords" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                <form method="POST" action="/keywords/generate" class="inline">
                  <input type="hidden" name="keyword" value="${escHtml(k.keyword)}" />
                  <button type="submit" class="text-xs bg-brand-600 text-white px-3 py-1 rounded hover:bg-brand-700">Generate</button>
                </form>
                ` : `
                <form method="POST" action="/keywords/generate" class="inline">
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

function typeColor(type) {
  switch (type) {
    case 'best-for': return 'bg-green-100 text-green-700';
    case 'vs': return 'bg-purple-100 text-purple-700';
    case 'info': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
