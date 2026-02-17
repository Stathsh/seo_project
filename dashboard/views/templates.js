/**
 * Templates gallery page for the dashboard
 */

export function templatesPage({ templates, activeTemplateId, message }) {
  return `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Templates (${templates.length})</h1>
        <p class="text-sm text-gray-500 mt-1">Choose a visual theme for your site. Preview each template before applying.</p>
      </div>
    </div>

    ${message ? `<div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">${escHtml(message)}</div>` : ''}

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${templates.map(t => templateCard(t, t.id === activeTemplateId)).join('')}
    </div>
  `;
}

function templateCard(template, isActive) {
  const brandColors = template.colors.brand;
  const accentColors = template.colors.accent;

  const swatchKeys = ['100', '300', '500', '700', '900'];
  const swatches = swatchKeys
    .filter(k => brandColors[k])
    .map(k => brandColors[k]);

  return `
    <div class="bg-white rounded-lg border ${isActive ? 'border-dash-500 ring-2 ring-dash-200' : 'border-gray-200'} overflow-hidden">
      <!-- Swatch bar -->
      <div class="flex h-3">
        ${swatches.map(color => `<div class="flex-1" style="background-color: ${color}"></div>`).join('')}
        ${accentColors['500'] ? `<div class="flex-1" style="background-color: ${accentColors['500']}"></div>` : ''}
      </div>

      <div class="p-5">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">${escHtml(template.name)}</h3>
            <p class="text-xs text-gray-400 font-mono mt-0.5">${template.id}</p>
          </div>
          ${isActive
            ? '<span class="text-xs px-2 py-0.5 rounded-full bg-dash-100 text-dash-600 font-semibold">Active</span>'
            : `<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${template.layout.style}</span>`
          }
        </div>

        <p class="text-sm text-gray-600 mt-3 leading-relaxed">${escHtml(template.description)}</p>

        <!-- Font preview -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p class="text-xs text-gray-400 mb-1">Fonts</p>
          <p class="text-sm text-gray-700">
            <strong>Headings:</strong> ${escHtml(template.fonts.heading.family)}
            <span class="text-gray-400 mx-1">&middot;</span>
            <strong>Body:</strong> ${escHtml(template.fonts.body.family)}
          </p>
        </div>

        <!-- Color palette -->
        <div class="mt-3 flex gap-1.5">
          ${swatches.map(color =>
            `<div class="w-8 h-8 rounded border border-gray-200" style="background-color: ${color}" title="${color}"></div>`
          ).join('')}
          ${accentColors['500']
            ? `<div class="w-8 h-8 rounded border border-gray-200" style="background-color: ${accentColors['500']}" title="Accent: ${accentColors['500']}"></div>`
            : ''}
        </div>

        <!-- Actions -->
        <div class="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <a href="/templates/preview/${template.id}" target="_blank"
            class="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </a>
          ${isActive
            ? `<span class="text-sm text-dash-600 font-medium px-4 py-2 inline-flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Applied
              </span>`
            : `<form method="POST" action="/templates/apply/${template.id}" class="inline">
                <button type="submit" class="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 inline-flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Apply
                </button>
              </form>`
          }
        </div>
      </div>
    </div>
  `;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
