<script setup>
import { computed, ref, watch } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import TagCouleur from './TagCouleur.vue';
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
const couleurStore = useCouleurStore();
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
  couleurStore.fetchCouleurs(),
  materielTypeStore.fetchMaterielTypes(),
  store.dispatch('fetchListeSapeur'),
  Promise.resolve(await loadArticles()),
]);

watch(() => id, loadArticles);

const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id))
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

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const linearEmplacements = (emplacement_id) => {
  if (emplacement_id === null) {
    return [];
  }
  const emplacement = indexedEmplacements.value[emplacement_id] ?? null;
  if (emplacement === null) {
    return [];
  }
  return [...linearEmplacements(emplacement.parent_id), emplacement];
};

const computedData = computed(() =>
  articles.value.map((a) => ({
    ...a,
    emplacements: linearEmplacements(a.emplacement_id),
    sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
  }))
);

const retourMateriel = (materiel) => {
  store.commit('SHOW_MODAL', {
    component: 'ModalRetourUnique',
    data: materiel,
  });
};

const attribuerMateriel = (materiel) => {
  store.commit('SHOW_MODAL', {
    component: 'ModalAttributionUnique',
    data: { materiel },
  });
};
</script>

<template>
  <div class="card mb-2">
    <div class="card-header">
      <h5 class="m-0">Pièces ({{ articles.length }})</h5>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
      >
        <template #emplacement="{ rowData }">
          <div v-if="rowData.sapeur_id" class="badge bg-primary">
            {{ rowData.sapeur }}
          </div>
          <div v-else>
            <tag-couleur
              v-for="e in rowData.emplacements"
              :key="e.id"
              :couleur="indexedCouleurs[e.couleur_id]"
              >{{ e.designation }}</tag-couleur
            >
          </div>
        </template>

        <template #actions="{ rowData }">
          <!-- <button
            title="Infos"
            class="btn btn-outline-primary border-0"
            @click="infoMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'info']" />
          </button> -->
          <button
            v-if="materielType.est_attribuable && rowData.sapeur_id !== null"
            title="Attribuer"
            class="btn btn-outline-primary border-0"
            @click="retourMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
          </button>
          <button
            v-if="materielType.est_attribuable && rowData.sapeur_id === null"
            title="Attribuer"
            class="btn btn-outline-primary border-0"
            @click="attribuerMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style></style>
