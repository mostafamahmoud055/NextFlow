import { GEO_CITIES, GEO_COUNTRIES, GEO_STATES } from './data'

export { GEO_CITIES, GEO_COUNTRIES, GEO_STATES } from './data'
export {
  GEO_CURRENCIES,
  GEO_TIMEZONES,
  SETUP_CURRENCY_CODES,
  SETUP_TIMEZONE_VALUES,
} from './currencies'

let indexes = null

function buildIndexes() {
  const countriesByCode = new Map()
  const statesByCountry = new Map()
  const citiesByCountry = new Map()
  const citiesByCountryState = new Map()

  for (const country of GEO_COUNTRIES) {
    countriesByCode.set(country.code, country)
    statesByCountry.set(country.code, [])
    citiesByCountry.set(country.code, [])
  }

  for (const state of GEO_STATES) {
    const list = statesByCountry.get(state.countryCode) ?? []
    list.push(state)
    statesByCountry.set(state.countryCode, list)
  }

  for (const city of GEO_CITIES) {
    const countryList = citiesByCountry.get(city.countryCode) ?? []
    countryList.push(city)
    citiesByCountry.set(city.countryCode, countryList)

    const stateKey = `${city.countryCode}:${city.stateCode}`
    const stateList = citiesByCountryState.get(stateKey) ?? []
    stateList.push(city)
    citiesByCountryState.set(stateKey, stateList)
  }

  for (const list of citiesByCountry.values()) {
    list.sort((a, b) => a.nameEn.localeCompare(b.nameEn))
  }

  return {
    countriesByCode,
    statesByCountry,
    citiesByCountry,
    citiesByCountryState,
  }
}

function getIndexes() {
  if (!indexes) {
    indexes = buildIndexes()
  }

  return indexes
}

function normalizeQuery(query) {
  return query.trim().toLowerCase()
}

function matchesQuery(value, query) {
  return value.toLowerCase().includes(query)
}

export function getCountries() {
  return GEO_COUNTRIES
}

export function getCountryByCode(code) {
  if (!code) return undefined
  return getIndexes().countriesByCode.get(code.toUpperCase())
}

export function getStates(countryCode) {
  if (!countryCode) return []
  return getIndexes().statesByCountry.get(countryCode.toUpperCase()) ?? []
}

export function getCities(countryCode, stateCode) {
  if (!countryCode) return []

  const code = countryCode.toUpperCase()

  if (stateCode) {
    return getIndexes().citiesByCountryState.get(`${code}:${stateCode}`) ?? []
  }

  return getIndexes().citiesByCountry.get(code) ?? []
}

export function getCityByCode(countryCode, cityCode) {
  if (!countryCode || !cityCode) return undefined

  return getCities(countryCode).find((city) => city.code === cityCode)
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

export function searchCities(query, options = {}) {
  const q = normalizeQuery(query)
  const { countryCode, stateCode, limit = 50 } = options

  let pool

  if (countryCode && stateCode) {
    pool = getCities(countryCode, stateCode)
  } else if (countryCode) {
    pool = getCities(countryCode)
  } else {
    pool = GEO_CITIES
  }

  if (!q) {
    return pool.slice(0, limit)
  }

  return pool
    .filter((city) =>
      matchesQuery(city.code, q)
      || matchesQuery(city.nameEn, q)
      || city.nameAr.includes(query.trim()),
    )
    .slice(0, limit)
}

/** Resolve a stored country value (code or legacy name) to an ISO code. */
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

/** Resolve a stored city value (code or legacy name) within a country. */
export function resolveCityCode(countryCode, value) {
  if (!value || !countryCode) return ''

  const cities = getCities(countryCode)
  const byCode = cities.find((city) => city.code === value)

  if (byCode) return byCode.code

  const match = cities.find((city) =>
    city.nameEn.toLowerCase() === value.toLowerCase()
    || city.nameAr === value,
  )

  return match?.code ?? value
}

export function getCountryLabel(code, locale = 'en') {
  const country = getCountryByCode(code)
  if (!country) return code
  return locale === 'ar' ? country.nameAr : country.nameEn
}

export function getCityLabel(countryCode, cityCode, locale = 'en') {
  const city = getCityByCode(countryCode, cityCode)
  if (!city) return cityCode
  return locale === 'ar' ? city.nameAr : city.nameEn
}
