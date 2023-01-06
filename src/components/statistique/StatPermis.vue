<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats permis</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-fonction"
            v-model="allPermis"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-fonction"
            >Afficher tous les permis disponibles</label
          >
        </div>
      </div>
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="filteredPermis"
          no-data="Aucun permis"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StatPermis',
  data() {
    return {
      allPermis: false,
      fields: [
        { title: 'Permis', key: 'type' },
        { title: 'Nombre', key: 'quantite' },
      ],
    };
  },
  computed: {
    ...mapState({
      permis: (state) => state.baseData.permisTypes,
      sapeurs: (state) =>
        state.sapeur.liste.map((s) => ({
          ...s,
          permis: new Set(s.permis),
        })),
    }),
    occurences() {
      const occurences = {};
      this.sapeurs.forEach((s) => {
        s.permis.forEach((f) => (occurences[f] = (occurences[f] ?? 0) + 1));
      });
      return occurences;
    },
    filteredPermis() {
      return this.permis
        .filter((e) => this.allPermis || this.occurences[e.id])
        .map((e) => ({ ...e, quantite: this.occurences[e.id] ?? 0 }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
