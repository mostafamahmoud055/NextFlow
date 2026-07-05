import {
  getCities,
  getCountries,
  getCountryLabel,
  getCityLabel,
  getStates,
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
    code: city.code,
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

  function cityOptions(countryCode, stateCode) {
    return computed(() => {
      const country = unref(countryCode)
      if (!country) return []

      const state = stateCode ? unref(stateCode) : undefined
      return getCities(country, state).map((city) => localizeCity(city, locale.value))
    })
  }

  function searchCountryOptions(query, limit = 50) {
    return computed(() =>
      searchCountries(unref(query), limit).map((country) => localizeCountry(country, locale.value)),
    )
  }

  function searchCityOptions(query, filters = {}, limit = 50) {
    return computed(() =>
      searchCities(unref(query), { ...unref(filters), limit }).map((city) => localizeCity(city, locale.value)),
    )
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
    searchCountries,
    searchCities,
    resolveCountryCode,
    resolveCityCode,
    getCountryLabel: (code) => getCountryLabel(code, locale.value === 'ar' ? 'ar' : 'en'),
    getCityLabel: (countryCode, cityCode) =>
      getCityLabel(countryCode, cityCode, locale.value === 'ar' ? 'ar' : 'en'),
  }
}
