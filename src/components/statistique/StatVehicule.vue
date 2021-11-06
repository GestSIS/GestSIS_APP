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
            <tr
              v-for="e in vehicules.filter(
                (e) => allVehicules || occurences[e.id]
              )"
              :key="e.id"
            >
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
      return this.vehiculesIntervention
        .map((e) => e.vehicule_id)
        .reduce((prev, id) => ((prev[id] = ++prev[id] || 1), prev), {});
    },
  },
};
</script>

<style lang="scss" scoped>
</style>