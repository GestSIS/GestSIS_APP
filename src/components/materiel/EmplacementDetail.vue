<script setup>
import { computed } from 'vue';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { indexedData } from '../../tools';
import { useCouleurStore } from '../../stores/materiel/Couleur';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();

await Promise.all([
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs,
]);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const emplacement = computed(() =>
  emplacementStore.liste.find((e) => e.id === parseInt(id)),
);

const etiquettage = computed(() => {
  const recursive = (emplacement) => {
    return [
      ...(emplacement.parent_id !== null
        ? recursive(indexedEmplacements.value[emplacement.parent_id])
        : []),
      ...(emplacement.est_etiquete ? [emplacement] : []),
    ];
  };
  return recursive(emplacement.value);
});
const formatEmptyString = (str) => (str === '' ? '-' : str);
</script>

<template>
  <div class="card mb-2">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="m-0">Description de l'emplacement</h5>
      <button
        type="button"
        class="btn btn-primary btn-sm"
        @click="editMateriel(rowData.id)"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-3">Nom</div>
        <div class="col-9">{{ emplacement.designation }}</div>
      </div>
      <div class="row">
        <div class="col-3">Etiquettage</div>
        <div class="col-9">
          <span
            v-for="etiquette in etiquettage"
            :key="etiquette.id"
            :style="{
              color: indexedCouleurs[etiquette.couleur_id]?.texte ?? 'black',
              'background-color':
                indexedCouleurs[etiquette.couleur_id]?.fond ?? '',
            }"
            class="me-1 p-1"
            >{{ etiquette.designation }}</span
          >
          <font-awesome-icon
            v-if="!emplacement.est_etiquete"
            v-tooltip.bottom="{
              content:
                'Cet emplacement spécifique n\'est pas étiquetté sur le matériel correspondant',
            }"
            :icon="['far', 'question-circle']"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-3">Remarque</div>
        <div class="col-9">
          {{ formatEmptyString(emplacement.remarque) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
