<script setup>
import { useModalStore } from '../stores/common/Modal';
import permissions from '../store/permissions.js';

import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { computed, ref, watch, watchEffect } from 'vue';
import { useStore } from 'vuex';
import useHasPermission from '../hooks/usePermission';

const store = useStore();

store.dispatch('fetchListeSapeur');
store.dispatch('fetchUnites');
store.dispatch('fetchTravailTypes');

const loading = ref(false);
const selectedId = ref(null);

await store.dispatch('fetchExercicesComptables');

watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchTravaux', store.state.exerciceComptable.activeId);
  loading.value = false;
});

const activeSapeurId = computed(() => store.state.auth.sapeurId);
const travaux = computed(() =>
  store.state.travail.liste.map((t) => ({
    ...t,
    travail_type: store.state.travailType.liste.find(
      (e) => e.id == t.travail_type_id,
    )?.designation,
    sapeur: store.state.sapeur.liste.find((s) => s.id == t.sapeur_id)
      ?.nom_prenom,
    auteur: store.state.sapeur.liste.find((s) => s.id == t.auteur_id)
      ?.nom_prenom,
    unite: store.state.unite.liste.find(
      (u) =>
        u.id ==
        store.state.travailType.liste.find((e) => e.id == t.travail_type_id)
          ?.type_unite_id,
    )?.unite,
  })),
);
const sapeurs = computed(() => store.state.sapeur.liste);
const travailTypes = computed(() => store.state.travailType.liste);

const hasEditPermission = useHasPermission([
  permissions.FICHE_TRAVAIL.SAISIE_PERSO,
  permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
]);
const hasValidationPermission = useHasPermission(
  permissions.FICHE_TRAVAIL.VALIDATION,
);
const filteredSapeurs = computed(() => {
  const ids = new Set(travaux.value.map((i) => parseInt(i.sapeur_id)));
  return sapeurs.value.filter((t) => ids.has(t.id));
});
const filteredTravailTypes = computed(() => {
  const ids = new Set(travaux.value.map((i) => parseInt(i.travail_type_id)));
  return travailTypes.value.filter((t) => ids.has(t.id));
});
const selectedItem = computed(() => {
  return travaux.value.find((t) => t.id == selectedId.value);
});

const { confirm, showModal } = useModalStore();
const select = (row) => (selectedId.value = row?.id);

const createTravail = () => showModal({ component: 'ModalTravail' });

const updateTravail = (travail) =>
  showModal({ component: 'ModalTravail', data: travail });

const reviewTravail = (travail) =>
  showModal({ component: 'ModalReviewTravail', data: travail });

const cancelReviewTravail = (travail) =>
  confirm(
    "Voulez-vous vraiment annuler l'examen de ce travail ?",
    "Attention, la justification fournie lors de l'examen sera perdue.",
  ).then(() => store.dispatch('cancelReviewTravail', travail?.id));

