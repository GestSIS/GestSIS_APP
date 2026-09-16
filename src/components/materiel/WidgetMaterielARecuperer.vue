<script setup>
import { computed, ref } from "vue";
import ArticleService from "../../services/materiel/ArticleService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const articles = ref([]);
const loadSapeurs = async () => {
  articles.value = await ArticleService.getARecuperer();
};
await loadSapeurs();

// Le backend renvoie une liste plate d'articles (avec sapeur/materiel_type
// embarqués) ; le regroupement par sapeur, comme sur les autres pages
// matériel, se fait ici.
const sapeurs = computed(() => {
  const groupes = new Map();
  for (const article of articles.value) {
    const { sapeur } = article;
    if (!groupes.has(sapeur.id)) {
      groupes.set(sapeur.id, {
        sapeur_id: sapeur.id,
        nom: sapeur.nom,
        prenom: sapeur.prenom,
        articles: [],
      });
    }
    groupes.get(sapeur.id).articles.push({
      ...article,
      type_designation: article.materiel_type.designation,
    });
  }
  return [...groupes.values()];
});

const colonnes = [
  { title: "Nom", key: "nom" },
  { title: "Prénom", key: "prenom" },
  { title: "Articles", slot: "nbArticles" },
  { title: "Actions", slot: "actionsSapeur" },
];

const colonnesArticles = [
  { title: "Type", key: "type_designation" },
  { title: "Numéro", key: "numero" },
  { title: "Désignation", key: "designation" },
  { title: "Actions", slot: "actions" },
];

const { showModal } = useModalStore();
const retourner = (article) =>
  showModal({
    component: "ModalRetourUnique",
    data: article,
    callback: loadSapeurs,
  });
const retournerTout = (sapeur) =>
  showModal({
    component: "ModalRetourMultiple",
    data: sapeur.articles,
    callback: loadSapeurs,
  });
</script>

<template>
  <base-card>
    <template #title>Matériel à récupérer</template>
    <template #header>
      <router-link :to="{ name: 'materiel-par-sapeur' }" class="btn btn-outline-primary btn-sm">
        Matériel par sapeur
      </router-link>
    </template>
    <template #body-table>
      <base-table
        :data="sapeurs"
        :fields="colonnes"
        select-key="sapeur_id"
        :detail-row-column="true"
        :hide-download="true"
        no-data="Aucun matériel à récupérer"
      >
        <template #nbArticles="{ rowData }">
          <span class="badge bg-secondary">{{ rowData.articles.length }}</span>
        </template>
        <template #actionsSapeur="{ rowData }">
          <button
            v-if="hasEditPermission"
            title="Retour multiple"
            class="btn btn-outline-warning border-0"
            @click="retournerTout(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" class="me-1" />
          </button>
          <router-link
            title="Voir le matériel de ce sapeur"
            class="btn btn-outline-primary border-0"
            :to="{ name: 'materiel-par-sapeur-details', params: { id: rowData.sapeur_id } }"
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
            <template #actions="{ rowData: article }">
              <button
                v-if="hasEditPermission"
                title="Retourner"
                class="btn btn-outline-warning border-0"
                @click="retourner(article)"
              >
                <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
              </button>
            </template>
          </base-table>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
