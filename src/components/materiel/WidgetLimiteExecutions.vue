<script setup>
import { ref } from "vue";
import ControleService from "../../services/materiel/ControleService.js";
import ArticleService from "../../services/materiel/ArticleService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);
const awn = useNotification();

const controles = ref([]);
const loading = ref(true);

const compterStatuts = (articles) => ({
  depasse: articles.filter((a) => a.statut === "danger").length,
  preavis: articles.filter((a) => a.statut === "warning").length,
});

const loadArticles = async () => {
  loading.value = true;
  controles.value = (await ControleService.getArticlesLimiteExecutions()).map((c) => ({
    controle_id: c.controle_id,
    nom: c.nom,
    articles: c.articles,
    compte: compterStatuts(c.articles),
  }));
  loading.value = false;
};
await loadArticles();

const colonnes = [
  { title: "Contrôle", key: "nom" },
  { title: "Statut", slot: "statutGlobal" },
  { title: "Actions", slot: "actionsControle" },
];

const colonnesArticles = [
  { title: "Type", key: "type_designation" },
  { title: "Numéro", key: "numero" },
  { title: "Désignation", key: "designation" },
  { title: "Emplacement / Sapeur", slot: "localisation" },
  { title: "Nb contrôles", slot: "nbExecutions" },
  { title: "Actions", slot: "actions" },
];

const { showModal, confirm } = useModalStore();
// L'article est listé sous un contrôle donné : on présélectionne ce contrôle
// plutôt que de laisser le modal retomber sur le premier applicable au type.
const controler = (article, controleId) =>
  showModal({
    component: "ModalControleExec",
    data: { ...article, controleId },
    callback: loadArticles,
  });

const supprimer = (article) =>
  confirm(
    "Voulez-vous vraiment supprimer cet article ?",
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(loadArticles)
    .catch((e) => awn.alert(e.message || "Une erreur est survenue"));
</script>

<template>
  <base-card>
    <template #title>Nombre de contrôles dépassé / en préavis</template>
    <template #header>
      <router-link :to="{ name: 'materiel-controles' }" class="btn btn-outline-primary btn-sm">
        Voir les contrôles
      </router-link>
    </template>
    <template #body-table>
      <base-table
        :loading="loading"
        :data="controles"
        :fields="colonnes"
        select-key="controle_id"
        :detail-row-column="true"
        :hide-download="true"
        no-data="Aucun contrôle en attente"
      >
        <template #statutGlobal="{ rowData }">
          <span v-if="rowData.compte.depasse" class="badge bg-danger me-1">
            {{ rowData.compte.depasse }} dépassé(s)
          </span>
          <span v-if="rowData.compte.preavis" class="badge bg-warning text-dark me-1">
            {{ rowData.compte.preavis }} en préavis
          </span>
        </template>

        <template #actionsControle="{ rowData }">
          <router-link
            title="Ouvrir le contrôle"
            class="btn btn-outline-primary border-0"
            :to="{ name: 'materiel-controles-details', params: { id: rowData.controle_id } }"
          >
            <font-awesome-icon :icon="['fas', 'up-right-from-square']" />
          </router-link>
        </template>

        <template #detail-row="{ rowData }">
          <base-table
            :data="rowData.articles"
            :fields="colonnesArticles"
            :hide-download="true"
            no-data="Aucun article"
          >
            <template #localisation="{ rowData: article }">
              {{ article.sapeur || article.emplacement || "-" }}
            </template>
            <template #nbExecutions="{ rowData: article }">
              <span
                class="badge"
                :class="article.statut === 'danger' ? 'bg-danger' : 'bg-warning text-dark'"
              >
                {{ article.nb_executions }} / {{ article.nb_execution_max }}
              </span>
            </template>
            <template #actions="{ rowData: article }">
              <button
                v-if="hasEditPermission"
                title="Contrôler"
                class="btn btn-outline-success border-0"
                @click="controler(article, rowData.controle_id)"
              >
                <font-awesome-icon :icon="['far', 'clipboard']" />
              </button>
              <button
                v-if="hasEditPermission"
                title="Supprimer"
                class="btn btn-outline-danger border-0"
                @click="supprimer(article)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
