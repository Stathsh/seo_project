/**
 * Standalone preview page for a template.
 * Returns a complete HTML document — NOT wrapped in layout().
 */

export function templatePreviewPage(template) {
  const t = template;
  const isEditorial = t.layout.style === 'editorial';
  const rounded = t.layout.roundedCards ? 'rounded-lg' : '';

  const twColors = {};
  if (t.colors.brand) twColors.brand = t.colors.brand;
  if (t.colors.accent) twColors.accent = t.colors.accent;
  const twColorsJson = JSON.stringify(twColors);

  const headingFont = `'${t.fonts.heading.family}', ${t.fonts.heading.fallback}`;
  const bodyFont = `'${t.fonts.body.family}', ${t.fonts.body.fallback}`;

  const siteName = 'SmartHomeRanked';
  const navItems = ['Security Cameras', 'Thermostats', 'Smart Speakers', 'Doorbells', 'Lighting'];
  const articleTitle = 'Best Smart Thermostats of 2025: Top 7 Picks Tested &amp; Compared';
  const articleDate = 'February 15, 2025';
  const authorName = 'Alex Stathopoulos';
  const authorInitials = 'AS';

  const tocItems = [
    { id: 'top-picks', text: 'Our Top Picks', depth: 2 },
    { id: 'ecobee-premium', text: 'Ecobee Smart Thermostat Premium', depth: 3 },
    { id: 'nest-learning', text: 'Google Nest Learning Thermostat', depth: 3 },
    { id: 'how-we-tested', text: 'How We Tested', depth: 2 },
    { id: 'what-to-look-for', text: 'What to Look For', depth: 2 },
    { id: 'faq', text: 'FAQ', depth: 2 },
  ];

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${articleTitle} — ${siteName} (${escHtml(t.name)} Preview)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${t.fonts.googleUrl}" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: ${twColorsJson},
          fontFamily: {
            heading: [${fontArrayLiteral(t.fonts.heading)}],
            body: [${fontArrayLiteral(t.fonts.body)}],
          },
        }
      }
    }
  </script>
  <style>
    body { font-family: ${bodyFont}; }
    h1, h2, h3, h4, h5, h6 { font-family: ${headingFont}; }
    ${isEditorial ? `
    .article-prose h2 { border-bottom: 1px solid #e5e5e5; padding-bottom: 0.5rem; }
    .article-prose p { line-height: 1.8; }
    .article-prose blockquote {
      border-left: 3px solid #171717;
      padding-left: 1.25rem;
      font-style: italic;
      color: #404040;
    }
    ` : ''}
  </style>
