import {
  getCities,
  getCountries,
  getCountryLabel,
  getCityLabel,
  getStates,
  loadCities,
  resolveCityCode,
  resolveCountryCode,
  searchCities,
  searchCountries,
} from '@/data/geo'

function localizeCountry(country, locale) {
  return {
    code: country.code,
    label: locale === 'ar' ? country.nameAr : country.nameEn,
  }
}

function localizeCity(city, locale) {
  return {
    id: city.id,
    code: city.code ?? String(city.id),
    label: locale === 'ar' ? city.nameAr : city.nameEn,
  }
}

export function useGeo() {
  const { locale } = useAppLocale()

  const countryOptions = computed(() =>
    getCountries().map((country) => localizeCountry(country, locale.value)),
  )

  function stateOptions(countryCode) {
    return computed(() => {
      const code = unref(countryCode)
      if (!code) return []

      return getStates(code).map((state) => ({
        code: state.code,
        label: locale.value === 'ar' ? state.nameAr : state.nameEn,
      }))
    })
  }

  /**
   * Reactive city options for a country. Loads that country’s JSON on demand.
   * Returns `{ options, loading, error }`.
   */
  function cityOptions(countryCode, _stateCode) {
    const options = ref([])
    const loading = ref(false)
    const error = ref(null)
    let requestId = 0

    watch(
      () => unref(countryCode),
      async (code) => {
        const current = ++requestId

        if (!code) {
          options.value = []
          loading.value = false
          error.value = null
          return
        }

        loading.value = true
        error.value = null

        try {
          const cities = await loadCities(code)
          if (current !== requestId) return
          options.value = cities.map((city) => localizeCity(city, locale.value))
        } catch (err) {
          if (current !== requestId) return
          options.value = []
          error.value = err
        } finally {
          if (current === requestId) {
            loading.value = false
          }
        }
      },
      { immediate: true },
    )

    // Re-localize when locale flips without refetching
    watch(locale, () => {
      const cached = getCities(unref(countryCode))
      if (cached.length) {
        options.value = cached.map((city) => localizeCity(city, locale.value))
      }
    })

    return { options, loading, error }
  }

  function searchCountryOptions(query, limit = 50) {
    return computed(() =>
      searchCountries(unref(query), limit).map((country) => localizeCountry(country, locale.value)),
    )
  }

  function searchCityOptions(query, filters = {}, limit = 50) {
    const options = ref([])
    const loading = ref(false)

    watch(
      [() => unref(query), () => unref(filters)],
      async ([q, f]) => {
        const country = f?.countryCode
        if (!country) {
          options.value = []
          return
        }

        loading.value = true
        try {
          const cities = await searchCities(q || '', { ...f, limit })
          options.value = cities.map((city) => localizeCity(city, locale.value))
        } finally {
          loading.value = false
        }
      },
      { immediate: true, deep: true },
    )

    return { options, loading }
  }

  return {
    locale,
    countryOptions,
    stateOptions,
    cityOptions,
    searchCountryOptions,
    searchCityOptions,
    getCountries,
    getStates,
    getCities,
    loadCities,
    searchCountries,
    searchCities,
    resolveCountryCode,
    resolveCityCode,
    getCountryLabel: (code) => getCountryLabel(code, locale.value === 'ar' ? 'ar' : 'en'),
    getCityLabel: (countryCode, cityCode) =>
      getCityLabel(countryCode, cityCode, locale.value === 'ar' ? 'ar' : 'en'),
  }
}
