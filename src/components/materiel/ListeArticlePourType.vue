<script setup>
import { computed, ref, watch } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import { useStore } from 'vuex';
import { groupedByData, indexedData } from '../../tools';
import { useModalStore } from '../../stores/common/Modal.js';
import useHasPermission from '../../hooks/usePermission';
import permissions from '../../store/permissions';
import TableArticlePourType from './TableArticlePourType.vue';
import TagCouleur from './TagCouleur.vue';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const store = useStore();
const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();
const materielTypeStore = useMaterielTypeStore();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const articles = ref([]);
const loading = ref(true);
const affichageIndividuel = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParMaterielType(id);
  loading.value = false;
};

loadArticles();
await Promise.all([
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
  materielTypeStore.fetchMaterielTypes(),
  store.dispatch('fetchListeSapeur'),
]);

watch(() => id, loadArticles);

const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id)),
);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));

const linearEmplacements = (emplacement_id) => {
  if (emplacement_id === null) {
    return [];
  }
  const emplacement = indexedEmplacements.value[emplacement_id] ?? null;
  if (emplacement === null) {
    return [];
  }
  return [...linearEmplacements(emplacement.parent_id), emplacement];
};

const computedData = computed(() => {
  const items = articles.value
    .map((a) => ({
      ...a,
      emplacements: linearEmplacements(a.emplacement_id),
      nbLavages: (a.lavages ?? []).length,
      sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
      emplacement:
        indexedEmplacements.value[a.emplacement_id]?.designation ?? '',
      generic_emplacement_id:
        (a.sapeur_id ?? '') + '_' + (a.emplacement_id ?? ''),
    }))
    .filter((a) => a.statut)
    .map((a) => ({
      ...a,
      emplacement_sort: a.sapeur + 'ZZZZ' + a.emplacement,
    }));

  return affichageIndividuel.value
    ? items
    : Object.entries(groupedByData(items, 'generic_emplacement_id'))
        .map(([key, values]) => ({
          key,
          id: key,
          emplacement_id: values[0].emplacement_id,
          emplacements: values[0].emplacements,
          emplacement_sort: values[0].emplacement_sort,
          sapeur_id: values[0].sapeur_id,
          sapeur: values[0].sapeur,
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
        }));
});

const piecesColonnes = [
  { title: 'Emplacement', key: 'emplacement_sort', slot: 'emplacement' },
  // { title: 'Compartiment', key: 'compartiment' },
  { title: 'Quantité', key: 'quantite' },
];

const { showModal } = useModalStore();
const ajouter = () =>
  showModal({
    component: 'ModalArticle',
    data: {},
    size: 1,
  });
</script>

<template>
  <base-card>
    <template #title>Pièces ({{ articles.length }})</template>
    <template #header>
      <div
        class="btn-group"
        role="group"
        aria-label="Basic radio toggle button group"
      >
        <input
          type="radio"
          class="btn-sm btn-check"
          name="groupingBy"
          id="individuel"
          autocomplete="off"
          v-model="affichageIndividuel"
          :value="true"
          checked
        />
        <label class="btn btn-sm btn-outline-primary" for="individuel"
          >Individuel</label
        >
        <input
          type="radio"
          class="btn-sm btn-check"
          name="groupingBy"
          id="par-emplacement"
          v-model="affichageIndividuel"
          :value="false"
          autocomplete="off"
        />
        <label class="btn btn-sm btn-outline-primary" for="par-emplacement"
          >Par emplacement</label
        >
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
      <table-article-pour-type
        v-if="affichageIndividuel"
        :loading="loading"
        :articles="computedData"
        :materiel-type="materielType"
        :refresh="loadArticles"
      />
      <base-table
        v-else
        :loading="loading"
        :data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
        :detailRowColumn="true"
        :hideDownload="true"
      >
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

        <template #detail-row="{ rowData }">
          <table-article-pour-type
            :loading="loading"
            :articles="rowData.data"
            :materiel-type="materielType"
            :avec-emplacement="false"
            :refresh="loadArticles"
          />
        </template>
      </base-table>
    </template>
  </base-card>
</template>

<style></style>
