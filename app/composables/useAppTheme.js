import { useTheme as useVuetifyTheme } from 'vuetify'
import {
  THEME_COOKIE_OPTIONS,
  THEME_STORAGE_KEY,
  resolveThemeName,
} from '~/utils/themeHelpers'

export function useAppTheme() {
  const vuetifyTheme = useVuetifyTheme()
  const themeCookie = useCookie(THEME_STORAGE_KEY, THEME_COOKIE_OPTIONS)

  const isDark = computed(() => vuetifyTheme.current.value.dark)

  function setTheme(name) {
    if (name !== 'light' && name !== 'dark') return

    const theme = resolveThemeName(name)

    vuetifyTheme.change(theme)
    themeCookie.value = theme
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
  }
}
