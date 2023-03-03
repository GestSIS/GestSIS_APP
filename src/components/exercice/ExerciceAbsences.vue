<template>
  <stateful-filter
    id="absences"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div class="col-md-3">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <button
              class="btn btn-outline-primary"
              :disabled="!computedData.length"
              @click="review"
            >
              Examiner les excuses non traitées
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
                class="col-md-6"
                :options="filteredLocalites"
                base-option="<Localité>"
                :model-value="filters.localite_id"
                @update:model-value="(value) => setFilter('localite_id', value)"
              />
              <base-select
                class="col-md-6"
                :options="filteredExercicesCategories"
                base-option="<Catégorie>"
                :model-value="filters.exercice_categorie_id"
                @update:model-value="
                  (value) => setFilter('exercice_categorie_id', value)
                "
              />
              <div v-if="canReset" class="col-md-6 mt-1">
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
        <div class="card card-primary card-outline table-responsive">
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            ref="basetable_exercices"
            :selectable="true"
            :fields="fieldsBase"
            :detail-row-column="true"
            :detail-row-component="detailRowComponent"
            detail-row-class="m-td-0"
            no-data="Aucun exercice/séance à afficher"
            :data="filteredData"
            :row-class="onRowClass"
            @selected="selectExercice"
          >
            <template #actions="{ rowData }">
              <button
                v-if="
                  hasValidationPermission &&
                  (rowData.excuse_statut == -1 || rowData.excuse_statut == 1)
                "
                title="Examen"
                class="btn btn-outline-warning border-0"
                @click="cancelReviewAbsence(rowData)"
              >
                <font-awesome-icon :icon="['fas', 'cancel']" />
              </button>
              <button
                v-if="hasValidationPermission && rowData.excuse_statut == 0"
                title="Examen"
                class="btn btn-outline-success border-0"
                @click="reviewAbsence(rowData)"
              >
                <font-awesome-icon :icon="['far', 'eye']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { markRaw } from 'vue';
import store from '/src/store/index';
import permissions from '../../store/permissions.js';

import ExerciceDetails from '/src/components/exercice/ExerciceDetails.vue';

async function loadData(routeTo, next) {
  const loadExercices = store.dispatch('fetchListeExercice');
  const loadAbsences = store.dispatch('fetchExerciceAbsences');
  const loadExcuseParams = store.dispatch('fetchExcuseParams');

  Promise.all([loadAbsences, loadExercices, loadExcuseParams]).then(() => {
    next();
  });
}

export default {
  name: 'ExerciceAbsences',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    const svm = this;
    return {
      loading: true,
      tab: 'exercice',
      selectedId: null,
      detailRowComponent: markRaw(ExerciceDetails),
      fieldsBase: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Categorie', key: 'categorie' },
        {
          title: 'Heure',
          key: 'heure',
          formatter(value) {
            return value.slice(0, 5);
          },
        },
        { title: 'Localité', key: 'localite' },
        { title: 'Designation', key: 'designation' },
        {
          title: 'Statut',
          key: 'excuse_statut',
          formatter(value, rowData) {
            const statuts = {
              '-1': 'Refusée',
              0: 'Excuse à traiter',
              1: 'Acceptée',
            };
            if (rowData.excuse_type_id) {
              return statuts[value];
            }

            var dateParts = rowData.date.split('-');
            const d = new Date(
              dateParts[0],
              dateParts[1] - 1,
              dateParts[2].substr(0, 2)
            );

            d.setDate(d.getDate() + (svm.excuseParam?.delai_excuse ?? 0));
            const diffDays = Math.ceil(
              Math.abs(new Date() - d) / (1000 * 60 * 60 * 24)
            );

            if (d < new Date()) {
              return 'Non excusé';
            } else {
              return 'Non excusé (' + diffDays + ' jours restants)';
            }
          },
        },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      excuseParam: (state) => state.excuseParam.params,
      sapeurs: (state) => state.sapeur.liste,
      absences: (state) => state.exercice.absences,
      exercices: (state) =>
        state.exercice.liste.sort((a, b) => a.date.localeCompare(b.date)),
      categories: (state) => state.exerciceCategorie.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      activeExerciceId: (state) => state.exercice.active.id,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
    computedData() {
      return this.absences
        .map((a) => ({
          ...a,
          sapeur: this.sapeurs.find((s) => s.id == a.sapeur_id)?.nom_prenom,
          ...this.exercices.find((e) => e.id == a.exercice_id),
          id: a.id,
        }))
        .map((e) => ({
          ...e,
          categorie: this.categories.find(
            (c) => c.id == e.exercice_categorie_id
          )?.designation,
          localite: this.localites.find((l) => l.id == e.localite_id)
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
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;

      const loadExercices = this.$store.dispatch('fetchListeExercice');
      const loadAbsences = this.$store.dispatch('fetchExerciceAbsences');
      Promise.all([loadExercices, loadAbsences]).then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selectExercice(row) {
      this.selectedId = row?.id;
    },
    review() {
      // TODO: Select première absence
      this.SHOW_MODAL({ component: 'ModalReviewAbsence', size: 2 });
    },
    reviewAbsence(absence) {
      this.SHOW_MODAL({
        component: 'ModalReviewAbsence',
        size: 2,
        data: absence,
      });
    },
    cancelReviewAbsence(absence) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: "Voulez-vous vraiment annuler l'examen de cette absence ?",
          question:
            "Attention, la justification fournie lors de l'examen sera perdue.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('cancelReviewAbsence', absence?.id);
          }
        },
      });
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
  },
};
</script>

<style></style>
