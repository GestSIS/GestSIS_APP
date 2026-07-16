<script setup>
import { computed } from "vue";
import ArticleService from "../../services/materiel/ArticleService";
import TagCouleur from "./TagCouleur.vue";
import { indexedData } from "../../tools/index.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useMaterielCategorieStore } from "../../stores/materiel/Categorie";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const { loading, articles, hideDownload, emplacement, refresh } = defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
  hideDownload: {
    type: Boolean,
    default: false,
  },
  articles: {
    type: Array,
    required: true,
  },
  emplacement: {
    type: Object,
    required: true,
  },
  refresh: {
    type: Function,
    required: true,
  },
});

const materielCategorieStore = useMaterielCategorieStore();
const couleurStore = useCouleurStore();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedCategories = computed(() => indexedData(materielCategorieStore.liste));
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

const piecesColonnes = computed(() => [
  { title: "Type", key: "typeDesignation" },
  ...(emplacement?.est_compartimentable ? [{ title: "Compartiment", key: "compartiment" }] : []),
  { title: "Numéro", key: "numero" },
  { title: "Taille", key: "taille" },
  { title: "Remarque", key: "remarque" },
  { title: "Ajouté", key: "created_at", type: "date" },
  { title: "Actions", key: "id", slot: "actions" },
]);

const { showModal, confirm } = useModalStore();
const infoMateriel = (materiel) =>
  //TODO: Gérer le cas affichageIndividuel
  showModal({
    component: "ModalArticleInfo",
    data: materiel,
    size: 1,
  });

const editMateriel = (materiel) =>
  showModal({
    component: "ModalArticle",
    data: materiel,
    callback: refresh,
  });

const attribuerMateriel = (materiel) =>
  showModal({
    component: "ModalAttributionUnique",
    data: materiel,
    callback: refresh,
  });

const supprimer = (article) =>
  confirm(
    "Voulez-vous vraiment supprimer cet article ?",
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(refresh);
</script>

<template>
  <base-table
    :loading="loading"
    :grouped-data="articles"
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
        v-if="hasEditPermission && rowData.type.est_attribuable && rowData.sapeur_id !== null"
        title="Retour"
        class="btn btn-outline-primary border-0"
        @click="retourMateriel(rowData)"
      >
        <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
      </button>
      <button
        v-if="hasEditPermission && rowData.type.est_attribuable && rowData.sapeur_id === null"
        title="Attribuer"
        class="btn btn-outline-primary border-0"
        @click="attribuerMateriel(rowData)"
      >
        <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
      </button>
      <button
        v-if="hasEditPermission"
        title="Supprimer"
        class="btn btn-outline-danger border-0"
        @click="supprimer(rowData)"
      >
        <font-awesome-icon :icon="['far', 'trash-alt']" />
      </button>
    </template>
  </base-table>
</template>
