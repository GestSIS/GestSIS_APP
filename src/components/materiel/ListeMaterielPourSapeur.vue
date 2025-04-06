<script setup>
import { computed, ref, watch } from 'vue';
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
const materielTypeStore = useMaterielTypeStore();

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParSapeur(id);
  loading.value = false;
};

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  Promise.resolve(await loadArticles()),
]);

watch(() => id, loadArticles);

const types = computed(() => materielTypeStore.liste);

// Partie pièces
const piecesColonnes = [
  { title: 'Matériel type', key: 'type' },
  { title: 'Numéro', key: 'numero' },
  { title: 'Taille', key: 'taille' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Ajouté', key: 'created_at', type: 'date' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];

const indexedTypes = computed(() => indexedData(types.value));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));

const computedData = computed(() =>
  articles.value
    .map((a) => ({
      ...a,
      type: indexedTypes.value[a.materiel_type_id]?.designation,
      sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
    }))
    .sort((a1, a2) => a1.type.localeCompare(a2.type)),
);

const attribuer = () => {
  store.commit('SHOW_MODAL', {
    component: 'ModalAttributionMultiple',
    size: 2,
    data: { sapeurId: id },
  });
};

const retourMateriel = (materiel) => {
  store.commit('SHOW_MODAL', {
    component: 'ModalRetourUnique',
    data: materiel,
  });
};
</script>

<template>
  <div class="card mb-2">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title m-0">Matériel distribué ({{ articles.length }})</h5>
      <button class="btn btn-primary" @click="attribuer">
        Attribuer du matériel
      </button>
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

      <template #actions="{ rowData }">
        <button
          title="Retour"
          class="btn btn-outline-primary border-0"
          @click="retourMateriel(rowData)"
        >
          <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
        </button>
      </template>
    </base-table>
  </div>
</template>

<style></style>
