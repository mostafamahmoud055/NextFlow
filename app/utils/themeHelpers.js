export const THEME_STORAGE_KEY = 'nextflow-theme'

export const THEME_BACKGROUNDS = {
  light: '#f8f9fa',
  dark: '#0f1117',
}

export const THEME_COOKIE_OPTIONS = {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
}

export function resolveThemeName(name) {
  return name === 'light' || name === 'dark' ? name : 'light'
}

export const THEME_INIT_SCRIPT = [
  '(function () {',
  '  try {',
  `    var key = '${THEME_STORAGE_KEY}';`,
  `    var bg = ${JSON.stringify(THEME_BACKGROUNDS)};`,
  '    var theme = "light";',
  '    var cookies = document.cookie ? document.cookie.split("; ") : [];',
  '    for (var i = 0; i < cookies.length; i++) {',
  '      var parts = cookies[i].split("=");',
  '      if (parts[0] === key) { theme = decodeURIComponent(parts[1] || ""); break; }',
  '    }',
  "    if (theme !== 'light' && theme !== 'dark') theme = 'light';",
  '    var root = document.documentElement;',
  '    root.style.colorScheme = theme;',
  '    root.style.backgroundColor = bg[theme];',
  '    root.dataset.theme = theme;',
  '  } catch (e) {}',
  '})();',
].join('\n')


