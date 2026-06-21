export function useAuthRules() {
  const { t } = useAppLocale()

  const emailRules = computed(() => [
    (v) => !!v || t('validation.email.required'),
    (v) => /.+@.+\..+/.test(v) || t('validation.email.invalid'),
  ])

  const passwordRules = computed(() => [
    (v) => !!v || t('validation.password.required'),
    (v) => v.length >= 8 || t('validation.password.minLength'),
  ])

  const nameRules = computed(() => [
    (v) => !!v || t('validation.name.required'),
    (v) => v.length >= 2 || t('validation.name.minLength'),
  ])

  function createConfirmPasswordRules(password) {
    return computed(() => [
      (v) => !!v || t('validation.confirmPassword.required'),
      (v) => v === password() || t('validation.confirmPassword.mismatch'),
    ])
  }

  return {
    emailRules,
    passwordRules,
    nameRules,
    createConfirmPasswordRules,
  }
}
