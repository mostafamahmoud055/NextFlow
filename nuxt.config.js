import { LOCALE_INIT_SCRIPT } from './app/utils/localeHelpers.js'
import { THEME_INIT_SCRIPT } from './app/utils/themeHelpers.js'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  css: [
    '~/assets/styles/theme.css',
    '~/assets/styles/auth.css',
  ],

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=block',
        },
      ],
      script: [
        {
          key: 'locale-init',
          innerHTML: LOCALE_INIT_SCRIPT,
          type: 'text/javascript',
          tagPosition: 'head',
        },
        {
          key: 'theme-init',
          innerHTML: THEME_INIT_SCRIPT,
          type: 'text/javascript',
          tagPosition: 'head',
        },
      ],
    },
  },

  modules: [
    '@nuxtjs/i18n',
    'vuetify-nuxt-module',
  ],

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    restructureDir: '.',
    langDir: 'locales',
    detectBrowserLanguage: false,
    experimental: {
      preload: true,
    },
    locales: [
      {
        code: 'en',
        name: 'English',
        language: 'en-US',
        file: 'en.json',
        dir: 'ltr',
      },
      {
        code: 'ar',
        name: 'العربية',
        language: 'ar-SA',
        file: 'ar.json',
        dir: 'rtl',
      },
    ],
  },

  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      icons: {
        defaultSet: 'mdi',
      },
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              background: '#f8f9fa',
              surface: '#ffffff',
              'surface-bright': '#ffffff',
              primary: '#000000',
              secondary: '#6b7280',
              success: '#22c55e',
              error: '#ef4444',
              warning: '#f59e0b',
              info: '#3b82f6',
              'on-primary': '#ffffff',
              'on-surface': '#111827',
              'on-background': '#111827',
            },
          },
          dark: {
            dark: true,
            colors: {
              background: '#0f1117',
              surface: '#1a1d26',
              'surface-bright': '#252830',
              primary: '#ffffff',
              secondary: '#9ca3af',
              success: '#22c55e',
              error: '#f87171',
              warning: '#fbbf24',
              info: '#60a5fa',
              'on-primary': '#000000',
              'on-surface': '#f3f4f6',
              'on-background': '#e5e7eb',
            },
          },
        },
      },
      defaults: {
        global: {
          style: 'font-family: Inter, sans-serif',
        },
        VBtn: {
          rounded: 'pill',
          elevation: 0,
        },
        VTextField: {
          rounded: 'lg',
          variant: 'outlined',
          color: 'primary',
        },
      },
    },
  },
})
