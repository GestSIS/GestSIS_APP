<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline mb-5">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats matériel pour interventions</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-materiel"
            v-model="allMateriels"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-materiel"
            >Afficher le matériel disponible mais pas référencé durant au moins
            une intervention</label
          >
        </div>
      </div>
      <div class="card-body">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Matériel</th>
              <th class="text-center">Quantité utilisée</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredMateriel.length <= 0">
              <td colspan="2">Aucun matériel utilisé</td>
            </tr>
            <tr v-for="e in filteredMateriel" :key="e.id">
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
  name: 'StatMateriel',
  data() {
    return {
      allMateriels: false,
    };
  },
  computed: {
    ...mapState({
      materiels: (state) => state.materiel.liste,
      materielsIntervention: (state) => state.statistique.materiels,
    }),
    occurences() {
      return this.materielsIntervention.reduce(
        (prev, { materiel_id, nb }) => (
          (prev[materiel_id] = (prev[materiel_id] ?? 0) + parseFloat(nb)), prev
        ),
        {}
      );
    },
    filteredMateriel() {
      return this.materiels.filter(
        (e) => this.allMateriels || this.occurences[e.id]
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>
