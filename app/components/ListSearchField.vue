<template>
  <v-text-field
    :model-value="modelValue"
    :label="label || t('common.search')"
    prepend-inner-icon="mdi-magnify"
    clearable
    hide-details
    @update:model-value="emit('update:modelValue', $event ?? '')"
    @keyup.enter="emit('search')"
    @click:clear="onClear"
  />
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "search"]);

const { t } = useAppLocale();

function onClear() {
  emit("update:modelValue", "");
  emit("search");
}
</script>
