export default defineNuxtRouteMiddleware(async (to) => {
    const auth = useAuthStore();
  
    await auth.initAuth();
  
    const setupCompleted = auth.setupCompleted;
  
    // خلص setup بالفعل لكن حاول يدخل /setup يدوي → ارفضه ورجّعه للرئيسية
    if (setupCompleted && to.path === "/setup") {
      return navigateTo("/");
    }
  
    // لسه مخلصش setup وهو أصلاً رايح لصفحة /setup → سيبه يكمل عادي
    if (!setupCompleted && to.path === "/setup") {
      return;
    }
  
    // لسه مخلصش setup ورايح لصفحة تانية → اجبره يروح /setup
    if (!setupCompleted) {
      return navigateTo("/setup");
    }
  });