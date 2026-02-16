/**
 * Standalone login page (no layout wrapper)
 */
export function loginPage({ error = '' } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login — SEO Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af' },
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
  <div class="w-full max-w-sm">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div class="text-center mb-6">
        <svg class="w-10 h-10 text-brand-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h1 class="text-xl font-bold text-gray-900">SEO Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">Sign in to continue</p>
      </div>
      ${error ? `<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">${error}</div>` : ''}
      <form method="POST" action="/login" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" id="username" name="username" required autofocus
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" id="password" name="password" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        </div>
        <button type="submit"
          class="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
          Sign in
        </button>
      </form>
    </div>
    <p class="text-center text-xs text-gray-400 mt-4">
      Set ADMIN_USER &amp; ADMIN_PASSWORD in .env to configure credentials.
    </p>
  </div>
</body>
</html>`;
}
