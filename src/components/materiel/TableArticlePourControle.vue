<script setup>
import { computed } from "vue";
import useNotification from "../../composables/useNotification.js";
import ArticleService from "../../services/materiel/ArticleService";
import TagCouleur from "./TagCouleur.vue";
import { indexedData } from "../../tools/index.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";
import HistoriqueControleExec from "./HistoriqueControleExec.vue";

const { loading, articles, controle, refresh } = defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
  articles: {
    type: Array,
    required: true,
  },
  controle: {
    type: Object,
    required: true,
  },
  refresh: {
    type: Function,
    required: true,
  },
});

const couleurStore = useCouleurStore();
const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const groupesNonVides = computed(() => articles.filter((groupe) => groupe.data.length > 0));

const colonnes = computed(() => [
  { title: "Numéro", key: "numero" },
  { title: "Emplacement", key: "emplacement_sort", slot: "emplacement" },
  { title: "Acheté le", key: "achat" },
  ...(controle.nb_execution_max
    ? [{ title: "Nb contrôles", key: "nb_executions", slot: "nbExecutions" }]
    : []),
  { title: "Dernier contrôle", key: "derniere_execution", slot: "dernierControle" },
  ...(controle.recurrence_type === "PERIODIQUE"
    ? [{ title: "Prochain contrôle", key: "prochaine_execution", slot: "prochainControle" }]
    : []),
  { title: "Remarque", key: "remarque" },
  { title: "Ajouté", key: "created_at", type: "date" },
  { title: "Actions", key: "id", slot: "actions" },
]);

const derniereExecution = (article) =>
  article.derniere_execution ? new Date(article.derniere_execution) : null;

const prochaineExecution = (article) => {
  if (controle.recurrence_type !== "PERIODIQUE") {
    return null;
  }
  const derniere = derniereExecution(article);
  if (derniere === null) {
    return null;
  }
  const date = new Date(derniere);
  date.setMonth(date.getMonth() + controle.recurrence_value);
  return date;
};

// "danger" si la date du prochain contrôle est dépassée, "warning" si on est
// entré dans la période de préavis (prochain contrôle moins la durée de
// préavis), sinon null (rien à signaler). Un dernier contrôle en échec est
// signalé en "danger" même si la date du prochain contrôle n'est pas encore
// atteinte.
const statutProchainControle = (article) => {
  if (article.dernier_controle_echec) {
    return "danger";
  }

  const prochaine = prochaineExecution(article);
  if (prochaine === null) {
    return null;
  }
  const maintenant = new Date();
  if (maintenant >= prochaine) {
    return "danger";
  }
  if (controle.duree_preavis) {
    const debutPreavis = new Date(prochaine);
    debutPreavis.setMonth(debutPreavis.getMonth() - controle.duree_preavis);
    if (maintenant >= debutPreavis) {
      return "warning";
    }
  }
  return null;
};

// "danger" dès que le nombre d'exécutions atteint le maximum configuré sur le
// contrôle (ex: nombre de lavages), "warning" dès le seuil de préavis, sinon
// null — uniquement pour les contrôles NON_PERIODIQUE avec un nombre
// d'exécutions maximum.
const statutNbExecutions = (article) => {
  if (!controle.nb_execution_max) {
    return null;
  }
  if (article.nb_executions >= controle.nb_execution_max) {
    return "danger";
  }
  if (controle.nb_execution_preavis && article.nb_executions >= controle.nb_execution_preavis) {
    return "warning";
  }
  return null;
};

const tooltipProchainControle = (article) => {
  if (article.dernier_controle_echec) {
    return "Dernier contrôle en échec";
  }
  return statutProchainControle(article) === "danger"
    ? "Contrôle en retard"
    : "Contrôle à prévoir prochainement";
};

const { showModal, confirm } = useModalStore();
const awn = useNotification();

const infoMateriel = (materiel) =>
  showModal({
    component: "ModalArticleInfo",
    data: materiel,
    size: 1,
  });

const attribuerMateriel = (materiel) =>
  showModal({
    component: "ModalAttributionUnique",
    data: materiel,
    callback: refresh,
  });

// L'utilisateur est sur la fiche d'un contrôle précis : c'est celui-là qu'il
// faut présélectionner, un type pouvant relever de plusieurs contrôles.
const controlerMateriel = (materiel) =>
  showModal({
    component: "ModalControleExec",
    data: { ...materiel, controleId: controle.id },
    callback: refresh,
  });

const supprimer = (article) =>
  confirm(
    "Voulez-vous vraiment supprimer cet article ?",
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(refresh)
    .catch((e) => awn.alert(e.message || "Une erreur est survenue"));
</script>

<template>
  <base-table
    :loading="loading"
    :grouped-data="groupesNonVides"
    no-data="Aucun article"
    :fields="colonnes"
    :selectable="true"
    :detail-row-column="true"
  >
    <template #groupeHeader="{ label }">
      <strong>{{ label }}</strong>
    </template>

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

    <template #nbExecutions="{ rowData }">
      <span
        class="badge"
        :class="{
          'bg-danger': statutNbExecutions(rowData) === 'danger',
          'bg-warning text-dark': statutNbExecutions(rowData) === 'warning',
          'bg-secondary': !statutNbExecutions(rowData),
        }"
      >
        {{ rowData.nb_executions }}
      </span>
    </template>

    <template #dernierControle="{ rowData }">
      <span v-if="derniereExecution(rowData)">
        {{ derniereExecution(rowData).toLocaleDateString("fr-CH") }}
      </span>
      <span v-else class="text-muted">Jamais</span>
    </template>

    <template #prochainControle="{ rowData }">
      <template v-if="controle.recurrence_type === 'PERIODIQUE'">
        <template v-if="prochaineExecution(rowData)">
          <span
            :class="{
              'text-danger': statutProchainControle(rowData) === 'danger',
              'text-warning': statutProchainControle(rowData) === 'warning',
            }"
          >
            <font-awesome-icon
              v-if="statutProchainControle(rowData)"
              v-tooltip.bottom="tooltipProchainControle(rowData)"
              :icon="['fas', 'triangle-exclamation']"
              class="me-1"
            />
            {{ prochaineExecution(rowData).toLocaleDateString("fr-CH") }}
          </span>
        </template>
        <span v-else class="text-warning">
          <font-awesome-icon
            v-tooltip.bottom="'Aucun contrôle réalisé'"
            :icon="['fas', 'triangle-exclamation']"
            class="me-1"
          />
          À planifier
        </span>
      </template>
    </template>

    <template #detail-row="{ rowData }">
      <suspense>
        <historique-controle-exec :article-id="rowData.id" :controle-id="controle.id" />
        <template #fallback>Chargement...</template>
      </suspense>
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
        v-if="hasEditPermission && rowData.type?.est_attribuable && rowData.sapeur_id === null"
        title="Attribuer"
        class="btn btn-outline-primary border-0"
        @click="attribuerMateriel(rowData)"
      >
        <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
      </button>
      <button
        v-if="hasEditPermission"
        title="Contrôler"
        class="btn btn-outline-success border-0"
        @click="controlerMateriel(rowData)"
      >
        <font-awesome-icon :icon="['far', 'clipboard']" />
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
