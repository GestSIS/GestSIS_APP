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
              v-if="hasEditPermission"
              class="btn btn-outline-primary"
              @click="addAbsence"
            >
              Ajouter une absence
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="col-md-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-6">// TODO: Affichage par</div>
              <div class="col-6">// TODO: Mois à afficher</div>
            </div>
          </div>
        </div>
      </div> -->
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline table-responsive mb-3">
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            ref="basetable_absences"
            :selectable="true"
            :fields="fieldsBase"
            no-data="Aucune absence"
            :data="filteredData"
            :row-class="onRowClass"
            @selected="selectAbsence"
          >
            <template #actions="{ rowData }">
              <button
                v-if="hasEditPermission"
                title="modifier"
                class="btn btn-outline-primary border-0"
                @click="modifierAbsence(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                v-if="hasEditPermission"
                title="supprimer"
                class="btn btn-outline-danger border-0"
                @click="removeAbsence(rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
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
import store from '/src/store/index';
import permissions from '../../store/permissions.js';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadAbsences = store.dispatch(
    'fetchAbsences',
    store.state.exerciceComptable.activeId
  );
  const loadLocalites = store.dispatch('fetchLocalites');
  Promise.all([loadAbsences, loadSapeurs, loadLocalites]).then(() => {
    next();
  });
}

export default {
  name: 'AbsenceListe',
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
      fieldsBase: [
        { title: 'Sapeur', key: 'nom_prenom' },
        { title: 'Départ', key: 'debut', type: Date },
        { title: 'Retour', key: 'fin', type: Date },
        {
          title: 'Actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      absences: (state) =>
        state.absence.liste.sort((a, b) => a.debut.localeCompare(b.debut)),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.ABSENCE.MODIFICATION),
    }),
    computedData() {
      return this.absences.map((a) => ({
        ...a,
        nom_prenom: this.sapeurs.find((s) => s.id === a.sapeur_id)?.nom_prenom,
      }));
    },
    filteredLocalites() {
      const ids = new Set(this.absences.map((i) => parseInt(i.localite_id)));
      return this.localites.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId(id) {
      this.loading = true;
      this.$store.dispatch('fetchAbsences', id).then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    addAbsence() {
      this.SHOW_MODAL({ component: 'ModalAbsence' });
    },
    modifierAbsence(absence) {
      this.SHOW_MODAL({ component: 'ModalAbsence', data: absence });
    },
    removeAbsence(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette absence ?',
          question:
            "Attention, la suppression d'un absence est irréversible ! Toutes les données de cette absence seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeAbsence', id);
          }
        },
      });
    },
    selectAbsence(row) {
      this.selectedId = row?.id;
    },
    onRowClass(dataItem, isSelected) {
      if (dataItem.statut == 0) {
        return 'text-danger';
      }
      if (isSelected) {
        return '';
      }

      const statutsClass = {
        0: '', //'Annulé',
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

<style scoped></style>
