<script setup>
import { computed, ref, watchEffect } from "vue";
import { groupedByData, indexedData } from "../../tools/index.js";
import ArticleService from "../../services/materiel/ArticleService.js";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { useMaterielCategorieStore } from "../../stores/materiel/Categorie";
import TagCouleur from "./TagCouleur.vue";
import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import TableArticlePourEmplacement from "./TableArticlePourEmplacement.vue";
import TableArticlePourType from "./TableArticlePourType.vue";
import { useModalStore } from "../../stores/common/Modal";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielCategorieStore = useMaterielCategorieStore();
const emplacementStore = useEmplacementStore();
const materielTypeStore = useMaterielTypeStore();
const couleurStore = useCouleurStore();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const articles = ref([]);
const loading = ref(true);
const affichageIndividuel = ref(false);
const emplacement = computed(() => emplacementStore.liste.find((e) => e.id === parseInt(id)));

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParEmplacement(id);
  loading.value = false;
};
watchEffect(loadArticles);

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  materielCategorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
]);

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedCategories = computed(() => indexedData(materielCategorieStore.liste));
const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));

const linearEmplacements = (emplacementId) => {
  if (emplacementId === null) {
    return [];
  }
  const emp = indexedEmplacements.value[emplacementId] ?? null;
  if (emp === null) {
    return [];
  }
  return [...linearEmplacements(emp.parent_id), emp];
};

const computedData = computed(() =>
  Object.entries(
    groupedByData(
      articles.value
        .map((a) => ({
          ...a,
          type: indexedTypes.value[a.materiel_type_id],
          nbLavages: (a.lavages ?? []).length,
          typeDesignation: indexedTypes.value[a.materiel_type_id]?.designation,
          categorie_id: indexedTypes.value[a.materiel_type_id]?.materiel_categorie_id,
          emplacements: linearEmplacements(a.emplacement_id),
        }))
        .filter((a) => a.statut),
      "categorie_id",
    ),
  )
    .map(([key, values]) => ({
      key,
      data: values.sort((a1, a2) => a1.materiel_type_id - a2.materiel_type_id),
      categorie_id: key,
    }))
    .map((data) =>
      affichageIndividuel.value
        ? data
        : {
            ...data,
            data: Object.entries(groupedByData(data.data, "materiel_type_id"))
              .map(([key, values]) => ({
                key,
                id: key,
                type: values[0].type,
                typeDesignation: values[0].typeDesignation,
                data: values,
                quantite: values.length,
                compartiments: new Set(values.map((a) => a.compartiment)),
              }))
              .map((a) => ({
                ...a,
                compartiment:
                  a.compartiments.size === 1
                    ? [...a.compartiments][0]
                    : `(${a.compartiments.size})`,
              })),
          },
    ),
);

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

const colonnes = computed(() => [
  { title: "Type", key: "typeDesignation" },
  ...(emplacement.value?.est_compartimentable
    ? [{ title: "Compartiment", key: "compartiment" }]
    : []),
  { title: "Quantité", key: "quantite" },
]);

const { showModal } = useModalStore();
const ajouter = () =>
  showModal({
    component: "ModalAjoutArticleMultiple",
    callback: loadArticles,
    data: { emplacementId: id },
    size: 2,
  });
</script>

<template>
  <base-card>
    <template #title>Pièces ({{ articles.length }})</template>
    <template #header>
      <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
        <input
          id="individuel"
          v-model="affichageIndividuel"
          type="radio"
          class="btn-sm btn-check"
          name="groupingBy"
          autocomplete="off"
          :value="true"
          checked
        />
        <label class="btn btn-sm btn-outline-primary" for="individuel">Individuel</label>
        <input
          id="par-type"
          v-model="affichageIndividuel"
          type="radio"
          class="btn-sm btn-check"
          name="groupingBy"
          :value="false"
          autocomplete="off"
        />
        <label class="btn btn-sm btn-outline-primary" for="par-type">Par type</label>
      </div>
      <button
        v-if="hasEditPermission"
        title="Ajouter"
        class="btn btn-sm btn-primary"
        @click="ajouter"
      >
        <font-awesome-icon :icon="['far', 'plus-square']" />
      </button>
    </template>
    <template #body-table>
      <table-article-pour-emplacement
        v-if="affichageIndividuel"
        :loading="loading"
        :articles="computedData"
        :refresh="loadArticles"
        :emplacement="emplacement"
      />
      <base-table
        v-else
        :loading="loading"
        :grouped-data="computedData"
        no-data="Aucune pièce"
        :fields="colonnes"
        :selectable="true"
        :detail-row-column="true"
        :hide-download="true"
      >
        <template #detail-row="{ rowData }">
          <table-article-pour-type
            :loading="loading"
            :articles="rowData.data"
            :avec-emplacement="true"
            :materiel-type="rowData.type"
            :refresh="loadArticles"
            :emplacement="emplacement"
            :hide-download="true"
          />
        </template>

        <template #groupeHeader="{ categorie_id }">
          <tag-couleur
            v-for="categorie in linearCategories(categorie_id)"
            :key="categorie.id"
            :couleur="indexedCouleurs[categorie.couleur_id]"
          >
            {{ categorie.designation }}
          </tag-couleur>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
