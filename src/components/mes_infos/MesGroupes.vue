<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes groupes d'alarme</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="groupes"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun groupe"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  let loadMesGroupes = store.dispatch('fetchMesGroupes');
  let loadGroupes = store.dispatch('fetchGroupes');

  Promise.all([loadMesGroupes, loadGroupes]).then(() => {
    next();
  });
}

export default {
  name: 'MonGroupes',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Numéro', key: 'numero', columnClass: 'col-2' },
        { title: 'Désignation', key: 'designation' },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) =>
        state.mesInfos.groupes
          .map((t) => ({
            ...t,
            designation: state.groupe.liste.find((e) => e.id == t.groupe_id)
              ?.designation,
            numero: state.groupe.liste.find((e) => e.id == t.groupe_id)?.no,
            type: state.groupe.liste.find((e) => e.id == t.groupe_id)?.type,
          }))
          .filter((g) => g.type),
    }),
  },
};
</script>

<style scoped></style>
