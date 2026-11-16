<script setup>
import { computed, ref, watchEffect } from "vue";
import { exportFileName, groupedByData, indexedData } from "../../tools/index.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { useMaterielCategorieStore } from "../../stores/materiel/Categorie";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";
import ArticleService from "../../services/materiel/ArticleService";
import TagCouleur from "./TagCouleur.vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import { useDownload } from "../../composables/useDownload.js";
import { formatDate } from "../../tools/formatters.js";

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const sapeurStore = useSapeurStore();
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

// Articles rendus : attributions closes, chargées uniquement à la demande
const afficherRendus = ref(false);
const attributionsRendues = ref([]);
const loadingRendus = ref(false);
const loadRendus = async () => {
  if (!afficherRendus.value) {
    attributionsRendues.value = [];
    return;
  }
  loadingRendus.value = true;
  try {
    const attributions = await ArticleService.getAttributionsSapeur(id);
    attributionsRendues.value = attributions.filter((a) => a.fin);
  } finally {
    loadingRendus.value = false;
  }
};
watchEffect(loadRendus);

// Une attribution close devient une ligne « rendue » de la même liste : l'article
// tel qu'il est aujourd'hui, avec les dates de début et de fin de l'attribution.
const lignesRendues = computed(() =>
  attributionsRendues.value
    .filter((a) => a.article)
    .map((a) => ({
      ...a.article,
      ligneId: `rendu-${a.id}`,
      attribution: a.debut,
      rendu_le: a.fin,
      rendu: true,
    })),
);

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  materielCategorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
]);

// Partie pièces
const piecesColonnes = computed(() => [
  { title: "N°", key: "numero" },
  { title: "Matériel type", key: "type" },
  { title: "Taille", key: "taille" },
  { title: "Remarque", key: "remarque" },
  { title: "Attribué", key: "attribution", type: "date" },
  ...(afficherRendus.value ? [{ title: "Rendu le", slot: "renduLe", sortKey: "rendu_le" }] : []),
  { title: "Actions", slot: "actions" },
]);

const classeLigne = (row) => (row.rendu ? "text-muted" : "");

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCategories = computed(() => indexedData(materielCategorieStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));

const computedData = computed(() =>
  Object.entries(
    groupedByData(
      [
        ...articles.value.map((a) => ({ ...a, ligneId: `article-${a.id}`, rendu: false })),
        ...lignesRendues.value,
      ]
        .map((a) => ({
          ...a,
          type: indexedTypes.value[a.materiel_type_id]?.designation ?? "",
          categorie_id: indexedTypes.value[a.materiel_type_id]?.materiel_categorie_id,
          sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? "",
        }))
        // Dans chaque type : le matériel encore attribué d'abord, puis les articles rendus.
        .sort((a1, a2) => a1.type.localeCompare(a2.type) || Number(a1.rendu) - Number(a2.rendu)),
      "categorie_id",
    ),
  ).map(([key, values]) => ({
    key,
    label: linearCategories(parseInt(key))
      .map((c) => c.designation)
      .join(" > "),
    data: values,
    categorie_id: key,
  })),
);

const { showModal } = useModalStore();
const { download } = useDownload();
const infoMateriel = (materiel) =>
  showModal({
    component: "ModalArticleInfo",
    data: materiel,
    size: 1,
  });

const editMateriel = (materiel) =>
  showModal({
    component: "ModalArticle",
    data: materiel,
    callback: loadArticles,
  });

const retourMateriel = (materiel) =>
  showModal({
    component: "ModalRetourUnique",
    data: materiel,
    callback: loadArticles,
  });

const attribuer = () =>
  showModal({
    component: "ModalAttributionMultiple",
    data: ref({ sapeurId: id }),
    size: 2,
    callback: loadArticles,
  });

const retournerMateriel = () =>
  showModal({
    component: "ModalRetourMultiple",
    data: articles.value,
    size: 1,
    callback: loadArticles,
  });

const pdfArticles = () => {
  const nom = indexedSapeurs.value[id]?.nom_prenom ?? id;
  download(
    () => ArticleService.downloadListeArticles(id, exportFileName(["liste-articles", nom], "pdf")),
    "Une erreur a eu lieu durant la génération de la liste des articles",
  );
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
  <base-card>
    <template #title>Matériel distribué ({{ articles.length }})</template>
    <template #header>
      <div>
        <button
          type="button"
          title="Liste matériel"
          class="btn btn-outline-primary"
          @click="pdfArticles"
        >
          <font-awesome-icon :icon="['far', 'file-pdf']" />
        </button>
        <button
          v-if="hasEditPermission"
          class="ms-2 btn btn-outline-primary"
          @click="attribuer"
          title="Attribuer du materiel"
        >
          <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
        </button>
        <button
          v-if="hasEditPermission && articles.length"
          class="ms-2 btn btn-outline-warning"
          @click="retournerMateriel"
          title="Retourner du matériel"
        >
          <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
        </button>
      </div>
    </template>
    <template #body-table>
      <div class="mx-3 my-2">
        <base-checkbox v-model="afficherRendus" label="Afficher les articles rendus" />
      </div>
      <base-table
        :loading="loading || loadingRendus"
        :grouped-data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
        select-key="ligneId"
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

        <template #renduLe="{ rowData }">
          <template v-if="rowData.rendu">
            {{ formatDate(rowData.rendu_le) }}
            <span v-if="rowData.supprime_le" class="badge bg-secondary ms-1">supprimé</span>
          </template>
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
            v-if="hasEditPermission && !rowData.rendu"
            title="Modifier"
            class="btn btn-outline-secondary border-0"
            @click="editMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission && !rowData.rendu"
            title="Retour"
            class="btn btn-outline-warning border-0"
            @click="retourMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
