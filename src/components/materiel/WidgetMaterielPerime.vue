<script setup>
import { ref } from "vue";
import TypeService from "../../services/materiel/TypeService.js";

const types = ref(
  (await TypeService.getArticlesPerimes()).map((t) => ({
    materiel_type_id: t.materiel_type_id,
    designation: t.designation,
    articles: t.articles,
  })),
);

const colonnes = [
  { title: "Type", key: "designation" },
  { title: "Périmés", slot: "nbPerimes" },
  { title: "Actions", slot: "actionsType" },
];

const colonnesArticles = [
  { title: "Numéro", key: "numero" },
  { title: "Désignation", key: "designation" },
  { title: "Emplacement / Sapeur", slot: "localisation" },
  { title: "Périmé depuis le", key: "date_peremption", type: "date" },
];
</script>

<template>
  <base-card>
    <template #title>Matériel périmé</template>
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
        no-data="Aucun matériel périmé"
      >
        <template #nbPerimes="{ rowData }">
          <span class="badge bg-danger">{{ rowData.articles.length }}</span>
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
            <template #localisation="{ rowData: article }">
              {{ article.sapeur || article.emplacement || "-" }}
            </template>
          </base-table>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
