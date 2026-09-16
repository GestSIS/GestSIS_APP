<script setup>
import { ref } from "vue";
import ControleService from "../../services/materiel/ControleService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const controles = ref([]);
const loading = ref(true);

// Un article "en warning" (statut backend) est soit jamais contrôlé (pas de date
// de dernière exécution), soit en préavis (une échéance calculée, proche) : on
// distingue les deux ici pour le décompte demandé, sans dupliquer la logique déjà
// validée côté backend (retard / warning).
const statutDetaille = (article) => {
  if (article.statut === "danger") return "retard";
  return article.derniere_execution === null ? "manquant" : "preavis";
};

const compterStatuts = (articles) => ({
  preavis: articles.filter((a) => statutDetaille(a) === "preavis").length,
  retard: articles.filter((a) => statutDetaille(a) === "retard").length,
  manquant: articles.filter((a) => statutDetaille(a) === "manquant").length,
});

const loadArticles = async () => {
  loading.value = true;
  controles.value = (await ControleService.getArticlesAControler()).map((c) => ({
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
  { title: "Dernier contrôle", slot: "dernierControle" },
  { title: "Prochain contrôle", slot: "prochainControle" },
  { title: "Actions", slot: "actions" },
];

const { showModal } = useModalStore();
// L'article est listé sous un contrôle donné : on présélectionne ce contrôle
// plutôt que de laisser le modal retomber sur le premier applicable au type.
const controler = (article, controleId) =>
  showModal({
    component: "ModalControleExec",
    data: { ...article, controleId },
    callback: loadArticles,
  });
</script>

<template>
  <base-card>
    <template #title>Contrôles manquants / dépassés / en préavis</template>
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
          <span v-if="rowData.compte.retard" class="badge bg-danger me-1">
            {{ rowData.compte.retard }} en retard
          </span>
          <span v-if="rowData.compte.preavis" class="badge bg-warning text-dark me-1">
            {{ rowData.compte.preavis }} en préavis
          </span>
          <span v-if="rowData.compte.manquant" class="badge bg-secondary me-1">
            {{ rowData.compte.manquant }} manquant(s)
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
            <template #dernierControle="{ rowData: article }">
              <span v-if="article.derniere_execution">
                {{ new Date(article.derniere_execution).toLocaleDateString("fr-CH") }}
              </span>
              <span v-else class="text-muted">Jamais contrôlé</span>
            </template>
            <template #prochainControle="{ rowData: article }">
              <span :class="article.statut === 'danger' ? 'text-danger' : 'text-warning'">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
                {{
                  article.prochaine_execution
                    ? new Date(article.prochaine_execution).toLocaleDateString("fr-CH")
                    : "À planifier"
                }}
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
            </template>
          </base-table>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
