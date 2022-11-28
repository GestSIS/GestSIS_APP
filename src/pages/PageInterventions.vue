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
              Interventions
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
            <router-link
              v-slot="{ navigate }"
              custom
              :to="{ name: 'intervention', params: { id: 'new' } }"
            >
              <button
                v-if="hasEditPermission"
                class="btn btn-outline-primary"
                @click="navigate"
              >
                Ajouter une intervention
              </button>
            </router-link>
            <router-link
              v-slot="{ navigate }"
              custom
              :to="'/interventions/' + selectedId"
            >
              <button
                :disabled="!selectedId"
                class="btn btn-outline-primary"
                @click="navigate"
              >
                {{ hasEditPermission ? 'Modifier' : 'Aperçu' }}
              </button>
            </router-link>
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
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <div class="card-body d-grid gap-1">
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="rapportIntervention"
            >
              Rapport d'intervention
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <base-select
                class="mb-1 col-md-4"
                :options="filteredLocalites"
                display-key="designation"
                value-key="id"
                base-option="<Localité>"
                @update:model-value="(value) => onFilter('localite_id', value)"
              />
              <base-select
                class="mb-1 col-md-4"
                :options="filteredInterventionsTypes"
                display-key="designation"
                value-key="id"
                base-option="<Type>"
                @update:model-value="
                  (value) => onFilter('type_intervention_id', value)
                "
              />
              <base-select
                class="mb-1 col-md-4"
                :options="filteredStatFederal"
                display-key="designation"
                value-key="id"
                base-option="<Statistique fédérale>"
                @update:model-value="
                  (value) => onFilter('stat_federal_id', value)
                "
              />
              <base-select
                class="col-md-4"
                :options="traitements"
                display-key="designation"
                value-key="id"
                base-option="<Statistique fédérale>"
                @update:model-value="
                  (value) => onFilter('intervention_traitement_id', value)
                "
              />
              <base-select
                class="col-md-4"
                :options="[
                  { id: 1, label: 'Fausse alarme' },
                  { id: 2, label: 'Petite' },
                  { id: 3, label: 'Moyenne' },
                  { id: 4, label: 'Grande' },
                ]"
                display-key="label"
                value-key="id"
                base-option="<Etendue>"
                @update:model-value="(value) => onFilter('degre', value)"
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
            no-data="Aucune intervention à afficher"
            :data="filteredInterventions"
            :selectable="true"
            @selected="select"
          >
            <template #actions="props">
              <router-link
                v-slot="{ navigate }"
                :to="'/interventions/' + props.rowData.id"
                custom
              >
                <button
                  class="btn btn-outline-primary border-0"
                  @click="navigate"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
              </router-link>
              <button
                v-if="hasValidationPermission && props.rowData.statut === 1"
                class="btn btn-outline-primary border-0"
                @click="validerIntervention(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
              <button
                v-if="hasEditPermission && props.rowData.statut <= 3"
                title="supprimer"
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
import { mapGetters, mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';
import store from '@/store/index';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadStatFederal = store.dispatch('fetchStatFederals');
  let loadTypeInterventions = store.dispatch('fetchTypeInterventions');
  let loadInterventionTraitement = store.dispatch(
    'fetchInterventionTraitements'
  );

  await store.dispatch('fetchExercicesComptables');

  let loadInterventions = store.dispatch('fetchListeIntervention');
  Promise.all([
    loadSapeurs,
    loadLocalities,
    loadStatFederal,
    loadInterventions,
    loadTypeInterventions,
    loadInterventionTraitement,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'PageInterventions',
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
    const self = this;

    return {
      loading: true,
      filters: {},
      selectedId: null,
      fields: [
        {
          title: 'Date',
          key: 'date_debut',
          dataClass: 'align-middle',
          sortKey: 'date_debut',
          type: 'date',
        },
        {
          title: 'Heure',
          key: 'heure_debut',
          formatter(value) {
            return value.slice(0, 5);
          },
          sortKey: 'heure_debut',
        },
        {
          title: "Type d'intervention",
          key: 'type_intervention_id',
          formatter(id) {
            return self.types.find((t) => t.id == id)?.designation;
          },
          sortKey: 'type_intervention_id',
        },
        {
          title: 'Localité',
          key: 'localite_id',
          formatter(id) {
            return self.localites.find((l) => l.id == id)?.designation;
          },
          sortKey: 'localite_id',
        },
        {
          title: 'Lieu',
          key: 'lieu',
          dataClass: 'align-middle',
        },
        {
          title: 'Stat fédéral',
          key: 'stat_federal_id',
          formatter(id) {
            return self.stats.find((s) => s.id == id)?.designation;
          },
          sortKey: 'stat_federal_id',
        },
        {
          title: 'Traitement',
          key: 'intervention_traitement_id',
          formatter(id) {
            return self.traitements.find((t) => t.id == id)?.designation;
          },
          sortKey: 'intervention_traitement_id',
        },
        {
          title: 'Étendue',
          key: 'degre',
          formatter(value) {
            const degre = {
              1: 'Fausse-alarme',
              2: 'Petite',
              3: 'Moyenne',
              4: 'Grande',
            };
            return degre[value];
          },
          sortKey: 'degre',
        },
        {
          title: 'Statut',
          key: 'statut',
          formatter(value) {
            const statuts = {
              0: 'A saisir',
              1: 'A valider',
              2: 'Validée',
              3: 'Imputée',
            };
            return statuts[value];
          },
          sortKey: 'statut',
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      interventions: (state) =>
        state.intervention.liste.sort((a, b) =>
          a.date_debut.localeCompare(b.date_debut)
        ),
      types: (state) => state.typeIntervention.liste,
      stats: (state) => state.statFederal.liste,
      traitements: (state) => state.interventionTraitement.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.VALIDATION
        ),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
    ...mapGetters(['currentExerciceComptableId']),
    filteredInterventionsTypes() {
      const ids = new Set(
        this.interventions.map((i) => parseInt(i.type_intervention_id))
      );
      return this.types.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(
        this.interventions.map((i) => parseInt(i.localite_id))
      );
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredStatFederal() {
      const ids = new Set(
        this.interventions.map((i) => parseInt(i.stat_federal_id))
      );
      return this.stats.filter((t) => ids.has(t.id));
    },
    filteredInterventions() {
      return this.interventions.filter(
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
        this.interventions.filter(
          (i) => i.id == this.selectedId && i.statut < 3
        ).length > 0
      );
    },
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListeIntervention').then(() => {
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
          title: "Voulez-vous vraiment supprimer l'intervention ?",
          question:
            "Attention, la suppression d'une intervention est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
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
    rapportIntervention() {
      const statut = this.interventions.find(
        (i) => i.id == this.selectedId
      )?.statut;
      this.SHOW_MODAL({
        component: 'ModalRapportIntervention',
        size: 1,
        data: { interventionId: this.selectedId, statut },
      });
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }
      const statutsClass = {
        0: '', // 'A saisir',
        1: '', // 'En attente de validation',
        2: '', // 'Validée',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style lang="scss" scoped></style>
