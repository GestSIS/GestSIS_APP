<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline mb-5">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats véhicules pour interventions</h3>
        <div class="form-check form-switch mb-2">
          <input
            type="checkbox"
            class="form-check-input"
            id="switch-vehicule"
            v-model="allVehicules"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les véhicules n'ayant pas effectué d'interventions</label
          >
        </div>
      </div>
      <div class="card-body">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Véhicule</th>
              <th class="text-center">Nombre d'interventions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredVehicules.length <= 0">
              <td colspan="2">Aucun véhicule utilisé</td>
            </tr>
            <tr v-for="e in filteredVehicules" :key="e.id">
              <td>{{ e.designation }}</td>
              <td class="text-center">
                {{ occurences[e.id] || 0 }}
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

export default {
  name: 'stat-intervention',
  data() {
    return {
      allVehicules: false,
    };
  },
  computed: {
    ...mapState({
      vehicules: (state) => state.vehicule.liste,
      vehiculesIntervention: (state) => state.statistique.vehicules,
    }),
    occurences() {
      return this.vehiculesIntervention.reduce(
        (prev, vehicule) => (
          (prev[vehicule.vehicule_id] =
            (prev[vehicule.vehicule_id] ?? 0) + vehicule.nb),
          prev
        ),
        {}
      );
    },
    filteredVehicules() {
      return this.vehicules.filter(
        (e) => this.allVehicules || this.occurences[e.id]
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>
