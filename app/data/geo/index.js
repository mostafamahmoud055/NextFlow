import GEO_COUNTRIES from '../../assets/geo/countries.json'
import GEO_CURRENCIES from '../../assets/geo/currencies.json'
import GEO_TIMEZONES from '../../assets/geo/timezones.json'

export { GEO_COUNTRIES, GEO_CURRENCIES, GEO_TIMEZONES }

export const SETUP_CURRENCY_CODES = GEO_CURRENCIES.map((currency) => currency.code)
export const SETUP_TIMEZONE_VALUES = GEO_TIMEZONES.map((timezone) => timezone.value)

/** Vite code-split loaders — one chunk per country, fetched only when requested. */
const cityLoaders = import.meta.glob('../../assets/geo/cities/*.json')

const citiesCache = new Map()
const citiesPending = new Map()

function normalizeQuery(query) {
  return query.trim().toLowerCase()
}

function matchesQuery(value, query) {
  return value.toLowerCase().includes(query)
}

function cityLoaderKey(countryCode) {
  const code = countryCode.toUpperCase()
  return Object.keys(cityLoaders).find((key) =>
    key.endsWith(`/cities/${code}.json`) || key.endsWith(`\\cities\\${code}.json`),
  )
}

let indexes = null

function buildIndexes() {
  const countriesByCode = new Map()

  for (const country of GEO_COUNTRIES) {
    countriesByCode.set(country.code, country)
  }

  return { countriesByCode }
}

function getIndexes() {
  if (!indexes) {
    indexes = buildIndexes()
  }

  return indexes
}

export function getCountries() {
  return GEO_COUNTRIES
}

export function getCountryByCode(code) {
  if (!code) return undefined
  return getIndexes().countriesByCode.get(code.toUpperCase())
}

/** @deprecated States dataset removed — returns []. */
export function getStates(_countryCode) {
  return []
}

/**
 * Lazily load cities for a country (cached after first fetch).
 * Does not pull other countries into the bundle.
 */
export async function loadCities(countryCode) {
  if (!countryCode) return []

  const code = countryCode.toUpperCase()

  if (citiesCache.has(code)) {
    return citiesCache.get(code)
  }

  if (citiesPending.has(code)) {
    return citiesPending.get(code)
  }

  const key = cityLoaderKey(code)
  const loader = key ? cityLoaders[key] : null

  if (!loader) {
    citiesCache.set(code, [])
    return []
  }

  const promise = loader()
    .then((mod) => {
      const list = Array.isArray(mod) ? mod : (mod?.default ?? [])
      citiesCache.set(code, list)
      citiesPending.delete(code)
      return list
    })
    .catch((error) => {
      citiesPending.delete(code)
      console.error(`[geo] failed to load cities for ${code}`, error)
      citiesCache.set(code, [])
      return []
    })

  citiesPending.set(code, promise)
  return promise
}

/** Sync access — only returns data already loaded via `loadCities`. */
export function getCities(countryCode, _stateCode) {
  if (!countryCode) return []
  return citiesCache.get(countryCode.toUpperCase()) ?? []
}

export async function getCityByCode(countryCode, cityCode) {
  if (!countryCode || cityCode == null || cityCode === '') return undefined

  const cities = await loadCities(countryCode)
  const needle = String(cityCode)

  return cities.find((city) =>
    String(city.id) === needle
    || city.code === needle,
  )
}

export function searchCountries(query, limit = 50) {
  const q = normalizeQuery(query)

  if (!q) {
    return GEO_COUNTRIES.slice(0, limit)
  }

  return GEO_COUNTRIES
    .filter((country) =>
      matchesQuery(country.code, q)
      || matchesQuery(country.nameEn, q)
      || country.nameAr.includes(query.trim()),
    )
    .slice(0, limit)
}

export async function searchCities(query, options = {}) {
  const q = normalizeQuery(query)
  const { countryCode, limit = 50 } = options

  if (!countryCode) return []

  const pool = await loadCities(countryCode)

  if (!q) {
    return pool.slice(0, limit)
  }

  return pool
    .filter((city) =>
      matchesQuery(String(city.id), q)
      || (city.code && matchesQuery(city.code, q))
      || matchesQuery(city.nameEn, q)
      || city.nameAr.includes(query.trim()),
    )
    .slice(0, limit)
}

export function resolveCountryCode(value) {
  if (!value) return ''

  const upper = value.toUpperCase()
  if (getCountryByCode(upper)) return upper

  const match = GEO_COUNTRIES.find((country) =>
    country.nameEn.toLowerCase() === value.toLowerCase()
    || country.nameAr === value,
  )

  return match?.code ?? value
}

export async function resolveCityCode(countryCode, value) {
  if (!value || !countryCode) return ''

  const cities = await loadCities(countryCode)
  const needle = String(value)

  const byId = cities.find((city) => String(city.id) === needle || city.code === needle)
  if (byId) return byId.code ?? String(byId.id)

  const match = cities.find((city) =>
    city.nameEn.toLowerCase() === needle.toLowerCase()
    || city.nameAr === needle,
  )

  return match ? (match.code ?? String(match.id)) : value
}

export function getCountryLabel(code, locale = 'en') {
  const country = getCountryByCode(code)
  if (!country) return code
  return locale === 'ar' ? country.nameAr : country.nameEn
}

export async function getCityLabel(countryCode, cityCode, locale = 'en') {
  const city = await getCityByCode(countryCode, cityCode)
  if (!city) return cityCode
  return locale === 'ar' ? city.nameAr : city.nameEn
}

/** Drop cached city lists (useful in tests). */
export function clearCitiesCache() {
  citiesCache.clear()
  citiesPending.clear()
}
