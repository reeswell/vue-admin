<script setup lang="ts">
import { setupPageHeader } from '~/composables/setups'

setupPageHeader()
</script>

<template>
  <router-view />
</template>

<style>
@import '~/assets/css/element-overrides.css';

html, body, #app {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