</head>
<body class="bg-white text-gray-800 antialiased">

  <!-- Header -->
  <header class="${isEditorial ? 'border-b-2 border-gray-900' : 'border-b border-gray-200'} bg-white sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <a href="#" class="flex items-center gap-2 ${isEditorial
          ? 'text-2xl font-black text-gray-900 tracking-tight font-heading'
          : 'text-xl font-bold text-brand-700'
        }">
          ${isEditorial ? '' : `<svg class="w-8 h-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" stroke-width="2">
            <path d="M16 4l12 7v10l-12 7L4 21V11l12-7z" />
            <circle cx="16" cy="16" r="4" />
          </svg>`}
          ${siteName}
        </a>
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          ${navItems.map(item =>
            `<a href="#" class="hover:text-brand-600 transition-colors">${item}</a>`
          ).join('')}
        </nav>
      </div>
    </div>
  </header>

  <!-- Article -->
  <article class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <!-- Breadcrumbs -->
    <nav class="text-sm text-gray-500 mb-4">
      <a href="#" class="hover:text-brand-600">Home</a>
      <span class="mx-1.5">/</span>
      <a href="#" class="hover:text-brand-600">Smart Thermostats</a>
      <span class="mx-1.5">/</span>
      <span class="text-gray-700">Best Smart Thermostats</span>
    </nav>

    <div class="lg:grid lg:grid-cols-[1fr_260px] lg:gap-10 mt-2">
      <!-- Main content -->
      <div class="min-w-0">
        <header class="mb-8 ${isEditorial ? 'pb-6 border-b border-gray-200' : ''}">
          <h1 class="${isEditorial
            ? 'text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight font-heading'
            : 'text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight'
          }">
            ${articleTitle}
          </h1>
          <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span>By <strong class="text-gray-700">${authorName}</strong></span>
            <span>&middot;</span>
            <time>Updated ${articleDate}</time>
          </div>
        </header>

        <!-- Affiliate disclosure -->
        <div class="mb-6 p-3 ${rounded} ${isEditorial ? 'border-l-2 border-gray-400 bg-gray-50' : 'bg-blue-50 border border-blue-100'} text-xs text-gray-500 leading-relaxed">
          <strong>Disclosure:</strong> Our editors independently research, test, and recommend the best products. We may receive commissions on purchases made from our chosen links.
        </div>

        <!-- Article prose -->
        <div class="article-prose ${isEditorial ? 'text-lg leading-[1.85]' : 'text-base leading-relaxed'} text-gray-700">
          <p class="${isEditorial ? 'text-xl text-gray-600 leading-relaxed' : 'text-lg text-gray-600'}">
            A smart thermostat is one of the most impactful upgrades you can make to your home. After spending three months testing seven of the most popular models in real homes, we've identified the best options for every budget and use case.
          </p>

          <h2 id="top-picks" class="${isEditorial
            ? 'text-2xl font-bold text-gray-900 mt-10 mb-4 font-heading'
            : 'text-2xl font-bold text-gray-900 mt-10 mb-4'
          }">Our Top Picks</h2>
          <p>
            After extensive testing, the <strong>Ecobee Smart Thermostat Premium</strong> stands out as our top overall pick. It combines excellent temperature management, a built-in air quality monitor, and seamless smart home integration into one compelling package. For those on a tighter budget, the <strong>Amazon Smart Thermostat</strong> delivers impressive performance at a fraction of the cost.
          </p>

          <h3 id="ecobee-premium" class="${isEditorial
            ? 'text-xl font-bold text-gray-900 mt-8 mb-3 font-heading'
            : 'text-xl font-bold text-gray-900 mt-6 mb-3'
          }">Ecobee Smart Thermostat Premium</h3>
          <p>
            The Ecobee Premium's standout feature is its built-in air quality and humidity monitoring. The large, responsive touchscreen display shows real-time indoor air quality readings and the device can trigger your HVAC fan to circulate air when levels are poor. Setup took us about twenty minutes and the Ecobee app walked us through every step.
          </p>
          ${isEditorial ? `
          <blockquote>
            "The Ecobee Premium is the most complete smart thermostat we have ever tested. It does more than adjust temperature — it actively monitors and improves your indoor environment."
          </blockquote>` : ''}
          <p>
            In our energy usage testing, the Ecobee reduced HVAC runtime by roughly 18% compared to a traditional programmable thermostat. Its occupancy sensing uses both the built-in sensor and optional room sensors to detect whether anyone is home, automatically switching to an energy-saving mode when the house is empty.
          </p>

          <h3 id="nest-learning" class="${isEditorial
            ? 'text-xl font-bold text-gray-900 mt-8 mb-3 font-heading'
            : 'text-xl font-bold text-gray-900 mt-6 mb-3'
          }">Google Nest Learning Thermostat</h3>
          <p>
            The fourth-generation Nest Learning Thermostat brings a completely redesigned look with a larger display and a more refined interface. True to its name, it learns your schedule within the first week and begins making automatic adjustments. The integration with the Google Home ecosystem is seamless if you already have Nest cameras or speakers.
          </p>
          <p>
            Temperature accuracy was excellent in our testing, consistently maintaining within 0.5 degrees Fahrenheit of the set point. The Nest's energy history feature provides detailed daily and monthly reports showing exactly when your HVAC system ran and how much energy it consumed.
          </p>

          <h2 id="how-we-tested" class="${isEditorial
            ? 'text-2xl font-bold text-gray-900 mt-10 mb-4 font-heading'
            : 'text-2xl font-bold text-gray-900 mt-10 mb-4'
          }">How We Tested</h2>
          <p>
            We installed each thermostat in a real home for at least two weeks, measuring temperature accuracy using calibrated sensors placed in three rooms. We tracked HVAC runtime, measured energy consumption with a whole-home energy monitor, and tested every smart home integration including HomeKit, Google Home, Alexa, and SmartThings.
          </p>
          <p>
            Our testing methodology also evaluated setup difficulty (timed from opening the box to completing configuration), app quality on both iOS and Android, voice control responsiveness, and the accuracy of occupancy detection.
          </p>

          <h2 id="what-to-look-for" class="${isEditorial
            ? 'text-2xl font-bold text-gray-900 mt-10 mb-4 font-heading'
            : 'text-2xl font-bold text-gray-900 mt-10 mb-4'
          }">What to Look For in a Smart Thermostat</h2>
          <p>
            When choosing a smart thermostat, compatibility with your HVAC system is the most critical factor. Most modern systems work with common C-wire configurations, but if your home lacks a C-wire, look for models like the Nest that include adapters. Beyond that, consider which smart home ecosystem you use — some thermostats work best with specific platforms.
          </p>

          <h2 id="faq" class="${isEditorial
            ? 'text-2xl font-bold text-gray-900 mt-10 mb-4 font-heading'
            : 'text-2xl font-bold text-gray-900 mt-10 mb-4'
          }">Frequently Asked Questions</h2>
          <div class="${isEditorial ? 'divide-y divide-gray-200' : 'space-y-4'}">
            <div class="${isEditorial ? 'py-4' : 'bg-gray-50 ' + rounded + ' p-4'}">
              <p class="font-semibold text-gray-900">Do smart thermostats really save money?</p>
              <p class="mt-2 text-gray-600">Yes. In our testing, smart thermostats reduced HVAC runtime by 12–23% compared to traditional programmable thermostats, primarily through occupancy detection and learning algorithms.</p>
            </div>
            <div class="${isEditorial ? 'py-4' : 'bg-gray-50 ' + rounded + ' p-4'}">
              <p class="font-semibold text-gray-900">Can I install a smart thermostat myself?</p>
              <p class="mt-2 text-gray-600">Most homeowners can install a smart thermostat in 20–45 minutes. Every model we tested includes step-by-step instructions and compatibility checkers to verify your wiring before purchase.</p>
            </div>
          </div>
        </div>

        <!-- Author box -->
        <div class="mt-12 p-6 ${isEditorial ? 'border-t-2 border-gray-900 pt-6' : 'bg-gray-50 ' + rounded + ' border border-gray-200'}">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-full ${isEditorial ? 'bg-gray-200' : 'bg-brand-100'} flex items-center justify-center flex-shrink-0">
              <span class="text-2xl font-bold ${isEditorial ? 'text-gray-700' : 'text-brand-700'}">${authorInitials}</span>
            </div>
            <div>
              <p class="font-bold text-gray-900">${authorName}</p>
              <p class="text-sm text-gray-500 mt-0.5">Smart Home Editor</p>
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Alex has been testing and reviewing smart home devices for over 5 years. He has personally installed 50+ security cameras, tested every major smart speaker, and automated his entire home.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="hidden lg:block">
        <div class="sticky top-24">
          <div class="${isEditorial ? 'border-l-2 border-gray-900 pl-5' : 'bg-gray-50 ' + rounded + ' p-5 border border-gray-200'}">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Table of Contents</h3>
            <nav>
              <ul class="space-y-1.5 text-sm">
                ${tocItems.map(h => `
                  <li class="${h.depth === 3 ? 'ml-4' : ''}">
                    <a href="#${h.id}" class="text-gray-600 hover:text-brand-600 transition-colors leading-snug block py-0.5">${h.text}</a>
                  </li>
                `).join('')}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </div>
  </article>

  <!-- Footer -->
  <footer class="${isEditorial ? 'border-t-2 border-gray-900 bg-white' : 'bg-gray-50 border-t border-gray-200'} mt-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <a href="#" class="${isEditorial ? 'text-xl font-black text-gray-900 font-heading' : 'text-lg font-bold text-brand-700'}">${siteName}</a>
          <p class="mt-2 text-sm text-gray-500">Expert smart home reviews and comparisons to help you build a smarter, more connected home.</p>
        </div>
        <div>
          <h4 class="font-semibold text-gray-900 text-sm mb-3">Categories</h4>
          <ul class="space-y-2 text-sm text-gray-500">
            ${navItems.map(item => `<li><a href="#" class="hover:text-brand-600">${item}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-gray-900 text-sm mb-3">About</h4>
          <ul class="space-y-2 text-sm text-gray-500">
            <li><a href="#" class="hover:text-brand-600">About Us</a></li>
            <li><a href="#" class="hover:text-brand-600">Contact</a></li>
            <li><a href="#" class="hover:text-brand-600">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 ${isEditorial ? 'border-t border-gray-300' : 'border-t border-gray-200'}">
        <p class="text-xs text-gray-400">&copy; 2025 ${siteName}. All rights reserved. As an Amazon Associate we earn from qualifying purchases.</p>
      </div>
    </div>
  </footer>

  <!-- Back to dashboard -->
  <div class="fixed bottom-6 right-6 z-50">
    <a href="/templates" class="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Dashboard
    </a>
  </div>
</body>
</html>`;
}

function fontArrayLiteral(fontDef) {
  const parts = [`'${fontDef.family}'`];
  fontDef.fallback.split(',').forEach(f => {
    parts.push(`'${f.trim()}'`);
  });
  return parts.join(', ');
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
