export const LOCALE_COOKIE_KEY = 'nextflow-locale'

export const LOCALE_COOKIE_OPTIONS = {
  default: () => 'en',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
}

export const SUPPORTED_LOCALES = ['en', 'ar']

export function resolveLocale(code) {
  return SUPPORTED_LOCALES.includes(code) ? code : 'en'
}

export function getLocaleDirection(code) {
  return code === 'ar' ? 'rtl' : 'ltr'
}

export const LOCALE_INIT_SCRIPT = [
  '(function () {',
  '  try {',
  `    var key = '${LOCALE_COOKIE_KEY}';`,
  '    var locale = "en";',
  '    var cookies = document.cookie ? document.cookie.split("; ") : [];',
  '    for (var i = 0; i < cookies.length; i++) {',
  '      var parts = cookies[i].split("=");',
  '      if (parts[0] === key) { locale = decodeURIComponent(parts[1] || ""); break; }',
  '    }',
  "    if (locale !== 'en' && locale !== 'ar') locale = 'en';",
  "    var dir = locale === 'ar' ? 'rtl' : 'ltr';",
  '    var root = document.documentElement;',
  '    root.setAttribute("lang", locale);',
  '    root.setAttribute("dir", dir);',
  '    root.dataset.locale = locale;',
  '  } catch (e) {}',
  '})();',
].join('\n')
