<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mon matériel</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="materiels"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun matériel pour le moment"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadMonMateriel = store.dispatch('fetchMonMateriel');
  const loadMaterielType = store.dispatch('fetchMaterielTypes');

  Promise.all([loadMonMateriel, loadMaterielType]).then(() => {
    next();
  });
}

export default {
  name: 'MonMateriel',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Matériel type', key: 'materiel_type' },
        { title: 'Taille', key: 'taille' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Numéro', key: 'numero' },
        { title: 'Remarque', key: 'remarque' },
        { title: 'Attribution', key: 'attribution', type: Date },
        { title: 'Retour', key: 'retour', type: Date },
      ],
    };
  },
  computed: {
    ...mapState({
      materiels: (state) =>
        state.mesInfos.materiels.map((m) => ({
          quantite: 1,
          ...m.materiel,
          ...m,
          materiel_type: state.matPersoType.liste.find(
            (t) => t.id == m.materiel_type_id
          )?.designation,
        })),
    }),
  },
};
</script>

<style scoped></style>
