export function productsPage({ products, message }) {
  return `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Products (${products.length})</h1>
    </div>

    ${message ? `<div class="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">${message}</div>` : ''}

    <!-- Add product form -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Product</h2>
      <form method="POST" action="/products" class="space-y-3">
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

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
