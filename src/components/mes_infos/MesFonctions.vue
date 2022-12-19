<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes fonctions</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="fonctions"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune fonction"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadMesFonctions = store.dispatch('fetchMesFonctions');
  let loadFonctions = store.dispatch('fetchFonctions');

  Promise.all([loadMesFonctions, loadFonctions]).then(() => {
    next();
  });
}

export default {
  name: 'MonFonctions',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Début', key: 'debut', type: Date },
        { title: 'Fin', key: 'fin', type: Date },
        { title: 'Fonction', key: 'fonction' },
        { title: 'Remarques', key: 'remarques' },
      ],
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) =>
        state.mesInfos.fonctions.map((t) => ({
          ...t,
          fonction: state.fonctions.liste.find((e) => e.id == t.fonction_id)
            ?.designation,
        })),
    }),
  },
};
</script>

<style scoped></style>
