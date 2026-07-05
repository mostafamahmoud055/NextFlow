import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

/**
 * بياخد الـ response اللي راجع من الـ API ويطلّع منه بيانات اليوزر الفعلية.
 * بعض الـ endpoints بترجع البيانات جوه { data: {...} } وبعضها بيرجعها direct،
 * فالفانكشن دي بتوحّد الشكلين في مكان واحد بدل ما نكرر الشرط في كل مكان.
 */
function resolveUser(payload) {
    if (!payload) return null;
    if (payload?.data) return payload.data;
    return payload;
}

/**
 * القيمة الافتراضية للـ tenant context.
 * اتحطت كـ function (مش object literal) عشان تتنادى من مكانين (initial state + resetContext)
 * من غير ما نكرر نفس الـ object، ومن غير ما يبقى فيه reference مشترك بين الاستخدامين.
 */
const defaultContext = () => ({
    has_companies: false,
    tenant_id: null,
    tenant_name: null,
    setup_completed: false,
});

export const useAuthStore = defineStore("auth", () => {
    // ==== Dependencies / External state ====
    const config = useRuntimeConfig();
    const { fetchApi } = useApi();
    const tenantCookie = useCookie("nf_tenant"); // بيخزن الـ tenant الحالي في كوكي عشان يفضل موجود بين الـ requests (مهم للـ SSR)

    // ==== Core reactive state ====
    // استخدمنا useState (مش ref) عشان نضمن إن الـ state يبقى SSR-safe في Nuxt
    // (يتشارك صح بين السيرفر والكلاينت من غير hydration mismatch)
    const user = useState("auth-user", () => null);
    const initialized = useState("auth-initialized", () => false); // بيبين هل أول محاولة تحقق من اليوزر خلصت ولا لسه
    const context = useState("auth-context", defaultContext); // بيانات الـ tenant/company الحالية

    // بيمنع تكرار نداء fetchUser أكتر من مرة في نفس الوقت (لو اتنادت initAuth أكتر من مرة بسرعة)
    let initPromise = null;

    // ==== Computed getters ====
    // كلهم read-only ومشتقين من user/context، بيسهلوا الاستخدام في الـ components
    const isAuthenticated = computed(() => !!user.value);
    const hasCompanies = computed(() => Boolean(context.value?.has_companies));
    const tenantId = computed(() => context.value?.tenant_id ?? null);
    const tenantName = computed(() => context.value?.tenant_name ?? null);
    const setupCompleted = computed(() => Boolean(context.value?.setup_completed));
    const hasTenant = computed(() => Boolean(tenantId.value));
    // بيرجع object بسيط { id, name } بدل ما تفضل مضطر تجيب tenantId و tenantName منفصلين كل مرة
    const tenant = computed(() => {
        if (!tenantId.value) return null;
        return { id: tenantId.value, name: tenantName.value };
    });

    /**
     * بيجيب بيانات اليوزر الحالي من /me.
     * لو رجع 401 → معناها مفيش session صالحة، فبنصفّر اليوزر والـ context.
     * لو نجح → بنحدّث اليوزر وبعدين نجيب الـ tenant context بتاعه.
     * initialized بتتحط true في الحالتين عشان الـ UI يعرف إن أول تحقق خلص (سواء نجح أو فشل).
     */
    async function fetchUser() {
        const result = await fetchApi("/me", { silent: true });

        if (result.error) {
            if (result.error.status === 401) {
                user.value = null;
                resetContext();
            }
        } else {
            user.value = resolveUser(result.data);
            await fetchContext();
        }

        initialized.value = true;

        return result;
    }

    /**
     * بيجيب الـ tenant context بتاع اليوزر الحالي (الشركة اللي شغال عليها دلوقتي، إلخ).
     * لو مفيش يوزر أصلاً، بيصفّر الـ context على طول من غير ما يعمل request.
     */
    async function fetchContext() {
        if (!user.value) {
            resetContext();
            return { error: null };
        }

        const result = await fetchApi("/auth/context", { silent: true });

        if (!result.error) {
            const payload = result.data?.data ?? result.data ?? {};
            patchContext(payload);
        }

        return result;
    }

    /**
     * نقطة الدخول الأساسية لتهيئة الـ auth state (بتتنادى عادة في app init / middleware).
     * لو فيه نداء شغال بالفعل، بترجع نفس الـ promise بدل ما تعمل request جديد مكرر
     * (مهم لو اتنادت من أكتر من component في نفس اللحظة).
     */
    async function initAuth() {
        if (initPromise) return initPromise;

        initPromise = fetchUser().finally(() => (initPromise = null));

        return initPromise;
    }

    /**
     * بتضمن إن الـ CSRF cookie موجود قبل أي عملية تعديل (login/register/logout/إلخ).
     * لازم تتنادى قبل أي POST request بتتعامل مع Laravel Sanctum.
     */
    async function ensureCsrf() {
        await fetchApi("/sanctum/csrf-cookie", {
            baseURL: config.public.apiOrigin,
            silent: true,
        });
    }

    /**
     * Helper مشترك لأي عملية auth بتعمل POST وبعدين محتاجة تحدّث بيانات اليوزر
     * (زي login و register). بتضمن الـ CSRF الأول، وبعد النجاح بتعمل fetchUser
     * عشان الـ state يتحدث فوراً من غير ما الكاتب المستخدم يضطر يعملها يدوي.
     */
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

    // login و register كلاهما بيستخدموا نفس الـ authenticate() فرق بس الـ endpoint
    const login = (credentials) => authenticate("/login", credentials);
    const register = (payload) => authenticate("/register", payload);

    /**
     * بيبعت OTP على إيميل اليوزر (خطوة تحقق، من غير ما يحدث الـ user state).
     */
    async function sendEmailOtp() {
        await ensureCsrf();
        return fetchApi("/email/send-otp", { method: "POST" });
    }

    /**
     * بيتحقق من الـ OTP اللي دخله اليوزر، ولو صح بيحدث بيانات اليوزر
     * (زي ما بيحصل بعد login/register).
     */
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

    /**
     * بيبعت طلب "نسيت كلمة السر" على الإيميل. مفيش تحديث لأي state هنا،
     * لأن اليوزر لسه مش مسجل دخول.
     */
    async function forgotPassword(email) {
        await ensureCsrf();

        return fetchApi("/forgot-password", {
            method: "POST",
            body: { email },
        });
    }

    /**
     * بيعمل reset فعلي لكلمة السر (بعد ما اليوزر يضغط على اللينك اللي جاله بالإيميل).
     */
    async function resetPassword(payload) {
        await ensureCsrf();

        return fetchApi("/reset-password", {
            method: "POST",
            body: payload,
        });
    }

    /**
     * بيسجل خروج اليوزر من السيرفر وبيصفّر كل الـ local state
     * (user + context) بغض النظر هل الـ request نجح ولا لأ،
     * عشان الـ UI يرجع فوراً لحالة "مش مسجل دخول".
     */
    async function logout() {
        const result = await fetchApi("/logout", {
            method: "POST",
        });

        user.value = null;
        initialized.value = true;
        resetContext();

        return result;
    }

    /**
     * بتعمل merge لجزء من بيانات الـ context مع الموجود حالياً (partial update)
     * بدل استبدال الـ context كله. كمان بتحدث/بتصفّر الـ tenant cookie
     * على حسب لو فيه tenant_id ولا لأ، عشان الكوكي يفضل متزامن مع الـ state.
     */
    function patchContext(partial) {
        const next = { ...context.value, ...(partial || {}) };
        context.value = next;

        if (next.tenant_id) {
            tenantCookie.value = {
                id: next.tenant_id,
                name: next.tenant_name,
            };
        } else {
            tenantCookie.value = null;
        }
    }

    /**
     * بيغيّر الـ tenant (الشركة) الحالية اللي اليوزر شغال عليها.
     * بتعمل "optimistic update" الأول (بتحدث الـ UI فوراً بالاسم اللي عندنا محلياً)
     * وبعدين بتعمل fetchContext فعلي عشان تجيب البيانات الحقيقية من السيرفر
     * وتتأكد إن كل حاجة متزامنة (زي setup_completed مثلاً).
     */
    async function setTenant(company) {
        if (!company?.uuid) return;

        patchContext({
            has_companies: true,
            tenant_id: company.uuid,
            tenant_name: company.name_en || company.name_ar || "Company",
        });

        await fetchContext();
    }

    /**
     * بيرجّع الـ context لقيمته الافتراضية وبيمسح الـ tenant cookie.
     * بتتنادى لما اليوزر يعمل logout أو لما الـ session تبقى غير صالحة (401).
     */
    function resetContext() {
        context.value = defaultContext();
        tenantCookie.value = null;
    }

    /**
     * بتحول اليوزر لصفحة تسجيل الدخول بجوجل (OAuth redirect).
     * مفيش state بتتحدث هنا لأن التحديث بيحصل بعد الـ redirect رجوع للتطبيق.
     */
    function loginWithGoogle() {
        window.location.href = `${config.public.googleRedirectUri}`;
    }

    return {
        user,
        initialized,
        isAuthenticated,
        context,
        hasCompanies,
        tenantId,
        tenantName,
        setupCompleted,
        hasTenant,
        tenant,
        initAuth,
        fetchUser,
        fetchContext,
        login,
        register,
        logout,
        setTenant,
        patchContext,
        loginWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        forgotPassword,
        resetPassword,
    };
});