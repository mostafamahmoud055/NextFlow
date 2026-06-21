export function useAppLocale() {
  const { t, locale, locales } = useI18n()

  const isRtl = computed(() => locale.value === 'ar')
  const dir = computed(() => (isRtl.value ? 'rtl' : 'ltr'))

  return {
    t,
    locale,
    locales,
    isRtl,
    dir,
  }
}