const supprimerTravail = (travail) =>
  confirm(
    'Voulez-vous vraiment supprimer ce travail ?',
    "Attention, la suppression d'un travail est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  ).then(() => store.dispatch('removeTravail', travail?.id));

const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }
  const statutsClass = {
    [-1]: 'table-warning', // 'Refusé',
    0: '', // 'En attente',
    1: 'table-success', // 'Accepté'
    2: 'table-success', // 'Imputé'
  };
  return statutsClass[dataItem.statut];
};

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Sapeur', key: 'sapeur' },
  { title: 'Travail', key: 'travail_type' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Quantité', key: 'quantite' },
  { title: 'Unité', key: 'unite' },
  { title: 'Auteur', key: 'auteur' },
  { title: 'Date demande', key: 'date_demande', type: Date },
  {
    title: 'Statut',
    key: 'statut',
    formatter(statut) {
      return {
        [-1]: 'Refusé',
        0: 'En attente',
        1: 'Accepté',
        2: 'Imputé',
      }[statut];
    },
  },
  { title: 'Justification', key: 'justification' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <stateful-filter
    id="travaux"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="travaux"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-3">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'accueil' }">Accueil</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Fiche de travail
              </li>
            </ol>
          </nav>
        </div>
        <div class="col-sm-6 d-flex justify-content-end">
          <exercice-comptable />
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Actions</h5>
            </div>
            <div class="card-body d-grid gap-1">
              <button
                v-if="hasEditPermission"
                class="btn btn-outline-primary"
                @click="createTravail"
              >
                Ajouter un travail
              </button>
              <button
                v-if="hasValidationPermission && selectedItem?.statut < 1"
                class="btn btn-outline-success"
                :disabled="!selectedItem?.statut < 1"
                @click="reviewTravail(selectedItem)"
              >
                Traiter
              </button>
              <button
                v-if="hasValidationPermission && !selectedItem?.statut < 1"
                class="btn btn-outline-warning"
                :disabled="
                  selectedItem?.statut == 0 || selectedItem?.statut == 2
                "
                @click="cancelReviewTravail(selectedItem)"
              >
                Annuler l'examen
              </button>
              <button
                v-if="
                  hasEditPermission && selectedItem?.auteur_id == activeSapeurId
                "
                :disabled="!selectedItem?.statut == 0"
                class="btn btn-outline-danger"
                @click="supprimerTravail(selectedItem)"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-9">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="mb-1 col-md-4"
                  display-key="nom_prenom"
                  base-option="<Sapeur>"
                  :options="filteredSapeurs"
                  :model-value="filters.sapeur_id"
                  @update:model-value="(value) => setFilter('sapeur_id', value)"
                />
                <base-select
                  class="mb-1 col-md-4"
                  base-option="<Type>"
                  :options="filteredTravailTypes"
                  :model-value="filters.travail_type_id"
                  @update:model-value="
                    (value) => setFilter('travail_type_id', value)
                  "
                />
                <base-select
                  class="col-md-4"
                  base-option="<Statut>"
                  :options="[
                    { id: -1, designation: 'Refusé' },
                    { id: 0, designation: 'En attente' },
                    { id: 1, designation: 'Accepté' },
                  ]"
                  :model-value="filters.statut"
                  @update:model-value="(value) => setFilter('statut', value)"
                />
                <div v-if="canReset" class="col-md-4">
                  <button class="btn btn-sm btn-warning w-100" @click="reset">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-3">
            <div class="card-body table-responsive p-0">
              <base-table
                :loading="loading"
                :fields="fields"
                :row-class="onRowClass"
                no-data="Aucun travail à afficher"
                :data="filteredData"
                :selectable="true"
                @selected="select"
              >
                <template #actions="{ rowData }">
                  <button
                    v-if="
                      hasEditPermission &&
                      rowData.auteur_id == activeSapeurId &&
                      rowData.statut == 0
                    "
                    title="Modifier"
                    class="btn btn-outline-primary border-0"
                    @click="updateTravail(rowData)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    v-if="
                      hasValidationPermission &&
                      (rowData.statut == -1 || rowData.statut == 1)
                    "
                    title="Examen"
                    class="btn btn-outline-warning border-0"
                    @click="cancelReviewTravail(rowData)"
                  >
                    <font-awesome-icon :icon="['fas', 'cancel']" />
                  </button>
                  <button
                    v-if="hasValidationPermission && rowData.statut == 0"
                    title="Examen"
                    class="btn btn-outline-success border-0"
                    @click="reviewTravail(rowData)"
                  >
                    <font-awesome-icon :icon="['far', 'eye']" />
                  </button>
                  <button
                    v-if="
                      hasEditPermission &&
                      rowData.auteur_id == activeSapeurId &&
                      rowData.statut == 0
                    "
                    title="Supprimer"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerTravail(rowData)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </template>
              </base-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
