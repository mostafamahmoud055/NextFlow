import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function resolveUser(payload) {
    if (!payload || typeof payload !== "object") return null;
    return payload.data ?? payload;
}

export const useAuthStore = defineStore("auth", () => {
    const config = useRuntimeConfig();
    const { fetchApi } = useApi();

    const user = useState("auth-user", () => null);
    const initialized = useState("auth-initialized", () => false);

    let initPromise = null;

    const isAuthenticated = computed(() => !!user.value);

    async function fetchUser() {
        const result = await fetchApi("/me", { silent: true });

        if (result.error) {
            if (result.error.status === 401) {
                user.value = null;
            }
        } else {
            user.value = resolveUser(result.data);
        }

        initialized.value = true;

        return result;
    }

    async function initAuth() {
        if (initialized.value) {
            if (import.meta.server || user.value) return;
            initialized.value = false;
        }

        if (!initPromise) {
            initPromise = fetchUser().finally(() => {
                initPromise = null;
            });
        }

        await initPromise;
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

        return result;
    }

    function loginWithGoogle() {
        window.location.href = `${config.public.googleRedirectUri}`;
    }

    return {
        user,
        initialized,
        isAuthenticated,
        initAuth,
        fetchUser,
        login,
        register,
        logout,
        loginWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        forgotPassword,
        resetPassword,
    };
});
