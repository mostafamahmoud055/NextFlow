<template>
  <div class="blank-layout">
    <div class="blank-layout__actions">
      <LanguageToggle />
      <ThemeToggle />
    </div>
    <slot />
  </div>
</template>

<style src="~/assets/styles/auth.css"></style>

<style scoped>
.blank-layout {
  position: relative;
  min-height: 100vh;
}

.blank-layout__actions {
  position: absolute;
  top: 16px;
  inset-inline-end: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 600px) {
  .blank-layout__actions {
    top: 24px;
    inset-inline-end: 24px;
  }
}
</style>
