export function contentPage({ articles, keywords, products, engineConfig = {}, activeTab = 'articles', message, apiUsage = {} }) {
  const articleSlugs = articles.map(a => a.slug);

  const tabs = [
    { id: 'articles', label: 'Articles', count: articles.length },
    { id: 'keywords', label: 'Keywords', count: keywords.length },
    { id: 'products', label: 'Products', count: products.length },
    { id: 'engine', label: 'Content Engine', count: null },
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
            ${t.id === 'engine' ? `
              <svg class="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ` : ''}
            ${t.label}
            ${t.count !== null ? `
              <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
              }">${t.count}</span>
            ` : ''}
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

    <!-- Content Engine Tab -->
    <div id="tab-engine" class="tab-panel ${activeTab !== 'engine' ? 'hidden' : ''}">
      ${engineTab(engineConfig, articles)}
    </div>

    <script>
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.dataset.tab;
          const url = new URL(window.location);
          url.searchParams.set('tab', tabId);
          window.history.replaceState({}, '', url);
          document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
          document.getElementById('tab-' + tabId).classList.remove('hidden');
          document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('border-brand-600', 'text-brand-700');
            b.classList.add('border-transparent', 'text-gray-500');
            const badge = b.querySelector('.tab-badge');
            if (badge) {
              badge.classList.remove('bg-brand-100', 'text-brand-700');
              badge.classList.add('bg-gray-100', 'text-gray-500');
            }
          });
          btn.classList.remove('border-transparent', 'text-gray-500');
          btn.classList.add('border-brand-600', 'text-brand-700');
          const badge = btn.querySelector('.tab-badge');
          if (badge) {
            badge.classList.remove('bg-gray-100', 'text-gray-500');
            badge.classList.add('bg-brand-100', 'text-brand-700');
          }
        });
      });

      // Prompt sub-tab switching
      document.querySelectorAll('.prompt-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const promptId = btn.dataset.prompt;
          document.querySelectorAll('.prompt-panel').forEach(p => p.classList.add('hidden'));
          document.getElementById('prompt-' + promptId).classList.remove('hidden');
          document.querySelectorAll('.prompt-tab-btn').forEach(b => {
            b.classList.remove('bg-brand-600', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-700');
          });
          btn.classList.remove('bg-gray-100', 'text-gray-700');
          btn.classList.add('bg-brand-600', 'text-white');
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${sorted.map(a => {
            const articleSlug = encodeURIComponent(a.slug || a.filename.replace('.md', ''));
            return `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <a href="/content/articles/${articleSlug}/edit" class="block group">
                  <div class="text-sm font-medium text-gray-900 group-hover:text-brand-700">${escHtml(a.title || a.filename)}</div>
                  <div class="text-xs text-gray-400">${a.slug || a.filename}</div>
                </a>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full ${typeColor(a.type)}">${a.type || '—'}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">${a.category || '—'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${a.wordCount?.toLocaleString() || '—'}</td>
              <td class="px-4 py-3 text-sm text-gray-500">${formatDate(a.dateModified || a.modified)}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <a href="/content/articles/${articleSlug}/edit"
                    class="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded hover:bg-brand-100 transition-colors">Edit</a>
                  <form method="POST" action="/content/articles/${articleSlug}/archive" class="inline">
                    <button type="submit" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Archive</button>
                  </form>
                  <form method="POST" action="/content/articles/${articleSlug}/delete" class="inline"
                    onsubmit="return confirm('Are you sure you want to delete this article? This cannot be undone.')">
                    <button type="submit" class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
            `;
          }).join('')}
          ${sorted.length === 0 ? '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No articles yet</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

// ─── Keywords tab ───────────────────────────────────────────

function keywordsTab(keywords, articleSlugs) {
  const pendingCount = keywords.filter(k => !articleSlugs.includes(k.slug)).length;

  // Sort: pending first (oldest dateAdded first for priority), then generated
  const sorted = [...keywords].sort((a, b) => {
    const aPending = !articleSlugs.includes(a.slug);
    const bPending = !articleSlugs.includes(b.slug);
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    // Within same status, sort by dateAdded (oldest first for pending = highest priority)
    if (aPending && bPending) {
      const aDate = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
      const bDate = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      return aDate - bDate;
    }
    return 0;
  });

  return `
    <!-- Add keyword form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Keyword</h2>
      <form method="POST" action="/content/keywords" class="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input name="keyword" placeholder="Keyword (e.g., best robot vacuum for pet hair)" required
          class="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        <select name="type" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="best-for">best-for</option>
          <option value="vs">vs</option>
          <option value="info">info</option>
        </select>
        <input name="category" placeholder="category slug" required
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        <button type="submit" class="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 whitespace-nowrap">
          Add Keyword
        </button>
      </form>
    </div>

    <!-- Keywords table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">${keywords.length} keyword${keywords.length !== 1 ? 's' : ''} total &middot; <span class="${pendingCount > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}">${pendingCount} pending</span></p>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${(() => {
            let priority = 1;
            return sorted.map(k => {
              const hasArticle = articleSlugs.includes(k.slug);
              const priorityNum = !hasArticle ? priority++ : null;
              return `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-center">
                  ${priorityNum ? `<span class="text-xs font-bold ${priorityNum <= 3 ? 'text-brand-600' : 'text-gray-400'}">#${priorityNum}</span>` : '<span class="text-xs text-gray-300">—</span>'}
                </td>
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
                <td class="px-4 py-3 text-xs text-gray-400">${k.dateAdded ? formatDate(k.dateAdded) : '—'}</td>
              </tr>
              `;
            }).join('');
          })()}
          ${keywords.length === 0 ? '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No keywords yet</td></tr>' : ''}
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

// ─── Content Engine tab ─────────────────────────────────────

function engineTab(config, articles) {
  const schedule = config.schedule || {};
  const prompts = config.prompts || {};
  const trendResearch = config.trendResearch || {};
  const defaultTrendPrompt = 'You are an expert SEO keyword researcher specializing in smart home and consumer electronics. You generate practical, search-optimized keyword ideas that real people search for. Always return valid YAML.';

  // --- Trend research prompts (multi-prompt support) ---
  const trendPrompts = Array.isArray(trendResearch.prompts) ? trendResearch.prompts : [];
  const activePromptId = trendResearch.activePromptId || null;
  // Migration: if old single systemPrompt exists and no prompts array, show it as a legacy entry
  if (trendPrompts.length === 0 && trendResearch.systemPrompt) {
    trendPrompts.push({ id: 'legacy', name: 'Default Prompt', prompt: trendResearch.systemPrompt });
  }

  // --- Activity stats ---
  const sorted = [...articles].sort((a, b) =>
    new Date(b.dateModified || b.modified).getTime() - new Date(a.dateModified || a.modified).getTime()
  );
  const lastArticle = sorted[0] || null;
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
  const thisWeekCount = articles.filter(a => {
    const d = new Date(a.datePublished || a.dateModified || a.modified);
    return d >= weekAgo;
  }).length;
  const thisMonthCount = articles.filter(a => {
    const d = new Date(a.datePublished || a.dateModified || a.modified);
    return d >= monthAgo;
  }).length;

  const promptTabs = [
    { id: 'base', label: 'Base System', desc: 'Core instructions sent with every generation. Use {{SITE_NAME}} as a placeholder.' },
    { id: 'best-for', label: 'Best-For', desc: 'Additional instructions for "Best X for Y" product roundup articles.' },
    { id: 'vs', label: 'VS Comparison', desc: 'Additional instructions for product comparison articles.' },
    { id: 'info', label: 'Informational', desc: 'Additional instructions for how-to and informational articles.' },
    { id: 'faq', label: 'FAQ', desc: 'Template for FAQ generation. Use {{KEYWORD}} as a placeholder.' },
  ];

  const chevron = `<svg class="engine-chevron w-5 h-5 text-gray-400 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>`;

  return `
    <style>
      .engine-section[open] .engine-chevron { transform: rotate(180deg); }
      .engine-section summary { list-style: none; cursor: pointer; }
      .engine-section summary::-webkit-details-marker { display: none; }
    </style>

    <!-- Activity & Status (always open) -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-3">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Activity & Status</h2>
          <p class="text-sm text-gray-500">Recent content generation activity.</p>
        </div>
        <form method="POST" action="/content/autopublish/run" class="flex-shrink-0 ml-4">
          <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors inline-flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generate Now${schedule.enabled ? ` (${schedule.amount || 1} article${(schedule.amount || 1) !== 1 ? 's' : ''})` : ''}
          </button>
        </form>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs font-medium text-gray-500 uppercase mb-1">Last Article</p>
          ${lastArticle ? `
            <p class="text-sm font-semibold text-gray-900 truncate" title="${escHtml(lastArticle.title)}">${escHtml(lastArticle.title || lastArticle.filename)}</p>
            <p class="text-xs text-gray-400 mt-0.5">${formatDate(lastArticle.dateModified || lastArticle.modified)} &middot; ${relativeTime(lastArticle.dateModified || lastArticle.modified)}</p>
          ` : '<p class="text-sm text-gray-400">No articles yet</p>'}
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs font-medium text-gray-500 uppercase mb-1">Next Run</p>
          ${schedule.enabled ? `
            <p class="text-sm font-semibold text-gray-900">${nextRunTime(schedule.frequency)}</p>
            <p class="text-xs text-gray-400 mt-0.5">${nextRunRelative(schedule.frequency)}</p>
          ` : '<p class="text-sm text-gray-400">Autopublish off</p>'}
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs font-medium text-gray-500 uppercase mb-1">This Week</p>
          <p class="text-2xl font-bold text-brand-600">${thisWeekCount}</p>
          <p class="text-xs text-gray-400">articles published</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs font-medium text-gray-500 uppercase mb-1">This Month</p>
          <p class="text-2xl font-bold text-brand-600">${thisMonthCount}</p>
          <p class="text-xs text-gray-400">articles published</p>
        </div>
      </div>
    </div>

    <!-- Trend Research (collapsible) -->
    <details class="engine-section bg-white rounded-lg border border-gray-200 mb-3">
      <summary class="flex items-center justify-between p-5">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Trend Research</h2>
          <p class="text-xs text-gray-400 mt-0.5">
            ${trendResearch.lastRunDate
              ? `Last run: ${formatDate(trendResearch.lastRunDate)} (${relativeTime(trendResearch.lastRunDate)})`
              : 'Never run from dashboard'}
            &middot; ${trendPrompts.length} prompt${trendPrompts.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        ${chevron}
      </summary>
      <div class="px-5 pb-5 border-t border-gray-100 pt-4">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-500">Run AI-powered trend analysis to discover new keyword opportunities.</p>
          <form method="POST" action="/content/trend-research/run" class="inline flex-shrink-0 ml-4">
            <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
              Run Trend Research
            </button>
          </form>
        </div>

        <!-- Saved Prompts -->
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">System Prompts</h3>
          ${trendPrompts.length > 0 ? `
            <div class="space-y-2">
              ${trendPrompts.map(tp => `
                <div class="flex items-start gap-3 p-3 rounded-lg border ${tp.id === activePromptId ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-gray-50'}">
                  <form method="POST" action="/content/trend-prompts/activate" class="flex-shrink-0 mt-0.5">
                    <input type="hidden" name="promptId" value="${escHtml(tp.id)}" />
                    <button type="submit" class="block">
                      <div class="w-4 h-4 rounded-full border-2 ${tp.id === activePromptId ? 'border-brand-600 bg-brand-600' : 'border-gray-400 bg-white'} flex items-center justify-center">
                        ${tp.id === activePromptId ? '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>' : ''}
                      </div>
                    </button>
                  </form>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium text-gray-900">${escHtml(tp.name)}</p>
                      ${tp.id === activePromptId ? '<span class="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">Active</span>' : ''}
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5 truncate">${escHtml(tp.prompt.substring(0, 120))}${tp.prompt.length > 120 ? '...' : ''}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onclick="editTrendPrompt('${escHtml(tp.id)}', '${escAttr(tp.name)}', this)"
                      data-prompt="${escHtml(tp.prompt)}"
                      class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300 transition-colors">Edit</button>
                    <form method="POST" action="/content/trend-prompts/delete" class="inline"
                      onsubmit="return confirm('Delete this prompt?')">
                      <input type="hidden" name="promptId" value="${escHtml(tp.id)}" />
                      <button type="submit" class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors">Delete</button>
                    </form>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <p class="text-sm text-gray-400 italic">No prompts saved. Add one below or use the default.</p>
          `}
        </div>

        <!-- Add / Edit Prompt Form -->
        <div id="trend-prompt-form" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 id="trend-form-title" class="text-sm font-semibold text-gray-700 mb-3">Add New Prompt</h3>
          <form method="POST" action="/content/trend-prompts/save">
            <input type="hidden" id="trend-edit-id" name="promptId" value="" />
            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-500 mb-1">Prompt Name</label>
              <input id="trend-prompt-name" name="promptName" required placeholder="e.g. Holiday Season Research"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-500 mb-1">System Prompt</label>
              <textarea id="trend-prompt-text" name="promptText" rows="6" required
                placeholder="${escHtml(defaultTrendPrompt)}"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              ></textarea>
            </div>
            <div class="flex items-center justify-between">
              <button type="button" id="trend-cancel-edit" onclick="cancelTrendEdit()" class="text-xs text-gray-500 hover:text-gray-700 hidden">Cancel edit</button>
              <button type="submit" class="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors ml-auto">
                <span id="trend-form-submit-text">Add Prompt</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </details>

    <form method="POST" action="/content/engine">

      <!-- Publishing Schedule (collapsible) -->
      <details class="engine-section bg-white rounded-lg border border-gray-200 mb-3">
        <summary class="flex items-center justify-between p-5">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Publishing Schedule</h2>
            <p class="text-xs mt-0.5 ${schedule.enabled ? 'text-green-600' : 'text-gray-400'}">
              ${schedule.enabled ? `ON &middot; ${schedule.amount || 1} article${(schedule.amount || 1) !== 1 ? 's' : ''} ${schedule.frequency || 'daily'}` : 'OFF'}
            </p>
          </div>
          ${chevron}
        </summary>
        <div class="px-5 pb-5 border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between p-4 rounded-lg ${schedule.enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'} mb-4">
            <div>
              <p class="text-sm font-semibold ${schedule.enabled ? 'text-green-800' : 'text-gray-700'}">
                ${schedule.enabled ? 'Autopublish is ON' : 'Autopublish is OFF'}
              </p>
              <p class="text-xs ${schedule.enabled ? 'text-green-600' : 'text-gray-400'} mt-0.5">
                ${schedule.enabled ? 'Articles will be generated automatically.' : 'Enable to start generating on a schedule.'}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input name="schedule.enabled" type="checkbox" ${schedule.enabled ? 'checked' : ''} class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Publish</label>
              <div class="flex items-center gap-2">
                <input name="schedule.amount" type="number" value="${schedule.amount || 1}" min="1" max="${schedule.frequency === 'hourly' ? 2 : schedule.frequency === 'weekly' ? 20 : 5}"
                  class="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <span class="text-sm text-gray-500">article${(schedule.amount || 1) !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select name="schedule.frequency" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                onchange="updateAmountMax(this.value)">
                <option value="daily" ${(schedule.frequency || 'daily') === 'daily' ? 'selected' : ''}>Daily</option>
                <option value="hourly" ${schedule.frequency === 'hourly' ? 'selected' : ''}>Hourly</option>
                <option value="weekly" ${schedule.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              </select>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-3">Hourly (1-2), Daily (1-5), Weekly (1-20).</p>
        </div>
      </details>

      <script>
        function updateAmountMax(freq) {
          const input = document.querySelector('input[name="schedule.amount"]');
          const limits = { hourly: 2, daily: 5, weekly: 20 };
          input.max = limits[freq] || 5;
          if (parseInt(input.value) > parseInt(input.max)) input.value = input.max;
        }
      </script>

      <!-- Prompt Templates (collapsible) -->
      <details class="engine-section bg-white rounded-lg border border-gray-200 mb-3">
        <summary class="flex items-center justify-between p-5">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Prompt Templates</h2>
            <p class="text-xs text-gray-400 mt-0.5">Article generation prompts for each content type</p>
          </div>
          ${chevron}
        </summary>
        <div class="px-5 pb-5 border-t border-gray-100 pt-4">
          <p class="text-sm text-gray-500 mb-4">The base prompt is combined with the type-specific prompt for each article.</p>

          <div class="flex flex-wrap gap-2 mb-4">
            ${promptTabs.map((t, i) => `
              <button type="button" data-prompt="${t.id}"
                class="prompt-tab-btn px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  i === 0 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }">
                ${t.label}
              </button>
            `).join('')}
          </div>

          ${promptTabs.map((t, i) => `
            <div id="prompt-${t.id}" class="prompt-panel ${i > 0 ? 'hidden' : ''}">
              <p class="text-sm text-gray-500 mb-2">${t.desc}</p>
              <textarea name="prompts.${t.id}" rows="12"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >${escHtml(prompts[t.id] || '')}</textarea>
            </div>
          `).join('')}
        </div>
      </details>

      <!-- Save -->
      <div class="flex justify-end mt-4">
        <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
          Save Settings
        </button>
      </div>
    </form>

    <script>
      function editTrendPrompt(id, name, btn) {
        document.getElementById('trend-edit-id').value = id;
        document.getElementById('trend-prompt-name').value = name;
        document.getElementById('trend-prompt-text').value = btn.getAttribute('data-prompt');
        document.getElementById('trend-form-title').textContent = 'Edit Prompt';
        document.getElementById('trend-form-submit-text').textContent = 'Update Prompt';
        document.getElementById('trend-cancel-edit').classList.remove('hidden');
        document.getElementById('trend-prompt-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      function cancelTrendEdit() {
        document.getElementById('trend-edit-id').value = '';
        document.getElementById('trend-prompt-name').value = '';
        document.getElementById('trend-prompt-text').value = '';
        document.getElementById('trend-form-title').textContent = 'Add New Prompt';
        document.getElementById('trend-form-submit-text').textContent = 'Add Prompt';
        document.getElementById('trend-cancel-edit').classList.add('hidden');
      }
    </script>
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

function relativeTime(d) {
  if (!d) return '';
  const now = Date.now();
  const then = new Date(d).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

// GitHub Actions cron runs at 9 AM UTC daily
function getNextRun(frequency) {
  const now = new Date();
  const next = new Date(now);
  // Daily cron at 9 AM UTC
  next.setUTCHours(9, 0, 0, 0);
  if (frequency === 'hourly') {
    // Next hour mark
    next.setTime(now.getTime());
    next.setUTCMinutes(0, 0, 0);
    next.setUTCHours(next.getUTCHours() + 1);
  } else if (frequency === 'weekly') {
    // Next Monday 9 AM UTC
    const day = next.getUTCDay();
    const daysUntilMon = day === 0 ? 1 : day === 1 ? (now.getUTCHours() >= 9 ? 7 : 0) : 8 - day;
    next.setUTCDate(next.getUTCDate() + daysUntilMon);
  } else {
    // Daily: if 9 AM UTC already passed today, next is tomorrow
    if (now >= next) next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

function nextRunTime(frequency) {
  const next = getNextRun(frequency);
  return next.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

function nextRunRelative(frequency) {
  const next = getNextRun(frequency);
  const diffMs = next.getTime() - Date.now();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const remMins = diffMins % 60;
  if (diffMins < 1) return 'any moment now';
  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHrs < 24) return `in ${diffHrs}h ${remMins > 0 ? remMins + 'm' : ''}`;
  const diffDays = Math.floor(diffMs / 86400000);
  return `in ${diffDays}d ${diffHrs % 24}h`;
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
}
