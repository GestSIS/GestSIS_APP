<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Véhicules</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="vehicules"
        :fields="fields"
        no-data="Aucun véhicule"
        :selectable="true"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadVehicule = store.dispatch('fetchVehicules');

  Promise.all([loadVehicule]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreVehicule',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { columnClass: 'col-2', title: 'Actif', key: 'statut', type: Boolean },
        { title: 'Désignation', key: 'designation' },
      ],
    };
  },
  computed: {
    ...mapState({
      vehicules: (state) => state.vehicule.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
};
</script>

<style scoped></style>
