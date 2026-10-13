<script setup>
import { ref } from "vue";
import TypeService from "../../services/materiel/TypeService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

// Articles actifs d'un type numéroté sans numéro, groupés par type (seuls les
// types concernés sont renvoyés) : le widget n'est affiché que s'il y en a.
const types = ref([]);
const loadTypes = async () => {
  types.value = await TypeService.getArticlesSansNumero();
};
await loadTypes();

const colonnes = [
  { title: "Type", key: "designation" },
  { title: "Sans numéro", slot: "nbSansNumero" },
  { title: "Actions", slot: "actionsType" },
];

const colonnesArticles = [
  { title: "Désignation", slot: "designation" },
  { title: "Emplacement / Sapeur", key: "localisation" },
  { title: "Actions", slot: "actionsArticle" },
];

const { showModal } = useModalStore();
const modifierArticle = (article) =>
  showModal({
    component: "ModalArticle",
    data: article,
    callback: loadTypes,
  });
</script>

<template>
  <base-card v-if="types.length > 0">
    <template #title>Articles avec numéro manquant</template>
    <template #header>
      <router-link :to="{ name: 'materiel-par-type' }" class="btn btn-outline-primary btn-sm">
        Matériel par type
      </router-link>
    </template>
    <template #body-table>
      <base-table
        :data="types"
        :fields="colonnes"
        select-key="materiel_type_id"
        :detail-row-column="true"
        :hide-download="true"
      >
        <template #nbSansNumero="{ rowData }">
          <span class="badge bg-warning text-dark">{{ rowData.articles.length }}</span>
        </template>

        <template #actionsType="{ rowData }">
          <router-link
            title="Voir le matériel de ce type"
            class="btn btn-outline-primary border-0"
            :to="{ name: 'materiel-par-type-details', params: { id: rowData.materiel_type_id } }"
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
            <template #designation="{ rowData: article }">
              {{ article.designation || article.taille || "-" }}
            </template>

            <template #actionsArticle="{ rowData: article }">
              <button
                v-if="hasEditPermission"
                type="button"
                title="Modifier l'article"
                class="btn btn-outline-primary border-0"
                @click="modifierArticle(article)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
            </template>
          </base-table>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
