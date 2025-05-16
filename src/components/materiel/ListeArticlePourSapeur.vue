<script setup>
import { computed, ref, watch } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import { useStore } from 'vuex';
import { groupedByData, indexedData } from '../../tools';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import TagCouleur from './TagCouleur.vue';
import { useModalStore } from '../../stores/common/Modal.js';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const store = useStore();
const materielCategorieStore = useMaterielCategorieStore();
const materielTypeStore = useMaterielTypeStore();
const couleurStore = useCouleurStore();

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParSapeur(id);
  loading.value = false;
};

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  materielCategorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
  Promise.resolve(await loadArticles()),
]);

watch(() => id, loadArticles);

// Partie pièces
const piecesColonnes = [
  { title: 'N°', key: 'numero' },
  { title: 'Matériel type', key: 'type' },
  { title: 'Taille', key: 'taille' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Attribué', key: 'attribution', type: 'date' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCategories = computed(() =>
  indexedData(materielCategorieStore.liste)
);
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));

const computedData = computed(() =>
  Object.entries(
    groupedByData(
      articles.value
        .map((a) => ({
          ...a,
          type: indexedTypes.value[a.materiel_type_id]?.designation,
          categorie_id:
            indexedTypes.value[a.materiel_type_id]?.materiel_categorie_id,
          sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
        }))
        .sort((a1, a2) => a1.type.localeCompare(a2.type)),
      'categorie_id'
    )
  ).map(([key, values]) => ({ key, data: values, categorie_id: key }))
);

const { showModal } = useModalStore();
const retourMateriel = (materiel) => {
  showModal({
    component: 'ModalRetourUnique',
    data: materiel,
    callback: loadArticles,
  });
};

const attribuer = () => {
  showModal({
    component: 'ModalAttributionMultiple',
    data: ref({ sapeurId: id }),
    size: 2,
    callback: loadArticles,
  });
};

const linearCategories = (categorieId) => {
  if (categorieId === null) {
    return [];
  }
  const categorie = indexedCategories.value[categorieId] ?? null;
  if (categorie === null) {
    return [];
  }
  return [...linearCategories(categorie.parent_id), categorie];
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
    <div class="card-body table-responsive p-0">
      <base-table
        :grouped-data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
      >
        <template #groupeHeader="{ categorie_id }">
          <tag-couleur
            v-for="categorie in linearCategories(categorie_id)"
            :key="categorie.id"
            :couleur="indexedCouleurs[categorie.couleur_id]"
          >
            {{ categorie.designation }}
          </tag-couleur>
        </template>

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
  </div>
</template>

<style></style>
