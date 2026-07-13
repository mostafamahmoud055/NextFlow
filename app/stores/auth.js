import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function resolveUser(payload) {
    if (!payload) return null;
    if (payload?.data) return payload.data;
    return payload;
}

function companyDisplayName(company) {
    return company?.name_en || company?.name_ar || "Company";
}

export const useAuthStore = defineStore("auth", () => {
    const config = useRuntimeConfig();
    const { fetchApi } = useApi();
    const tenantCookie = useCookie("nf_tenant");

    const user = useState("auth-user", () => null);
    const initialized = useState("auth-initialized", () => false);

    let initPromise = null;

    const isAuthenticated = computed(() => !!user.value);
    const roles = computed(() => user.value?.roles ?? []);
    const permissions = computed(() => user.value?.permissions ?? []);
    const companies = computed(() => user.value?.companies ?? []);
    const hasCompanies = computed(() => companies.value.length > 0);
    const tenantId = computed(() => tenantCookie.value?.id ?? null);
    const tenantName = computed(() => {
        if (tenantCookie.value?.name) {
            return tenantCookie.value.name;
        }

        const match = companies.value.find((company) => company.uuid === tenantId.value);

        return match ? companyDisplayName(match) : null;
    });
    const hasTenant = computed(() => Boolean(tenantId.value));
    const tenant = computed(() => {
        if (!tenantId.value) return null;

        return { id: tenantId.value, name: tenantName.value };
    });

    function syncTenantCookie() {
        const id = tenantCookie.value?.id;

        if (!id) return;

        const match = companies.value.find((company) => company.uuid === id);

        if (!match) {
            tenantCookie.value = null;
            return;
        }

        tenantCookie.value = {
            id: match.uuid,
            name: companyDisplayName(match),
        };
    }

    async function fetchUser() {
        const result = await fetchApi("/me", { silent: true });

        if (result.error) {
            if (result.error.status === 401) {
                user.value = null;
                clearTenant();
            }
        } else {
            user.value = resolveUser(result.data);
            syncTenantCookie();
        }

        initialized.value = true;

        return result;
    }

    async function initAuth() {
        if (initialized.value) {
            return { error: null };
        }

        if (initPromise) return initPromise;

        initPromise = fetchUser().finally(() => (initPromise = null));

        return initPromise;
    }

    async function ensureCsrf() {
        await fetchApi("/sanctum/csrf-cookie", {
            baseURL: config.public.apiOrigin,
            silent: true,
        });
    }

    async function authenticate(path, body) {
        await ensureCsrf();

        const result = await fetchApi(path, {
            method: "POST",
            body,
        });

        if (!result.error) {
            await fetchUser();
        }

        return result;
    }

    const login = (credentials) => authenticate("/login", credentials);
    const register = (payload) => authenticate("/register", payload);

    async function sendEmailOtp() {
        await ensureCsrf();
        return fetchApi("/email/send-otp", { method: "POST" });
    }

    async function verifyEmailOtp(otp) {
        await ensureCsrf();

        const result = await fetchApi("/email/verify-otp", {
            method: "POST",
            body: { otp },
        });

        if (!result.error) {
            await fetchUser();
        }

        return result;
    }

    async function forgotPassword(email) {
        await ensureCsrf();

        return fetchApi("/forgot-password", {
            method: "POST",
            body: { email },
        });
    }

    async function resetPassword(payload) {
        await ensureCsrf();

        return fetchApi("/reset-password", {
            method: "POST",
            body: payload,
        });
    }

    async function logout() {
        const result = await fetchApi("/logout", {
            method: "POST",
        });

        user.value = null;
        initialized.value = true;
        clearTenant();

        return result;
    }

    function setTenant(company) {
        if (!company?.uuid) return;

        tenantCookie.value = {
            id: company.uuid,
            name: companyDisplayName(company),
        };
    }

    function clearTenant() {
        tenantCookie.value = null;
    }

    function upsertCompany(company) {
        if (!user.value || !company?.uuid) return;

        const list = [...(user.value.companies ?? [])];
        const i = list.findIndex((c) => c.uuid === company.uuid);
        const row = {
            id: company.id,
            uuid: company.uuid,
            name_ar: company.name_ar,
            name_en: company.name_en,
            logo_url: company.logo_url ?? null,
            status: company.status?.value ?? company.status ?? null,
        };

        if (i === -1) list.unshift(row);
        else list[i] = { ...list[i], ...row };

        user.value = { ...user.value, companies: list };
        syncTenantCookie();
    }

    function removeCompany(uuid) {
        if (!user.value || !uuid) return;

        user.value = {
            ...user.value,
            companies: (user.value.companies ?? []).filter((c) => c.uuid !== uuid),
        };

        if (tenantCookie.value?.id === uuid) clearTenant();
        else syncTenantCookie();
    }

    function loginWithGoogle() {
        window.location.href = `${config.public.googleRedirectUri}`;
    }

    return {
        user,
        initialized,
        isAuthenticated,
        roles,
        permissions,
        companies,
        hasCompanies,
        tenantId,
        tenantName,
        hasTenant,
        tenant,
        initAuth,
        fetchUser,
        login,
        register,
        logout,
        setTenant,
        clearTenant,
        upsertCompany,
        removeCompany,
        loginWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        forgotPassword,
        resetPassword,
    };
});
