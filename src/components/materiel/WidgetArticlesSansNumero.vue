<script setup>
import { computed, ref } from "vue";
import TypeService from "../../services/materiel/TypeService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";
import { indexedData } from "../../tools/index.js";
import { emplacementIdPourArticle } from "../../tools/materiel.js";
import TagCouleur from "./TagCouleur.vue";

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();
const sapeurStore = useSapeurStore();

// Articles actifs d'un type numéroté sans numéro, groupés par type (seuls les
// types concernés sont renvoyés) : le widget n'est affiché que s'il y en a.
const types = ref([]);
const loadTypes = async () => {
  types.value = await TypeService.getArticlesSansNumero();
};
await Promise.all([
  loadTypes(),
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
  sapeurStore.fetchListeSapeur(),
]);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));

// Chemin de l'emplacement (racine → emplacement), affiché en étiquettes de couleur.
const cheminEmplacement = (emplacementId) => {
  const emplacement = indexedEmplacements.value[emplacementId];
  return emplacement ? [...cheminEmplacement(emplacement.parent_id), emplacement] : [];
};

const colonnes = [
  { title: "Type", key: "designation" },
  { title: "Sans numéro", slot: "nbSansNumero" },
  { title: "Actions", slot: "actionsType" },
];

// Colonnes du détail selon le type : la taille pour un type taillé, la
// désignation (nom du véhicule) pour un véhicule.
const colonnesArticles = (type) => [
  ...(type.est_emplacement ? [{ title: "Désignation", key: "designation" }] : []),
  { title: "Emplacement / Sapeur", slot: "localisation" },
  ...(type.est_taillee ? [{ title: "Taille", key: "taille" }] : []),
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
            :fields="colonnesArticles(rowData)"
            :hide-download="true"
            no-data="Aucun article"
          >
            <template #localisation="{ rowData: article }">
              <div v-if="article.sapeur_id" class="badge bg-primary">
                {{ indexedSapeurs[article.sapeur_id]?.nom_prenom }}
              </div>
              <div v-else>
                <tag-couleur
                  v-for="e in cheminEmplacement(emplacementIdPourArticle(article))"
                  :key="e.id"
                  :couleur="indexedCouleurs[e.couleur_id]"
                  >{{ e.designation }}</tag-couleur
                >
              </div>
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
