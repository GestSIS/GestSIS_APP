<script setup>
import { computed, ref, watch } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import TagCouleur from './TagCouleur.vue';
import { useStore } from 'vuex';
import { groupedByData, indexedData } from '../../tools';
import { useModalStore } from '../../stores/common/Modal.js';
import useConfirmation from '../../hooks/useConfirmation';
import useHasPermission from '../../hooks/usePermission';
import permissions from '../../store/permissions';

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

await Promise.all([
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
  materielTypeStore.fetchMaterielTypes(),
  store.dispatch('fetchListeSapeur'),
]);
loadArticles();

watch(() => id, loadArticles);

const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id)),
);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

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
  const items = articles.value.map((a) => ({
    ...a,
    emplacements: linearEmplacements(a.emplacement_id),
    sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
    generic_emplacement_id:
      (a.sapeur_id ?? '') + '_' + (a.emplacement_id ?? ''),
  }));

  return affichageIndividuel.value
    ? items
    : Object.entries(groupedByData(items, 'generic_emplacement_id'))
        .map(([key, values]) => ({
          key,
          id: key,
          emplacement_id: values[0].emplacement_id,
          emplacements: values[0].emplacements,
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

const piecesColonnes = computed(() => [
  ...(affichageIndividuel.value && materielType.value.est_numerote
    ? [{ title: 'Numéro', key: 'numero' }]
    : []),
  { title: 'Emplacement', key: 'emplacement', slot: 'emplacement' },
  { title: 'Compartiment', key: 'compartiment' },
  ...(affichageIndividuel.value
    ? [
        ...(materielType.value.type === 3
          ? [
              { title: 'Désignation', key: 'designation' },
              { title: 'Immatriculation', key: 'immatriculation' },
              { title: 'Chassis', key: 'chassis' },
            ]
          : []),
        ...(materielType.value.est_taillee
          ? [{ title: 'Taille', key: 'taille' }]
          : []),
        ...(materielType.value.est_lavable
          ? [{ title: 'Lavages', slot: 'lavages' }]
          : []),
        { title: 'Remarque', key: 'remarque' },
        { title: 'Ajouté', key: 'created_at', type: 'date' },
        // { title: 'Inventaire', key: 'inventaire' },
        // { title: 'Maintenance', key: 'maintenance' },
        { title: 'Actions', key: 'id', slot: 'actions' },
      ]
    : [{ title: 'Quantité', key: 'quantite' }]),
]);

const { showModal } = useModalStore();
const ajouter = () =>
  showModal({
    component: 'ModalArticle',
    data: {},
    size: 1,
  });

const infoMateriel = (materiel) =>
  showModal({
    component: 'ModalArticleInfo',
    data: materiel,
    size: 1,
  });

const editMateriel = (materiel) =>
  showModal({
    component: 'ModalArticle',
    data: materiel,
    callback: loadArticles,
  });

const retourMateriel = (materiel) =>
  showModal({
    component: 'ModalRetourUnique',
    data: materiel,
    callback: loadArticles,
  });

const attribuerMateriel = (materiel) =>
  showModal({
    component: 'ModalAttributionUnique',
    data: materiel,
    callback: loadArticles,
  });

const { confirm } = useConfirmation();
const supprimer = (article) =>
  confirm(
    'Voulez-vous vraiment supprimer cet article ?',
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(loadArticles);
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
      <base-table
        :loading="loading"
        :data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
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

        <template #lavages="{ rowData }">
          <div
            class="badge"
            :class="{
              'bg-danger': rowData.lavages.length >= 10,
              'bg-secondary': rowData.lavages.length < 10,
            }"
          >
            {{ rowData.lavages.length }}
          </div>
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
            v-if="affichageIndividuel && hasEditPermission"
            title="Modifier"
            class="btn btn-outline-secondary border-0"
            @click="editMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="
              affichageIndividuel &&
              hasEditPermission &&
              materielType.est_attribuable &&
              rowData.sapeur_id !== null
            "
            title="Retour"
            class="btn btn-outline-primary border-0"
            @click="retourMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
          </button>
          <button
            v-if="
              affichageIndividuel &&
              hasEditPermission &&
              materielType.est_attribuable &&
              rowData.sapeur_id === null
            "
            title="Attribuer"
            class="btn btn-outline-primary border-0"
            @click="attribuerMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
          </button>
          <button
            v-if="affichageIndividuel && hasEditPermission"
            title="Supprimer"
            class="btn btn-outline-danger border-0"
            @click="supprimer(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>

<style></style>
