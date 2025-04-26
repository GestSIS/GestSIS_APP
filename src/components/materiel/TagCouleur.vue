<script setup>
const { couleur } = defineProps({
  couleur: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <span
    :style="{
      color: couleur?.texte ?? 'black',
      'background-color': couleur?.fond ?? '',
    }"
    class="custom-badge me-1 p-1 border border-black"
  >
    <slot />
  </span>
</template>

<style scoped>
.custom-badge {
  --bs-badge-font-size: 0.75em;
  font-size: var(--bs-badge-font-size);
}
</style>
