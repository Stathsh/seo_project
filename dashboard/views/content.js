export function contentPage({ articles, keywords, products, engineConfig = {}, activeTab = 'articles', message }) {
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
      ${engineTab(engineConfig)}
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

// ─── Content Engine tab ─────────────────────────────────────

function engineTab(config) {
  const model = config.model || 'claude-sonnet-4-20250514';
  const maxTokens = config.maxTokens || 4096;
  const faqMaxTokens = config.faqMaxTokens || 1500;
  const hasApiKey = !!(config.apiKey);
  const schedule = config.schedule || {};
  const prompts = config.prompts || {};

  const models = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Recommended)' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4 (Most capable)' },
    { value: 'claude-haiku-3-5-20241022', label: 'Claude Haiku 3.5 (Fastest/cheapest)' },
  ];

  const promptTabs = [
    { id: 'base', label: 'Base System', desc: 'Core instructions sent with every generation. Use {{SITE_NAME}} as a placeholder.' },
    { id: 'best-for', label: 'Best-For', desc: 'Additional instructions for "Best X for Y" product roundup articles.' },
    { id: 'vs', label: 'VS Comparison', desc: 'Additional instructions for product comparison articles.' },
    { id: 'info', label: 'Informational', desc: 'Additional instructions for how-to and informational articles.' },
    { id: 'faq', label: 'FAQ', desc: 'Template for FAQ generation. Use {{KEYWORD}} as a placeholder.' },
  ];

  return `
    <form method="POST" action="/content/engine">

      <!-- AI Model Settings -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">AI Model Settings</h2>
        <p class="text-sm text-gray-500 mb-4">Configure which AI model powers your content generation.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select name="model" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              ${models.map(m => `
                <option value="${m.value}" ${model === m.value ? 'selected' : ''}>${m.label}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Max Tokens (Articles)</label>
            <input name="maxTokens" type="number" value="${maxTokens}" min="1000" max="8192" step="256"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Max Tokens (FAQ)</label>
            <input name="faqMaxTokens" type="number" value="${faqMaxTokens}" min="500" max="4096" step="100"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input name="apiKey" type="password" value="${hasApiKey ? config.apiKey : ''}"
              placeholder="${hasApiKey ? '••••••••' : 'Uses .env key if empty'}"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <p class="text-xs text-gray-400 mt-1">${hasApiKey ? 'Custom key set' : 'Using ANTHROPIC_API_KEY from .env'}</p>
          </div>
        </div>
      </div>

      <!-- Schedule Settings -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Schedule Settings</h2>
        <p class="text-sm text-gray-500 mb-4">Control batch generation behavior for autopublish runs.</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input name="schedule.enabled" type="checkbox" ${schedule.enabled ? 'checked' : ''}
                class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              Enable Scheduled Generation
            </label>
            <p class="text-xs text-gray-400 mt-1">When enabled, autopublish will generate articles automatically.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Articles Per Run</label>
            <input name="schedule.articlesPerRun" type="number" value="${schedule.articlesPerRun || 1}" min="1" max="10"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <p class="text-xs text-gray-400 mt-1">Maximum articles generated per batch (1-10).</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Delay Between Articles (ms)</label>
            <input name="schedule.delayBetweenMs" type="number" value="${schedule.delayBetweenMs || 2000}" min="500" max="30000" step="500"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <p class="text-xs text-gray-400 mt-1">Pause between API calls to avoid rate limits.</p>
          </div>
        </div>
      </div>

      <!-- Prompt Templates -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Prompt Templates</h2>
        <p class="text-sm text-gray-500 mb-4">Edit the AI prompts used for each article type. The base prompt is combined with the type-specific prompt.</p>

        <!-- Prompt sub-tabs -->
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

        <!-- Prompt panels -->
        ${promptTabs.map((t, i) => `
          <div id="prompt-${t.id}" class="prompt-panel ${i > 0 ? 'hidden' : ''}">
            <p class="text-sm text-gray-500 mb-2">${t.desc}</p>
            <textarea name="prompts.${t.id}" rows="12"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >${escHtml(prompts[t.id] || '')}</textarea>
          </div>
        `).join('')}
      </div>

      <!-- Save -->
      <div class="flex justify-end">
        <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
          Save Settings
        </button>
      </div>
    </form>
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
