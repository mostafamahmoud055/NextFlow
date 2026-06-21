import { resolveLocale } from '~/utils/localeHelpers'

export function useLocaleSwitcher() {
  const { locale, locales, setLocale } = useI18n()

  function switchLocale(code) {
    const nextLocale = resolveLocale(code)
    if (nextLocale === locale.value) return

    setLocale(nextLocale)
  }

  function toggleLocale() {
    switchLocale(locale.value === 'en' ? 'ar' : 'en')
  }

  const nextLocale = computed(() => (locale.value === 'en' ? 'ar' : 'en'))

  return {
    locale,
    locales,
    nextLocale,
    switchLocale,
    toggleLocale,
  }
}
