<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import VueSelect from 'vue3-select-component';
import 'vue3-select-component/styles';
import TagCouleur from './TagCouleur.vue';

const { label } = defineProps({
  label: {
    type: String,
    default: () => '',
  },
});

const model = defineModel();

const couleurStore = useCouleurStore();
await couleurStore.fetchCouleurs();
const couleurs = computed(() =>
  couleurStore.liste
    .slice(0)
    .map((c) => ({ ...c, label: c.nom, value: c.id }))
    .sort((c1, c2) => c1.nom.localeCompare(c2.nom)),
);
</script>

<template>
  <div>
    <label v-if="label">{{ label }}</label>
    <vue-select
      v-model="model"
      :options="couleurs"
      placeholder="Sélectionnez une couleur"
    >
      <template #value="{ option }">
        <tag-couleur :couleur="option">
          {{ option.nom }}
        </tag-couleur>
      </template>
      <template #option="{ option }">
        <tag-couleur :couleur="option">
          {{ option.nom }}
        </tag-couleur>
      </template>
    </vue-select>
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
