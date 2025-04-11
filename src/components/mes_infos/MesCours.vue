<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes cours</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="cours"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun cours"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadMesCours = store.dispatch('fetchMesCours');
  const loadlocalites = store.dispatch('fetchLocalites');
  const loadCours = store.dispatch('fetchCours');

  Promise.all([loadMesCours, loadlocalites, loadCours]).then(() => {
    next();
  });
}

export default {
  name: 'MesCours',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Désignation', key: 'designation' },
        { title: 'Lieu', key: 'localite' },
        { title: 'Durée [jours]', key: 'duree' },
      ],
    };
  },
  computed: {
    ...mapState({
      cours: (state) =>
        state.mesInfos.cours
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((c) => ({
            ...c,
            designation: state.cours.liste.find(
              (cours) => cours.id == c.cours_id
            )?.designation,
            localite: state.localite.liste.find((l) => l.id == c.localite_id)
              ?.designation,
          })),
    }),
  },
};
</script>

<style scoped></style>
