<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { groupedByData, indexedData } from '../../tools';
import { useModalStore } from '../../stores/common/Modal.js';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import useHasPermission from '../../hooks/usePermission';
import permissions from '../../store/permissions';
import ArticleService from '../../services/materiel/ArticleService';
import TagCouleur from './TagCouleur.vue';

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

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParSapeur(id);
  loading.value = false;
};
watchEffect(loadArticles);

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  materielCategorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
]);

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
  indexedData(materielCategorieStore.liste),
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
      'categorie_id',
    ),
  ).map(([key, values]) => ({ key, data: values, categorie_id: key })),
);

const { showModal } = useModalStore();
const infoMateriel = (materiel) =>
  showModal({
    component: 'ModalArticleInfo',
    data: materiel,
    size: 1,
  });

const editMateriel = (materiel) =>
  showModal({
    component: 'ModalArticle',
    data: materiel,
    callback: loadArticles,
  });

const retourMateriel = (materiel) =>
  showModal({
    component: 'ModalRetourUnique',
    data: materiel,
    callback: loadArticles,
  });

const attribuer = () =>
  showModal({
    component: 'ModalAttributionMultiple',
    data: ref({ sapeurId: id }),
    size: 2,
    callback: loadArticles,
  });

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
  <base-card>
    <template #title>Matériel distribué ({{ articles.length }})</template>
    <template #header>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary"
        @click="attribuer"
      >
        Attribuer du matériel
      </button>
    </template>
    <template #body-table>
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

        <template #emplacement="{ rowData }">
          <div v-if="rowData.sapeur_id" class="badge bg-primary">
            {{ rowData.sapeur }}
          </div>
          <div v-for="e in rowData.emplacements" v-else :key="e.id">
            {{ e }}
          </div>
        </template>

        <template #actions="{ rowData }">
          <button
            title="Info"
            class="btn btn-outline-secondary border-0"
            @click="infoMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'info-circle']" />
          </button>
          <button
            v-if="hasEditPermission"
            title="Modifier"
            class="btn btn-outline-secondary border-0"
            @click="editMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            title="Retour"
            class="btn btn-outline-primary border-0"
            @click="retourMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>

<style></style>
