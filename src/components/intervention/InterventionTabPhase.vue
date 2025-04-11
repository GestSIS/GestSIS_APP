<template>
  <div class="col-xs-12 col-md-6">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Phases de l'intervention</h3>
        <button
          v-if="hasEditPermission"
          type="button"
          class="btn btn-primary"
          @click="newPhase"
        >
          Nouvelle phase
        </button>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :fields="fields"
          :data="phases"
          :selectable="true"
          no-data="Erreur, une phase est nécessaire pour chaque intervention, veuillez contacter l'administrateur du système."
        >
          <template #actions="{ rowData }">
            <button
              v-if="rowData.debut !== null && hasEditPermission"
              type="button"
              class="btn btn-outline-primary border-0 ms-2"
              @click="editPhase(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              v-if="rowData.debut !== null && hasEditPermission"
              type="button"
              class="btn btn-outline-danger border-0"
              @click="removePhase(rowData.id)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'InterventionTabGroupes',
  data() {
    return {
      selected: {},
      fields: [
        { title: 'Début', key: 'date_heure', type: 'datetime' },
        { title: 'Type', key: 'designation' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      data: (state) => state.intervention.active.data,
      phases: (state) =>
        state.intervention.active.phases.map((p) => ({
          ...p,
          date_heure:
            p?.debut === null
              ? `${state.intervention.active.data?.date_debut} ${state.intervention.active.data?.heure_debut}`
              : p?.debut.slice(0, 16),
          designation: state.phaseType.liste.find(
            (phase) => phase.id == p.phase_type_id
          )?.designation,
        })),
      sapeurs: (state) => state.sapeur.liste,
      phasesType: (state) => state.phaseType.liste,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
      activeInterventionId: (state) => state.intervention.active.id,
    }),
  },
  mounted() {
    this.$store.dispatch('fetchPhaseTypes');
    this.$store.dispatch('fetchIntervention', this.activeInterventionId);
    this.$store.dispatch('fetchInterventionPhases', this.activeInterventionId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newPhase() {
      this.$store.dispatch('resetActivePhase');
      this.SHOW_MODAL({
        component: 'ModalPhase',
        callback: () => {},
        data: {
          min: this.data.date_debut + ' ' + this.data.heure_debut,
          max: this.data.date_fin + ' ' + this.data.heure_fin,
        },
      });
    },
    editPhase(phase) {
      const clone = {};
      Object.assign(clone, phase);
      this.$store.dispatch('updateActivePhase', clone);
      this.SHOW_MODAL({
        component: 'ModalPhase',
        callback: () => {},
        data: {
          min: this.data.date_debut + ' ' + this.data.heure_debut,
          max: this.data.date_fin + ' ' + this.data.heure_fin,
        },
      });
    },
    removePhase(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette phase ?',
          question:
            "Attention, la suppression d'une phase est irréversible ! Toutes les données de cette phase seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removePhase', id);
          }
        },
      });
    },
  },
};
</script>

<style scoped></style>
