<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
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
          <form class="card-body d-grid gap-1">
            <router-link
              tag="button"
              to="/interventions/new"
              class="btn btn-outline-primary"
            >
              Ajouter une intervention
            </router-link>
            <router-link
              tag="button"
              :disabled="!selectedId"
              :to="'/interventions/' + selectedId"
              class="btn btn-outline-primary"
            >
              Modifier
            </router-link>
            <button
              :disabled="!canDelete"
              @click="supprimerIntervention(selectedId)"
              class="btn btn-outline-primary"
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <form class="card-body d-grid gap-1">
            <button
              :disabled="!selectedId"
              @click="rapportIntervention"
              class="btn btn-outline-primary"
            >
              Rapport d'intervention
            </button>
          </form>
        </div>
      </div>
      <div class="col-md-6">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <form class="card-body">
            <div class="row">
              <div class="mb-3 col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterLocalite"
                  @change="
                    (event) => onFilter('localite_id', event.target.value)
                  "
                >
                  <option>&lt;Localité&gt;</option>
                  <option
                    v-for="loc in filteredLocalites"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterType"
                  @change="
                    (event) =>
                      onFilter('type_intervention_id', event.target.value)
                  "
                >
                  <option>&lt;Type&gt;</option>
                  <option
                    v-for="type in filteredInterventionsTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterStatistique"
                  @change="
                    (event) => onFilter('stat_federal_id', event.target.value)
                  "
                >
                  <option>&lt;Statistique fédérale&gt;</option>
                  <option
                    v-for="stat in filteredStatFederal"
                    :key="stat.id"
                    :value="stat.id"
                  >
                    {{ stat.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterTraitement"
                  @change="
                    (event) =>
                      onFilter('intervention_traitement_id', event.target.value)
                  "
                >
                  <option>&lt;Traitement&gt;</option>
                  <option
                    v-for="traitement in traitements"
                    :key="traitement.id"
                    :value="traitement.id"
                  >
                    {{ traitement.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="form-select form-select-sm"
                  id="filterEtendue"
                  @change="
                    (event) => onFilter('degre', parseInt(event.target.value))
                  "
                >
                  <option>&lt;Etendue&gt;</option>
                  <option value="1">Fausse alarme</option>
                  <option value="2">Petite</option>
                  <option value="3">Moyenne</option>
                  <option value="4">Grande</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <base-table
            :class="{ 'd-none': loading }"
            :fields="fields"
            :row-class="onRowClass"
            no-data="Aucune intervention à afficher"
            :data="filteredInterventions"
            @selected="select"
            :selectable="true"
            selectKey="id"
            row-selected-class="table-primary"
          >
            <template v-slot:actions="props">
              <div class="d-flex">
                <router-link
                  tag="button"
                  :to="'/interventions/' + props.rowData.id"
                  class="btn btn-outline-primary border-0"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </router-link>
                <button
                  class="btn btn-outline-primary border-0"
                  @click="validerIntervention(props.rowData.id)"
                  v-if="hasValidationPermission && props.rowData.statut === 1"
                >
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
              </div>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex';
import store from '@/store/index';
import permissions from '@/store/permissions.js';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

import BaseTable from '@/components/table/BaseTable.vue';

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
  name: 'interventions',
  components: {
    BaseTable,
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
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
        },
      ],
    };
  },
  computed: {
    ...mapState({
      interventions: (state) => state.intervention.liste,
      types: (state) => state.typeIntervention.liste,
      stats: (state) => state.statFederal.liste,
      traitements: (state) => state.interventionTraitement.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      hasValidationPermission: (state) =>
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.VALIDATION
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
            this.$store.dispatch('removeIntervention', this.selectedId);
          }
        },
      });
    },
    validerIntervention(id) {
      this.$store.dispatch('validerIntervention', id);
    },
    rapportIntervention() {
      this.SHOW_MODAL({
        component: 'ModalRapportIntervention',
        size: 1,
        data: { interventionId: this.selectedId },
      });
      //TODO: imprimer le rapport d'intervention -> modal
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
