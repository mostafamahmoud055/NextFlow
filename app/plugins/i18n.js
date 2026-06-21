import { LOCALE_COOKIE_KEY, LOCALE_COOKIE_OPTIONS, resolveLocale } from '~/utils/localeHelpers'

export default defineNuxtPlugin({
  name: 'i18n-persist',
  order: -30,
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const localeCookie = useCookie(LOCALE_COOKIE_KEY, LOCALE_COOKIE_OPTIONS)
    const resolvedLocale = useState('i18n:resolved-locale', () => '')
    const saved = resolveLocale(localeCookie.value)

    resolvedLocale.value = saved

    nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
      const locale = resolveLocale(newLocale)
      localeCookie.value = locale
      resolvedLocale.value = locale
    })
  },
})
