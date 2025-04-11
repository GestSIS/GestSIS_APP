<template>
  <div class="col-xs-12 col-lg-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Véhicules</h3>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :data="vehicules"
          :fields="fields"
          no-data="Aucun véhicule de disponible pour votre SIS, ajoutez-en dans configuration."
        >
          <template #check="{ rowData }">
            <input
              :id="'v-' + rowData.id"
              v-model="selected[rowData.id]"
              :disabled="!hasEditPermission"
              type="checkbox"
              class="form-check-input"
              @change="editVehicule(rowData.id)"
            />
            <label class="form-check-label" :for="'v-' + rowData.id"></label>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'InterventionTabVehicules',
  data() {
    return {
      selected: {},
      fields: [
        {
          title: 'Véhicule',
          key: 'designation',
        },
        {
          title: 'Présent',
          key: 'id',
          slot: 'check',
          columnClass: 'ps-4',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      vehicules: (state) =>
        state.vehicule.liste.filter(
          (v) =>
            v.statut === 1 ||
            state.intervention.active.vehicules.find(
              (vi) => vi.vehicule_id === v.id
            )
        ),
      interventionVehicules: (state) => state.intervention.active.vehicules,
      activeInterventionId: (state) => state.intervention.active.id,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
  },
  mounted() {
    if (this.vehicules.length === 0) {
      this.$store.dispatch('fetchVehicules');
    }
    this.$store
      .dispatch('fetchInterventionVehicules', this.activeInterventionId)
      .then(() => {
        this.updateVehicules(this.interventionVehicules);
      });
  },
  methods: {
    async editVehicule(vehiculeId) {
      const event = this.selected[vehiculeId]
        ? 'addInterventionVehicules'
        : 'removeInterventionVehicules';

      this.$store
        .dispatch(event, [vehiculeId])
        .then(() => this.$awn.success('Modifications enregistrées'));
    },
    updateVehicules(value) {
      this.selected = {};
      const svm = this;

      value.forEach(
        (v) => (svm.selected = { ...svm.selected, [v.vehicule_id]: true })
      );
    },
  },
};
</script>

<style scoped></style>
