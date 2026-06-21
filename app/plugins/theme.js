import {
  THEME_COOKIE_OPTIONS,
  THEME_STORAGE_KEY,
  resolveThemeName,
} from '~/utils/themeHelpers'

export default defineNuxtPlugin({
  name: 'theme-init',
  order: -20,
  setup(nuxtApp) {
    const themeCookie = useCookie(THEME_STORAGE_KEY, THEME_COOKIE_OPTIONS)

    nuxtApp.hook('vuetify:before-create', ({ vuetifyOptions }) => {
      const name = resolveThemeName(themeCookie.value)

      if (vuetifyOptions.theme) {
        vuetifyOptions.theme.defaultTheme = name
      }
    })
  },
})
