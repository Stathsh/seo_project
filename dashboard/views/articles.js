export function articlesPage({ articles }) {
  const sorted = [...articles].sort((a, b) =>
    new Date(b.dateModified || b.modified).getTime() - new Date(a.dateModified || a.modified).getTime()
  );

  return `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Articles (${articles.length})</h1>
    </div>

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
