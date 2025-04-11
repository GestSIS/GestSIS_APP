<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes mutations</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="fonctions"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune mutation"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadMesMutations = store.dispatch('fetchMesMutations');
  const loadLocalites = store.dispatch('fetchLocalites');

  Promise.all([loadMesMutations, loadLocalites]).then(() => {
    next();
  });
}

export default {
  name: 'MonMutations',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Incorporation', key: 'incorporation', type: Date },
        { title: 'Sortie', key: 'sortie', type: Date },
        { title: 'Motif', key: 'motif' },
        { title: 'Localité', key: 'localite' },
      ],
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) =>
        state.mesInfos.mutations.map((t) => ({
          ...t,
          localite: state.localite.liste.find((l) => l.id == t.localite_id)
            ?.designation,
        })),
    }),
  },
};
</script>

<style scoped></style>
