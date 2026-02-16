export function buildPage({ buildStatus, siteName, siteId }) {
  return `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Build & Deploy</h1>
    </div>

    ${buildStatus ? `<div class="mb-4 p-3 rounded-lg ${buildStatus.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} text-sm border">${buildStatus.message}</div>` : ''}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Build -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Build Site</h2>
        <p class="text-sm text-gray-600 mb-4">
          Run <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs">astro build</code> to generate static files
          for <strong>${escHtml(siteName)}</strong>.
        </p>
        <form method="POST" action="/build">
          <input type="hidden" name="action" value="build" />
          <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700">
            Build Now
          </button>
        </form>
      </div>

      <!-- Preview -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Dev Server</h2>
        <p class="text-sm text-gray-600 mb-4">
          Start the Astro dev server to preview changes locally. Run in a separate terminal:
        </p>
        <code class="block bg-gray-900 text-green-400 text-sm p-4 rounded-lg font-mono">
          ${siteId && siteId !== '_default' ? `ACTIVE_SITE=${siteId} ` : ''}npm run dev
        </code>
      </div>
    </div>

    <!-- Build log -->
    <div class="mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Build Output</h2>
      <div id="build-log" class="bg-gray-900 text-gray-300 text-xs p-4 rounded-lg font-mono h-64 overflow-y-auto">
        ${buildStatus?.log ? escHtml(buildStatus.log) : '<span class="text-gray-500">No recent build output. Click "Build Now" to start a build.</span>'}
      </div>
    </div>

    <!-- Quick commands reference -->
    <div class="mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Commands Reference</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <code class="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">npm run build</code>
          <span class="text-gray-600">Build the default site</span>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <code class="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">npm run dev</code>
          <span class="text-gray-600">Start dev server</span>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <code class="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">npm run generate</code>
          <span class="text-gray-600">Generate articles from keywords</span>
        </div>
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <code class="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">ACTIVE_SITE=id npm run build</code>
          <span class="text-gray-600">Build a specific site</span>
        </div>
      </div>
    </div>
  `;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
