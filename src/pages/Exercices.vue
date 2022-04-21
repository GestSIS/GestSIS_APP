<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Exercices</li>
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
          <div class="card-body d-grid gap-2">
            <router-link custom to="/exercices/new" v-slot="{ navigate }">
              <button @click="navigate" class="btn btn-outline-primary" v-if="hasEditPermission">Ajouter un
                exercice</button>
            </router-link>
            <router-link custom :to="'/exercices/' + selectedId" v-slot="{ navigate }">
              <button :disabled="!selectedId" @click="navigate" class="btn btn-outline-primary">{{
                hasEditPermission ?
                  "Modifier" : "Aperçu"
              }}</button>
            </router-link>
            <button :disabled="!selectedId" @click="sms({ id: selectedId })"
              class="btn btn-outline-primary">SMS</button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <button class="btn btn-outline-primary" :disabled="!exercices.length"
              @click="convoquer">Convocations</button>
            <button :disabled="!selectedId" @click="listePresences({ id: selectedId })"
              class="btn btn-outline-primary">Liste de présences</button>
            <button :disabled="!selectedId" @click="listeAppel({ id: selectedId })"
              class="btn btn-outline-primary">Liste d'appel</button>
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
              <div class="col-md-4">
                <select class="form-select form-select-sm" id="filterLocalite" @change="
                  (event) => onFilter('localite_id', event.target.value)
                ">
                  <option>&lt;Localité&gt;</option>
                  <option v-for="loc in filteredLocalites" :key="loc.id" :value="loc.id">{{ loc.designation }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select form-select-sm" id="filterCategorie" @change="
                  (event) =>
                    onFilter('exercice_categorie_id', event.target.value)
                ">
                  <option>&lt;Catégorie&gt;</option>
                  <option v-for="categorie in filteredExercicesCategories" :key="categorie.id" :value="categorie.id">{{
                    categorie.designation
                  }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select form-select-sm" id="filterStatus" @change="
                  (event) => onFilter('statut', parseInt(event.target.value))
                ">
                  <option value="-1">&lt;Statut&gt;</option>
                  <option value="0">Annulé</option>
                  <option value="1">Sapeurs à ajouter</option>
                  <option value="2">En attente de validation</option>
                  <option value="3">A imputer</option>
                  <option value="4">Imputée</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-5 table-responsive">
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <base-table v-show="!loading" ref="basetable_exercices" :selectable="true" selectKey="id"
            row-selected-class="table-primary" @selected="selectExercice" :fields="fieldsBase"
            :detail-row-component="detailRow" detail-row-class="m-td-0" no-data="Aucun exercice/séance à afficher"
            :data="filteredExercices" :row-class="onRowClass">
            <template v-slot:details="props">
              <div class="d-flex">
                <button class="btn btn-link border-0" @click="props.actions.toggleDetailRow(props.rowData.id)">
                  <font-awesome-icon v-if="props.status.detailRowVisible || false" :icon="['fas', 'angle-down']" />
                  <font-awesome-icon v-if="!props.status.detailRowVisible || false" :icon="['fas', 'angle-right']" />
                </button>
              </div>
            </template>
            <template v-slot:actions="props">
              <router-link :to="'/exercices/' + props.rowData.id" custom v-slot="{ navigate }">
                <button class="btn btn-outline-primary border-0" @click="navigate">
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
              </router-link>
              <button class="btn btn-outline-primary border-0" @click="validerExercice(props.rowData.id)"
                v-if="hasValidationPermission && props.rowData.statut == 2">
                <font-awesome-icon :icon="['fas', 'check']" />
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
import { markRaw } from 'vue';
import store from '@/store/index';
import permissions from '@/store/permissions.js';

import ExerciceDetails from '@/components/exercice/ExerciceDetails.vue';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

import ExerciceService from '@/services/ExerciceService.js';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(routeTo, next) {
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');

  await store.dispatch('fetchExercicesComptables');

  let loadExercices = store.dispatch('fetchListeExercice');
  Promise.all([loadExercices, loadLocalities, loadExerciceCategories]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'exercices',
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
      this.$store.dispatch('fetchListeExercice').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  data() {
    return {
      loading: true,
      selectedId: null,
      filters: {},
      detailRow: markRaw(ExerciceDetails),
      fieldsBase: [
        {
          title: '',
          key: 'details',
          slot: 'details',
          dataClass: 'details-width',
        },
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
        },
        {
          title: 'Categorie',
          key: 'categorie',
          sortKey: 'categorie',
        },
        {
          title: 'Heure',
          key: 'heure',
          sortKey: 'heure',
          formatter(value) {
            return value.slice(0, 5);
          },
        },
        {
          title: 'Duree',
          key: 'duree',
          sortKey: 'duree',
        },
        {
          title: 'Localité',
          key: 'localite',
          sortKey: 'localite',
        },
        {
          title: 'Lieu',
          key: 'lieu',
          sortKey: 'lieu',
        },
        {
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Statut',
          key: 'statut',
          sortKey: 'statut',
          formatter(value) {
            const statuts = {
              0: 'Annulé',
              1: 'A saisir',
              2: 'En attente de validation',
              3: 'A imputer',
              4: 'Imputée',
            };
            return statuts[value];
          },
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center'
        },
      ],
    };
  },
  computed: {
    ...mapState({
      exercices: (state) => state.exercice.liste,
      categories: (state) => state.exerciceCategorie.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasEditPermission: (state) => state.auth.sis.permissions.includes(
        permissions.EXERCICE.MODIFICATION
      ),
      hasValidationPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
    ...mapGetters(['activeExerciceId']),
    computedData() {
      return this.exercices.map((s) => ({
        ...s,
        categorie: this.categories.find((c) => c.id == s.exercice_categorie_id)
          ?.designation,
        localite: this.localites.find((l) => l.id == s.localite_id)
          ?.designation,
      }));
    },
    filteredExercicesCategories() {
      const ids = new Set(
        this.exercices.map((i) => parseInt(i.exercice_categorie_id))
      );
      return this.categories.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(this.exercices.map((i) => parseInt(i.localite_id)));
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredExercices() {
      return this.computedData.filter(
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
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    convoquer() {
      this.SHOW_MODAL({ component: 'ModalConvoquer', size: 2 });
    },
    sms({ id }) {
      this.SHOW_MODAL({ component: 'ModalSms', size: 2 });
    },
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
    },
    selectExercice(row) {
      this.selectedId = row?.id;
    },
    listePresences({ id }) {
      ExerciceService.downloadListPresence(id, 'liste-presence.pdf');
    },
    listeAppel({ id }) {
      ExerciceService.downloadListAppel(id, 'liste-appel.pdf');
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return '';
      }

      const statutsClass = {
        0: 'text-danger', //'Annulé',
        1: '', //'A saisir',
        2: '', //'Saisie',
        3: '', //'Validé',
        4: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0>td {
  padding: 0 !important;
}
</style>
