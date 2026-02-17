export function articleEditPage({ article, slug, categories, message }) {
  const fm = article.frontmatter;
  const body = article.body;
  const typeOptions = ['best-for', 'vs', 'info'];

  return `
    <div class="flex items-center justify-between mb-6">
      <div>
        <a href="/content?tab=articles" class="text-sm text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </a>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Edit Article</h1>
      </div>
    </div>

    ${message ? `<div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">${escHtml(message)}</div>` : ''}

    <form method="POST" action="/content/articles/${encodeURIComponent(slug)}/edit">
      <!-- Frontmatter Fields -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Article Metadata</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" value="${escHtml(fm.title || '')}" required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value="${escHtml(fm.slug || slug)}" disabled
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows="2"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500">${escHtml(fm.description || '')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
              ${typeOptions.map(t => `<option value="${t}" ${fm.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
              ${categories.map(c => `<option value="${c.slug}" ${fm.category === c.slug ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Markdown Body -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Article Content</h2>
        <textarea name="body" rows="30"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-brand-500 focus:border-brand-500">${escHtml(body)}</textarea>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between">
        <a href="/content?tab=articles" class="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
        <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
          Save Article
        </button>
      </div>
    </form>
  `;
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
