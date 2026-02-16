/**
 * Base HTML layout for dashboard pages
 */

export function layout(title, content, { activePage = '', siteName = '', sites = [] } = {}) {
  const nav = [
    { label: 'Overview', href: '/', id: 'home' },
    { label: 'Articles', href: '/articles', id: 'articles' },
    { label: 'Keywords', href: '/keywords', id: 'keywords' },
    { label: 'Products', href: '/products', id: 'products' },
    { label: 'Sites', href: '/sites', id: 'sites' },
    { label: 'Build', href: '/build', id: 'build' },
  ];

  const siteOptions = sites.map(s =>
    `<option value="${s.id}" ${s.id === (process.env.ACTIVE_SITE || '_default') ? 'selected' : ''}>${s.config.name} (${s.id})</option>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — SEO Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af' },
            dash: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a' }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- Top bar -->
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
      <div class="flex items-center gap-3">
        <a href="/" class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          SEO Dashboard
        </a>
        ${sites.length > 0 ? `
        <select id="site-switcher" onchange="window.location.href='/?site=' + this.value" class="ml-4 text-sm border border-gray-300 rounded-md px-2 py-1 bg-white">
          ${siteOptions}
        </select>
        ` : ''}
      </div>
      <nav class="flex items-center gap-1">
        ${nav.map(n => `
          <a href="${n.href}" class="px-3 py-1.5 text-sm rounded-md ${activePage === n.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}">
            ${n.label}
          </a>
        `).join('')}
      </nav>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    ${content}
  </main>

  <footer class="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-gray-400 border-t border-gray-200 mt-8">
    SEO Dashboard &middot; Managing: ${siteName || 'No site selected'}
  </footer>
</body>
</html>`;
}
