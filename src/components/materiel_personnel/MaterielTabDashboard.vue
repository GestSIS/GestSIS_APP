<template>
  <div class="row">
    <div class="col-6">
      <materiel-alertes />
    </div>
    <div class="col-6">
      <materiel-a-recuperer />
    </div>
  </div>
</template>

<script>
import MaterielARecuperer from '/src/components/MATERIEL/MaterielARecuperer.vue';
import MaterielAlertes from '/src/components/MATERIEL/MaterielAlertes.vue';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadMaterielARecuperer = store.dispatch('fetchMatPersoARecuperer');
  const loadMaterielAlertes = store.dispatch('fetchMatPersoAlertes');

  Promise.all([loadMaterielARecuperer, loadMaterielAlertes]).then(() => {
    next();
  });
}

export default {
  name: 'PageMaterielPersonnel',
  components: {
    MaterielARecuperer,
    MaterielAlertes,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

table a.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>
