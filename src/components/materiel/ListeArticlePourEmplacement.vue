<script setup>
import { computed, ref, watch } from 'vue';
import { groupedByData, indexedData } from '../../tools';
import ArticleService from '../../services/materiel/ArticleService';
import useConfirmation from '../../hooks/useConfirmation';
import { useModalStore } from '../../stores/common/Modal.js';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import TagCouleur from './TagCouleur.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielCategorieStore = useMaterielCategorieStore();
const materielTypeStore = useMaterielTypeStore();
const couleurStore = useCouleurStore();

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParEmplacement(id);
  loading.value = false;
};

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  materielCategorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
]);
loadArticles();

watch(() => id, loadArticles);

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedCategories = computed(() =>
  indexedData(materielCategorieStore.liste),
);

const computedData = computed(() =>
  Object.entries(
    groupedByData(
      articles.value.map((a) => ({
        ...a,
        type: indexedTypes.value[a.materiel_type_id],
        categorie_id:
          indexedTypes.value[a.materiel_type_id]?.materiel_categorie_id,
      })),
      'categorie_id',
    ),
  ).map(([key, values]) => ({ key, data: values, categorie_id: key })),
);

const piecesColonnes = [
  { title: 'Type', key: 'type', slot: 'type' },
  { title: 'Compartiment', key: 'compartiment' },
  { title: 'Numéro', key: 'numero' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Ajouté', key: 'created_at', type: 'date' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];

const { showModal } = useModalStore();
const editMateriel = (materiel) =>
  showModal({
    component: 'ModalMateriel',
    data: materiel,
    callback: loadArticles,
  });

const attribuerMateriel = (materiel) =>
  showModal({
    component: 'ModalAttributionUnique',
    data: materiel,
    callback: loadArticles,
  });

const ajouter = () =>
  showModal({
    component: 'ModalAjoutArticleMultiple',
    callback: loadArticles,
    data: { emplacementId: id },
    size: 2,
  });

const { confirm } = useConfirmation();
const supprimer = (article) =>
  confirm(
    'Voulez-vous vraiment supprimer cet article ?',
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(loadArticles);

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
    <div class="card-header d-flex justify-content-between">
      <h5>Pièces ({{ articles.length }})</h5>
      <button title="Ajouter" class="btn btn-primary" @click="ajouter">
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
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

        <template #type="{ rowData }">
          {{ rowData.type.designation }}
        </template>
        <template #actions="{ rowData }">
          <button
            title="Infos"
            class="btn btn-outline-secondary border-0"
            @click="editMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'info-circle']" />
          </button>
          <button
            v-if="rowData.type.est_attribuable && rowData.sapeur_id !== null"
            title="Attribuer"
            class="btn btn-outline-primary border-0"
            @click="retourMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
          </button>
          <button
            v-if="rowData.type.est_attribuable && rowData.sapeur_id === null"
            title="Attribuer"
            class="btn btn-outline-primary border-0"
            @click="attribuerMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
          </button>
          <button
            title="Supprimer"
            class="btn btn-outline-danger border-0"
            @click="supprimer(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style></style>
