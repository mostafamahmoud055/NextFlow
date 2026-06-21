<template>
  <v-text-field
    v-model="model"
    class="auth-input mb-1"
    :label="label"
    :type="fieldType"
    :rules="rules"
    :prepend-inner-icon="prependIcon"
    :append-inner-icon="appendIcon"
    variant="outlined"
    rounded="lg"
    color="primary"
    hide-details="auto"
    @click:append-inner="togglePassword"
  />
</template>

<script setup>
const model = defineModel({ required: true })

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  rules: {
    type: Array,
    default: () => [],
  },
  prependIcon: {
    type: String,
    default: undefined,
  },
  showPasswordToggle: {
    type: Boolean,
    default: false,
  },
})

const showPassword = ref(false)

const fieldType = computed(() => {
  if (!props.showPasswordToggle) return props.type
  return showPassword.value ? 'text' : 'password'
})

const appendIcon = computed(() => {
  if (!props.showPasswordToggle) return undefined
  return showPassword.value ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
})

function togglePassword() {
  if (props.showPasswordToggle) {
    showPassword.value = !showPassword.value
  }
}
</script>
