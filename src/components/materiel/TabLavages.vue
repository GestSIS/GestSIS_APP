<script setup>
import { computed, ref } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import TagCouleur from './TagCouleur.vue';
import { useStore } from 'vuex';
import { indexedData } from '../../tools';
import { useModalStore } from '../../stores/common/Modal.js';
import useConfirmation from '../../hooks/useConfirmation';
import LavageService from '../../services/materiel/LavageService';
import useHasPermission from '../../hooks/usePermission';
import permissions from '../../store/permissions';

const store = useStore();
const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();
const materielTypeStore = useMaterielTypeStore();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const lavages = ref([]);
const loading = ref(true);

const loadLavages = async () => {
  loading.value = true;
  lavages.value = await LavageService.getLavages();
  loading.value = false;
};

await Promise.all([
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
  materielTypeStore.fetchMaterielTypes(),
  store.dispatch('fetchListeSapeur'),
]);
loadLavages();

// Partie pièces
const piecesColonnes = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Matériel', key: 'designation' },
  { title: 'Numéro', key: 'numero' },
  { title: 'Emplacement', key: 'emplacement_sort', slot: 'emplacement' },
  { title: 'Lavages', key: 'nbLavages', slot: 'lavages' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
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

const computedData = computed(() =>
  lavages.value
    .map((a) => ({
      ...a,
      ...a.article,
      id: a.id,
      nbLavages: a.article.lavages.length,
      designation: indexedTypes.value[a.article.materiel_type_id]?.designation,
      emplacements: linearEmplacements(a.article.emplacement_id),
      emplacement:
        indexedEmplacements.value[a.emplacement_id]?.designation ?? '',
      sapeur: indexedSapeurs.value[a.article.sapeur_id]?.nom_prenom ?? '',
    }))
    .map((a) => ({
      ...a,
      emplacement_sort: a.sapeur + 'ZZZZ' + a.emplacement,
    })),
);

const { showModal } = useModalStore();
const infoMateriel = (materiel) =>
  showModal({
    component: 'ModalArticleInfo',
    data: materiel,
    size: 1,
  });

const ajouterLavages = () =>
  showModal({
    component: 'ModalLavageMultiple',
    size: 2,
    callback: loadLavages,
  });

const { confirm } = useConfirmation();
const supprimer = (lavage) =>
  confirm(
    'Voulez-vous vraiment supprimer ce lavage ?',
    "Attention, la suppression d'un lavage est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => LavageService.supprimerLavages([lavage.id]))
    .then(loadLavages);
</script>

<template>
  <div class="card mb-2">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="m-0">Lavages ({{ lavages.length }})</h5>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary"
        @click="ajouterLavages"
      >
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :data="computedData"
        no-data="Aucun lavage"
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
              'bg-danger': rowData.lavages?.length >= 10,
              'bg-secondary': rowData.lavages?.length < 10,
            }"
          >
            {{ rowData.lavages?.length }}
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
            v-if="hasEditPermission"
            title="Supprimer"
            class="btn btn-outline-danger border-0"
            @click="supprimer(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style></style>
