export function sitesPage({ sites, message }) {
  return `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Sites (${sites.length})</h1>
    </div>

    ${message ? `<div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">${message}</div>` : ''}

    <!-- Create site form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Create New Site</h2>
      <form method="POST" action="/sites" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="id" placeholder="Site ID (e.g., outdoor-gear)" required pattern="[a-z0-9-]+"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="name" placeholder="Site Name (e.g., OutdoorGearPro)" required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="url" placeholder="https://outdoorgearpro.com" required type="url"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="authorName" placeholder="Author name" required
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="authorTitle" placeholder="Author title (e.g., Gear Editor)"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input name="affiliateTag" placeholder="Amazon affiliate tag"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div class="flex gap-3">
          <textarea name="heroDescription" placeholder="Hero/tagline description" rows="2"
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
          <button type="submit" class="self-end bg-gray-900 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-800">
            Create Site
          </button>
        </div>
      </form>
    </div>

    <!-- Sites list -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${sites.map(s => `
        <div class="bg-white rounded-lg border border-gray-200 p-5">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">${escHtml(s.config.name)}</h3>
              <p class="text-xs text-gray-400 font-mono mt-0.5">${s.id}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">${s.id === '_default' ? 'Default' : 'Site'}</span>
          </div>
          <div class="mt-3 space-y-1 text-sm text-gray-600">
            <p>URL: ${escHtml(s.config.url)}</p>
            <p>Author: ${escHtml(s.config.author?.name || '—')}</p>
            <p>Tag: ${escHtml(s.config.affiliateTag || '—')}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 flex gap-2">
            <span class="text-xs text-gray-400">
              ACTIVE_SITE=${s.id} npm run build
            </span>
          </div>
        </div>
      `).join('')}
      ${sites.length === 0 ? '<p class="text-gray-400 col-span-3 text-center py-8">No sites configured yet</p>' : ''}
    </div>
  `;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
