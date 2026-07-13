import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";
import { GEO_CURRENCIES } from "@/data/geo/currencies";
import { useCompaniesStore } from "@/stores/companies";
import { enumValue } from "@/utils/enumValue";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function mapGeoCurrency(currency) {
  return {
    code: currency.code,
    name_en: currency.nameEn,
    name_ar: currency.nameAr,
    country_code: currency.countryCode,
    decimal_places: currency.code === "IQD" ? 0 : 2,
  };
}

export const useCurrenciesStore = defineStore("currencies", () => {
  const { fetchApi } = useApi();
  const companies = useCompaniesStore();

  const items = ref(GEO_CURRENCIES.map(mapGeoCurrency));
  const baseCurrency = ref(null);
  const filters = ref({ search: "" });
  const loading = ref(false);
  const saving = ref(false);
  const loaded = ref(false);
  const loadedCompany = ref(null);

  const filteredItems = computed(() => {
    const q = (filters.value.search || "").trim().toLowerCase();
    if (!q) return items.value;

    return items.value.filter((currency) => {
      return (
        currency.code.toLowerCase().includes(q) ||
        currency.name_en.toLowerCase().includes(q) ||
        currency.name_ar.includes(q) ||
        currency.country_code.toLowerCase().includes(q)
      );
    });
  });

  function companyUuid() {
    return useCookie("nf_tenant").value?.id ?? null;
  }

  async function fetchList(force = false) {
    const uuid = companyUuid();
    if (!uuid) {
      baseCurrency.value = null;
      loaded.value = false;
      loadedCompany.value = null;
      return { error: { message: "No company selected" } };
    }

    if (loaded.value && !force && loadedCompany.value === uuid) {
      return { error: null };
    }

    loading.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}`);
      if (result.error) {
        baseCurrency.value = null;
        return result;
      }

      const company = unwrap(result.data) || {};
      baseCurrency.value = enumValue(company.base_currency);
      loaded.value = true;
      loadedCompany.value = uuid;
      return result;
    } finally {
      loading.value = false;
    }
  }

  async function setBaseCurrency(code) {
    const uuid = companyUuid();
    if (!uuid) {
      return { company: null, error: { message: "No company selected" } };
    }

    if (baseCurrency.value === code) {
      return { company: null, error: null };
    }

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/base-currency`, {
        method: "PATCH",
        body: { base_currency: code },
      });
      const company = result.error ? null : unwrap(result.data);
      if (company) {
        baseCurrency.value = enumValue(company.base_currency) || code;
        companies.setItem(company);
      }
      return { company, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  function setFilters(next) {
    filters.value = { ...filters.value, ...next };
  }

  return {
    items,
    filteredItems,
    baseCurrency,
    filters,
    loading,
    saving,
    loaded,
    fetchList,
    setBaseCurrency,
    setFilters,
  };
});
