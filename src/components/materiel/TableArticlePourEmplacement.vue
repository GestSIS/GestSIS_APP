<script setup>
import { computed } from "vue";
import TagCouleur from "./TagCouleur.vue";
import { indexedData } from "../../tools/index.js";
import { libelleSuppression } from "../../tools/materiel.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useMaterielCategorieStore } from "../../stores/materiel/Categorie";
import { useHasPermission } from "../../composables/useHasPermission.js";
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
  { title: "Matériel", key: "typeDesignation" },
  { title: "Emplacement", key: "emplacement_sort", slot: "emplacement" },
  ...(emplacement?.est_compartimentable ? [{ title: "Compartiment", key: "compartiment" }] : []),
  { title: "Numéro", key: "numero" },
  { title: "Taille", key: "taille" },
  { title: "Remarque", key: "remarque", slot: "remarque" },
  { title: "Ajouté", key: "created_at", type: "date" },
  { title: "Actions", slot: "actions" },
]);

const { showModal } = useModalStore();
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
  showModal({
    component: "ModalSuppressionArticle",
    data: { articles: [article] },
    callback: refresh,
  });

const restaurer = (article) =>
  showModal({
    component: "ModalRestaurationArticle",
    data: { article },
    callback: refresh,
  });

const classeLigne = (article) => (article.supprime_le ? "text-muted opacity-50" : "");
</script>

<template>
  <base-table
    :loading="loading"
    :grouped-data="articles"
    no-data="Aucune pièce"
    :fields="piecesColonnes"
    :selectable="true"
    :row-class="classeLigne"
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
      <tag-couleur
        v-for="e in rowData.emplacements"
        :key="e.id"
        :couleur="indexedCouleurs[e.couleur_id]"
        >{{ e.designation }}</tag-couleur
      >
    </template>

    <template #remarque="{ rowData }">
      <div v-if="rowData.supprime_le" class="fst-italic">
        {{ libelleSuppression(rowData) }}
      </div>
      {{ rowData.remarque }}
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
        v-if="hasEditPermission && rowData.supprime_le"
        title="Restaurer"
        class="btn btn-outline-success border-0"
        @click="restaurer(rowData)"
      >
        <font-awesome-icon :icon="['fas', 'rotate-left']" />
      </button>
      <template v-else>
        <button
          v-if="hasEditPermission"
          title="Modifier"
          class="btn btn-outline-secondary border-0"
          @click="editMateriel(rowData)"
        >
          <font-awesome-icon :icon="['far', 'edit']" />
        </button>
        <button
          v-if="hasEditPermission && rowData.type.est_attribuable"
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
    </template>
  </base-table>
</template>
