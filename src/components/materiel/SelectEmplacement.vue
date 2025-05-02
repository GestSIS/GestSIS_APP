<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import VueSelect from 'vue3-select-component';
import { indexedData } from '../../tools';
import TagCouleur from './TagCouleur.vue';

const model = defineModel();

const couleurStore = useCouleurStore();
const emplacementStore = useEmplacementStore();

await Promise.all([
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
]);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const emplacements = computed(() => {
  const recursive = (id) => {
    return [
      ...(indexedEmplacements.value[id]?.parent_id > 0
        ? recursive(indexedEmplacements.value[id]?.parent_id)
        : []),
      id,
    ];
  };
  return emplacementStore.liste
    .map((e) => {
      const ids = recursive(e.id);
      return {
        ...e,
        value: e.id,
        emplacements: ids,
        label: ids
          .map((id) => indexedEmplacements.value[id].designation)
          .join(' '),
      };
    })
    .sort((a, b) => a.tri - b.tri);
});
</script>

<template>
  <VueSelect
    v-model="model"
    :options="emplacements"
    placeholder="Sélectionnez un emplacement"
  >
    <template #value="{ option }">
      <tag-couleur
        v-for="id in option.emplacements"
        :key="id"
        :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
      >
        {{ indexedEmplacements[id].designation }}
      </tag-couleur>
    </template>
    <template #option="{ option }">
      <tag-couleur
        v-for="id in option.emplacements"
        :key="id"
        :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
      >
        {{ indexedEmplacements[id].designation }}
      </tag-couleur>
    </template>
  </VueSelect>
</template>

<style scoped>
:deep(:root) {
  --vs-option-padding: 4px 6px;
}
:deep(.single-value) {
  overflow: visible !important;
}
:deep(.control) {
  border-radius: var(--bs-border-radius-sm);
  min-height: 31px;
}
:deep(.menu) {
  --vs-menu-offset-top: 0px;
}
:deep(.single-value) {
  font-size: 0.875rem;
  padding-left: 4px;
  display: flex;
}
:deep(.value-container) {
  padding: 0px;
}
</style>
