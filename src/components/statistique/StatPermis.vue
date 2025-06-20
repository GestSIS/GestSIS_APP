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
      <div class="card-body table-responsive p-0">
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
      sapeurPermis: (state) => state.statistique.permis,
    }),
    occurences() {
      return this.sapeurPermis.reduce(
        (prev, { permis_type_id, nb }) => (
          (prev[permis_type_id] = (prev[permis_type_id] ?? 0) + parseFloat(nb)),
          prev
        ),
        {},
      );
    },
    filteredPermis() {
      return this.permis
        .filter((e) => this.allPermis || this.occurences[e.id])
        .map((e) => ({ ...e, quantite: this.occurences[e.id] ?? 0 }));
    },
  },
};
</script>
