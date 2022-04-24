<template>
  <div class="col-xs-12 col-lg-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <!-- /.card-header -->
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Véhicules</h3>
        <button
          type="button"
          class="btn btn-primary"
          @click="save"
          v-if="hasEditPermission"
        >Enregistrer</button>
      </div>
      <div class="card-body">
        <table id="int-vehicules" class="table table-sm">
          <thead>
            <tr>
              <th>Véhicule</th>
              <th>Présent</th>
            </tr>
          </thead>
          <tbody id="vehicules">
            <tr v-if="vehicules.length <= 0">
              <td colspan="2">
                Aucun véhicule de disponible pour votre SIS, ajoutez-en dans
                <em>configuration</em>.
              </td>
            </tr>
            <tr v-for="v in vehicules" :key="v.id">
              <td>{{ v.designation }}</td>
              <td>
                <div class="text-center">
                  <input
                    type="checkbox"
                    :disabled="!hasEditPermission"
                    class="form-check-input"
                    :id="'v-' + v.id"
                    v-model="selected[v.id]"
                  />
                  <label class="form-check-label" :for="'v-' + v.id"></label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'InterventionTabVehicules',
  data() {
    return {
      selected: {},
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
      hasEditPermission: (state) => state.auth.sis.permissions.includes(
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
  watch: {
    interventionVehicules(value) {
      this.updateVehicules(value);
    },
  },
  methods: {
    async save() {
      let vehiculesIds = this.interventionVehicules.map((v) => v.vehicule_id);
      let ids = Object.keys(this.selected)
        .filter((item) => this.selected[item])
        .map((x) => parseInt(x));

      //New One
      let newOne = ids.filter((item) => !vehiculesIds.includes(item));

      //Removed
      let removed = vehiculesIds.filter((item) => !ids.includes(item));
      let removedIds = removed.map(
        (vehicule_id) =>
          this.interventionVehicules.find((v) => v.vehicule_id == vehicule_id)
            ?.id
      );

      if (removedIds.length > 0) {
        this.$store.dispatch('removeInterventionVehicules', removedIds);
      }
      if (newOne.length > 0) {
        this.$store.dispatch('addInterventionVehicules', newOne);
      }
    },
    updateVehicules(value) {
      this.selected = {};
      let svm = this;

      value.forEach(
        (v) => (svm.selected = { ...svm.selected, [v.vehicule_id]: true })
      );
    },
  },
};
</script>

<style scoped></style>
