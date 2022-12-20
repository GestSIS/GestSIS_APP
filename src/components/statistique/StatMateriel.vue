<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
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
        <base-table
          :fields="fields"
          :data="filteredMateriel"
          no-data="Aucun matériel utilisé"
          :selectable="true"
        />
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
      fields: [
        {
          title: 'Matériel',
          key: 'designation',
        },
        {
          title: 'Quantité utilisé',
          key: 'quantite',
        },
      ],
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
      return this.materiels
        .filter((e) => this.allMateriels || this.occurences[e.id])
        .map((e) => ({ ...e, quantite: this.occurences[e.id] ?? 0 }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
