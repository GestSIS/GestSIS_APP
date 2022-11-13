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
              Exercices
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
          <div class="card-body d-grid gap-2">
            <router-link
              v-slot="{ navigate }"
              custom
              :to="{ name: 'exercice', params: { id: 'new' } }"
            >
              <button
                v-if="hasEditPermission"
                class="btn btn-outline-primary"
                @click="navigate"
              >
                Ajouter un exercice
              </button>
            </router-link>
            <router-link
              v-slot="{ navigate }"
              custom
              :to="'/exercices/' + selectedId"
            >
              <button
                :disabled="!selectedId"
                class="btn btn-outline-primary"
                @click="navigate"
              >
                {{ hasEditPermission ? 'Modifier' : 'Aperçu' }}
              </button>
            </router-link>
            <!-- <button v-if="hasValidationPermission" :disabled="!selectedId" @click="annuler({ id: selectedId })"
              class="btn btn-outline-primary">
              Annuler
            </button>
            <button v-if="hasValidationPermission" :disabled="!selectedId" @click="annuler({ id: selectedId })"
              class="btn btn-outline-primary">
              Annuler
            </button> -->
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="sms({ id: selectedId })"
            >
              SMS
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
          <div class="card-body d-grid gap-2">
            <button
              class="btn btn-outline-primary"
              :disabled="!exercices.length"
              @click="convoquer"
            >
              Convocations
            </button>
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="listePresences({ id: selectedId })"
            >
              Liste de présences
            </button>
            <button
              :disabled="!selectedId"
              class="btn btn-outline-primary"
              @click="listeAppel({ id: selectedId })"
            >
              Liste d'appel
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
              <div class="col-md-4">
                <select
                  id="filterLocalite"
                  class="form-select form-select-sm"
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
                  id="filterCategorie"
                  class="form-select form-select-sm"
                  @change="
                    (event) =>
                      onFilter('exercice_categorie_id', event.target.value)
                  "
                >
                  <option>&lt;Catégorie&gt;</option>
                  <option
                    v-for="categorie in filteredExercicesCategories"
                    :key="categorie.id"
                    :value="categorie.id"
                  >
                    {{ categorie.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  id="filterStatus"
                  class="form-select form-select-sm"
                  @change="
                    (event) => onFilter('statut', parseInt(event.target.value))
                  "
                >
                  <option value="-1">&lt;Statut&gt;</option>
                  <option value="0">Annulé</option>
                  <option value="1">Sapeurs à ajouter</option>
                  <option value="2">En attente de validation</option>
                  <option value="3">Validé</option>
                  <option value="4">Imputé</option>
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
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            ref="basetable_exercices"
            :selectable="true"
            select-key="id"
            row-selected-class="table-primary"
            :fields="fieldsBase"
            :detail-row-component="detailRow"
            detail-row-class="m-td-0"
            no-data="Aucun exercice/séance à afficher"
            :data="filteredExercices"
            :row-class="onRowClass"
            @selected="selectExercice"
          >
            <template #details="props">
              <div class="d-flex">
                <button
                  class="btn btn-link border-0"
                  @click="props.actions.toggleDetailRow(props.rowData.id)"
                >
                  <font-awesome-icon
                    v-if="props.status.detailRowVisible || false"
                    :icon="['fas', 'angle-down']"
                  />
                  <font-awesome-icon
                    v-if="!props.status.detailRowVisible || false"
                    :icon="['fas', 'angle-right']"
                  />
                </button>
              </div>
            </template>
            <template #actions="props">
              <router-link
                v-slot="{ navigate }"
                :to="'/exercices/' + props.rowData.id"
                custom
              >
                <button
                  title="modifier"
                  class="btn btn-outline-primary border-0"
                  @click="navigate"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
              </router-link>
              <button
                v-if="hasValidationPermission && props.rowData.statut == 2"
                title="valider"
                class="btn btn-outline-primary border-0"
                @click="validerExercice(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
              <button
                v-if="
                  hasValidationPermission &&
                  props.rowData.statut <= 3 &&
                  props.rowData.statut > 0
                "
                title="annuler"
                class="btn btn-outline-warning border-0"
                @click="annulerExercice(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'ban']" />
              </button>
              <button
                v-if="hasValidationPermission && props.rowData.statut == 0"
                title="réactiver"
                class="btn btn-outline-success border-0"
                @click="reactiverExercice(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
              <button
                v-if="hasValidationPermission && props.rowData.statut <= 3"
                title="supprimer"
                class="btn btn-outline-danger border-0"
                @click="supprimerExercice(props.rowData.id)"
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
  name: 'PageExercices',
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
          type: 'date',
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
              3: 'Validé',
              4: 'Imputé',
            };
            return statuts[value];
          },
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
      exercices: (state) => state.exercice.liste,
      categories: (state) => state.exerciceCategorie.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.MODIFICATION),
      hasSmsEnvoiePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SMS.ENVOIE),
      hasValidationPermission: (state) =>
        state.auth.admin ||
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
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    convoquer() {
      this.SHOW_MODAL({ component: 'ModalConvoquer', size: 2 });
    },
    sms({ id }) {
      if (!this.hasSmsEnvoiePermission) {
        this.$awn.alert(
          "Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS"
        );
        return;
      }
      const exercice = this.exercices.find((e) => e.id == id);
      this.SHOW_MODAL({
        component: 'ModalSmsExercice',
        size: 2,
        data: exercice,
      });
    },
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
    },
    annulerExercice(id) {
      this.$store.dispatch('annulerExercice', id);
    },
    reactiverExercice(id) {
      this.$store.dispatch('reactiverExercice', id);
    },
    supprimerExercice(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cet exercice ?',
          question:
            "Attention, la suppression d'un exercice est irréversible ! Toutes les données de cet exercice seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('supprimerExercice', id);
          }
        },
      });
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

.m-td-0 > td {
  padding: 0 !important;
}
</style>
