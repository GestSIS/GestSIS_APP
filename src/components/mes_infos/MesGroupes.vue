<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes groupes</h3>
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
import store from '@/store/index';

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
        { title: 'Début', key: 'debut', type: Date },
        { title: 'Fin', key: 'fin', type: Date },
        { title: 'Fonction', key: 'groupe' },
        { title: 'Remarques', key: 'remarques' },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) =>
        state.mesInfos.groupes.map((t) => ({
          ...t,
          groupe: state.groupes.liste.find((e) => e.id == t.groupe_id)
            ?.designation,
        })),
    }),
  },
};
</script>

<style scoped></style>
