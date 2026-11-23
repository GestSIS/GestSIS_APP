<script setup>
// Étiquette d'emplacement : couleurs de l'étiquette (fond / texte), icône facultative
// (ex. hangar, véhicule) avant le contenu.
const { couleur, icone } = defineProps({
  couleur: {
    type: Object,
    required: true,
  },
  icone: {
    type: Array,
    default: null,
  },
});
</script>

<template>
  <span
    :style="{
      color: couleur?.texte ?? 'black',
      'background-color': couleur?.fond ?? '',
    }"
    class="custom-badge me-1"
  >
    <font-awesome-icon v-if="icone" :icon="icone" />
    <slot />
  </span>
</template>

<style scoped>
.custom-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.1em 0.5em;
  border: 1px solid rgb(0 0 0 / 30%);
  border-radius: 0.25rem;
  font-size: 0.8em;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}
</style>
