<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const default_layout = "default";
const loading = "empty";
const route = useRoute();

const layout = computed(
  () => (!route.name ? loading : route.meta.layout || default_layout) + "-layout",
);
</script>

<template>
  <component :is="layout">
    <suspense>
      <router-view />
      <template #fallback></template>
    </suspense>
  </component>
</template>

<style lang="scss">
@use "./assets/sass/main.scss" as *;
</style>
