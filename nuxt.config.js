import { LOCALE_INIT_SCRIPT } from './app/utils/localeHelpers.js'
import { THEME_INIT_SCRIPT } from './app/utils/themeHelpers.js'

const appBaseUrl = process.env.NUXT_PUBLIC_I18N_BASE_URL
  || process.env.NUXT_PUBLIC_APP_URL
  || 'http://localhost:3000'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  future: {
    compatibilityVersion: 4,
  },

  hooks: {
    'nitro:config'(nitroConfig) {
      nitroConfig.runtimeConfig ??= {}
      nitroConfig.runtimeConfig.public ??= {}
      nitroConfig.runtimeConfig.public.i18n ??= {}
      nitroConfig.runtimeConfig.public.i18n.baseUrl = appBaseUrl
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN,
      googleRedirectUri: process.env.NUXT_PUBLIC_GOOGLE_REDIRECT_URI,
    },
  },

  css: [
    '~/assets/styles/theme.css',
    '@mdi/font/css/materialdesignicons.min.css',
  ],

  app: {
    head: {
      title: 'Next Flow',
      meta: [
        { name: 'description', content: 'Next Flow operational dashboard for sales, inventory, and team management.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap',
          media: 'print',
          onload: "this.media='all'",
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
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'vuetify-nuxt-module',
  ],

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    baseUrl: appBaseUrl,
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
        defaultSet: "mdi",
        sets: ["mdi"],
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
