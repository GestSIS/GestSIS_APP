<script setup>
import { computed, ref, watch } from 'vue';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import { useStore } from 'vuex';
import { indexedData } from '../../tools';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const store = useStore();
const emplacementStore = useEmplacementStore();
const materielTypeStore = useMaterielTypeStore();

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParMaterielType(id);
  loading.value = false;
};

await Promise.all([
  emplacementStore.fetchEmplacements(),
  materielTypeStore.fetchMaterielTypes(),
  store.dispatch('fetchListeSapeur'),
  Promise.resolve(await loadArticles()),
]);

watch(() => id, loadArticles);

const emplacements = computed(() => emplacementStore.liste);
const types = computed(() => materielTypeStore.liste);

const indexedTypes = computed(() => indexedData(types.value));
const indexedEmplacements = computed(() => indexedData(emplacements.value));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));

const linearEmplacements = (emplacement_id) => {
  if (emplacement_id === null) {
    return [];
  }
  const emplacement = indexedEmplacements[emplacement_id];
  return [...linearEmplacements(emplacement.parent_id), emplacement];
};

const computedData = computed(() =>
  articles.value.map((a) => ({
    ...a,
    emplacements: linearEmplacements(a.emplacement_id),
    sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
  })),
);

// Partie pièces
const piecesColonnes = [
  ...(materielType.value.est_numerote
    ? [{ title: 'Numéro', key: 'numero' }]
    : []),
  { title: 'Emplacement', key: 'emplacement', slot: 'emplacement' },
  ...(materielType.value.est_taillee
    ? [{ title: 'Taille', key: 'taille' }]
    : []),
  { title: 'Compartiment', key: 'compartiment' },
  // { title: 'Inventaire', key: 'inventaire' },
  // { title: 'Maintenance', key: 'maintenance' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Ajouté', key: 'created_at', type: 'date' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
</script>

<template>
  <div class="card mb-2">
    <div class="card-header">
      <h5 class="m-0">Pièces ({{ articles.length }})</h5>
    </div>
    <base-table
      :data="computedData"
      no-data="Aucune pièce"
      :fields="piecesColonnes"
    >
      <template #emplacement="{ rowData }">
        <div v-if="rowData.sapeur_id" class="badge bg-primary">
          {{ rowData.sapeur }}
        </div>
        <div v-else v-for="e in rowData.emplacements" :key="e.id">
          {{ e }}
        </div>
      </template>

      <template #actions="{ rowData }"> TODO: </template>
    </base-table>
  </div>
</template>

<style></style>
