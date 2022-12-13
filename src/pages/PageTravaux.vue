<template>
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
        <!-- /.card-header -->
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
              v-if="hasEditPermission"
              :disabled="!canDelete"
              class="btn btn-outline-danger"
              @click="supprimerIntervention(selectedId)"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-9">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <base-select
                class="mb-1 col-md-4"
                :options="filteredSapeurs"
                display-key="nom_prenom"
                base-option="<Sapeur>"
                @update:model-value="(value) => onFilter('localite_id', value)"
              />
              <base-select
                class="mb-1 col-md-4"
                :options="filteredTravailTypes"
                display-key="designation"
                base-option="<Type>"
                @update:model-value="
                  (value) => onFilter('travail_type_id', value)
                "
              />
              <base-select
                class="col-md-4"
                :options="[
                  { id: [-1], label: 'Refusé' },
                  { id: 0, label: 'En attente' },
                  { id: 1, label: 'Accepté' },
                ]"
                display-key="label"
                value-key="id"
                base-option="<Statut>"
                @update:model-value="(value) => onFilter('statut', value)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5 table-responsive">
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            :class="{ 'd-none': loading }"
            :fields="fields"
            :row-class="onRowClass"
            no-data="Aucun travail à afficher"
            :data="filteredTravaux"
            :selectable="true"
            @selected="select"
          >
            <template #actions="props">
              <button
                v-if="hasEditPermission && props.rowData.statut == 0"
                title="Modifier"
                class="btn btn-outline-primary border-0"
                @click="updateTravail"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                v-if="hasValidationPermission && props.rowData.statut != 1"
                title="Examen"
                class="btn btn-outline-primary border-0"
                @click="validerIntervention(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
              <button
                v-if="hasEditPermission && props.rowData.statut == 0"
                title="Supprimer"
                class="btn btn-outline-danger border-0"
                @click="supprimerIntervention(props.rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '../store/permissions.js';
import store from '@/store/index';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadTravailTypes = store.dispatch('fetchTravailTypes');

  await store.dispatch('fetchExercicesComptables');

  let loadTravaux = store.dispatch('fetchTravaux');
  Promise.all([loadSapeurs, loadLocalites, loadTravaux, loadTravailTypes]).then(
    () => next()
  );
}

export default {
  name: 'PageTravaux',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      loading: true,
      filters: {},
      selectedId: null,
      fields: [
        {
          title: 'Date',
          key: 'date',
          columnClass: 'align-middle',
          type: Date,
        },
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Travail', key: 'travail_type' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Date demande', key: 'date_demande', type: Date },
        {
          title: 'Statut',
          key: 'statut',
          formatter(statut) {
            return { [-1]: 'Refusé', 0: 'En attente', 1: 'Accepté' }[statut];
          },
        },
        { title: 'Justification', key: 'justification' },
        { title: 'Auteur', key: 'auteur' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Unité', key: 'unite' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      travaux: (state) => state.travail.liste,
      sapeurs: (state) => state.sapeur.liste,
      travailTypes: (state) => state.travailType.liste,
      hasSaisiePersoPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.FICHE_TRAVAIL.SAISIE_PERSO
        ),
      hasSaisieCommunePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.FICHE_TRAVAIL.SAISIE_COMMUNE
        ),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.FICHE_TRAVAIL.VALIDATION
        ),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.FICHE_TRAVAIL.SAISIE_PERSO
        ) ||
        state.auth.sis.permissions.includes(
          permissions.FICHE_TRAVAIL.SAISIE_COMMUNE
        ),
    }),
    filteredSapeurs() {
      const ids = new Set(this.travaux.map((i) => parseInt(i.sapeur_id)));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
    filteredTravailTypes() {
      const ids = new Set(this.travaux.map((i) => parseInt(i.travail_type_id)));
      return this.travailTypes.filter((t) => ids.has(t.id));
    },
    filteredTravaux() {
      return this.travaux.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val >= 0)
          .map(
            ([key, value]) =>
              (x) =>
                x[key] == value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
    canDelete() {
      return (
        this.selectedId &&
        this.travaux.filter((i) => i.id == this.selectedId && i.statut < 3)
          .length > 0
      );
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchTravaux').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    select(row) {
      this.selectedId = row?.id;
    },
    supprimerIntervention(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce travail ?',
          question:
            "Attention, la suppression d'un travail est irréversible ! Toutes les données relatives à celui-ci seront suppriméses définitivement.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeIntervention', id);
          }
        },
      });
    },
    validerIntervention(id) {
      this.$store.dispatch('validerIntervention', id);
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }
      const statutsClass = {
        [-1]: 'table-warning', // 'Refusé',
        0: '', // 'En attente',
        1: 'table-success', // 'Accepté'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style lang="scss" scoped></style>
