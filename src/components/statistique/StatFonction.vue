<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats fonctions</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-fonction"
            v-model="allFonctions"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-fonction"
            >Afficher toutes les fonctions</label
          >
        </div>
      </div>
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="filteredFonction"
          no-data="Aucune fonction"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StatFonction',
  data() {
    return {
      allFonctions: false,
      fields: [
        { title: 'Fonction', key: 'nom' },
        { title: 'Nombre', key: 'quantite' },
      ],
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      sapeurs: (state) =>
        state.sapeur.liste.map((s) => ({
          ...s,
          fonctions: new Set(s.fonctions),
        })),
    }),
    occurences() {
      const occurences = {};
      this.sapeurs.forEach((s) => {
        s.fonctions.forEach((f) => (occurences[f] = (occurences[f] ?? 0) + 1));
      });
      return occurences;
    },
    filteredFonction() {
      return this.fonctions
        .filter((e) => this.allFonctions || this.occurences[e.id])
        .map((e) => ({ ...e, quantite: this.occurences[e.id] ?? 0 }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
