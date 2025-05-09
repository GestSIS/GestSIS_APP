<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import VueSelect from 'vue3-select-component';
import { indexedData } from '../../tools';
import TagCouleur from './TagCouleur.vue';

const { label, categorieIdToIgnore } = defineProps({
  label: {
    type: String,
    default: () => '',
  },
  categorieIdToIgnore: {
    type: Number,
    default: () => -1,
  },
});

const model = defineModel();

const couleurStore = useCouleurStore();
const categorieStore = useMaterielCategorieStore();

await Promise.all([
  categorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
]);

const indexedCategories = computed(() => indexedData(categorieStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const categories = computed(() => {
  const recursive = (id) => {
    return [
      ...(indexedCategories.value[id]?.parent_id > 0
        ? recursive(indexedCategories.value[id]?.parent_id)
        : []),
      id,
    ];
  };
  return categorieStore.liste
    .map((e) => {
      const ids = recursive(e.id);
      return {
        ...e,
        value: e.id,
        categories: ids,
        label: ids
          .map((id) => indexedCategories.value[id].designation)
          .join(' '),
      };
    })
    .sort((a, b) => a.tri - b.tri)
    .filter(
      (c) =>
        c.id !== categorieIdToIgnore &&
        !c.categories.includes(categorieIdToIgnore),
    );
});
</script>

<template>
  <div>
    <label v-if="label">{{ label }}</label>
    <VueSelect
      v-model="model"
      :options="categories"
      placeholder="Sélectionnez un categorie"
    >
      <template #value="{ option }">
        <tag-couleur
          v-for="id in option.categories"
          :key="id"
          :couleur="indexedCouleurs[indexedCategories[id].couleur_id]"
        >
          {{ indexedCategories[id].designation }}
        </tag-couleur>
      </template>
      <template #option="{ option }">
        <tag-couleur
          v-for="id in option.categories"
          :key="id"
          :couleur="indexedCouleurs[indexedCategories[id].couleur_id]"
        >
          {{ indexedCategories[id].designation }}
        </tag-couleur>
      </template>
    </VueSelect>
  </div>
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
