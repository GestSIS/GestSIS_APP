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
    class="me-1 p-1 border border-black"
  >
    <slot />
  </span>
</template>

<style></style>
