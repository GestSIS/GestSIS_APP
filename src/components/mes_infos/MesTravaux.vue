<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes travaux</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="materiels"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun travail pour le moment"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadMesTravaux = store.dispatch('fetchMesTravaux');
  let loadTravailTypes = store.dispatch('fetchTravailTypes');

  Promise.all([loadMesTravaux, loadTravailTypes]).then(() => {
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
        { title: 'Date', key: 'date', type: Date },
        { title: 'Travail', key: 'travail_type' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Unité', key: 'unite' },
        { title: 'Auteur', key: 'auteur' },
        { title: 'Date demande', key: 'date_demande', type: Date },
        {
          title: 'Statut',
          key: 'statut',
          formatter(statut) {
            return { [-1]: 'Refusé', 0: 'En attente', 1: 'Accepté' }[statut];
          },
        },
        { title: 'Justification', key: 'justification' },
      ],
    };
  },
  computed: {
    ...mapState({
      materiels: (state) =>
        state.mesInfos.travaux.map((t) => ({
          ...t,
          travail_type: state.travailType.liste.find(
            (e) => e.id == t.travail_type_id
          )?.designation,
        })),
    }),
  },
};
</script>

<style scoped></style>
