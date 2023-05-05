<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Ma fiche de travail</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        class="table-striped"
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
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadMesTravaux = store.dispatch('fetchMesTravaux');
  const loadTravailTypes = store.dispatch('fetchTravailTypes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([loadMesTravaux, loadTravailTypes, loadUnites]).then(() => {
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
        {
          title: 'Statut',
          key: 'statut',
          formatter(statut) {
            return {
              [-1]: 'Refusé',
              0: 'En attente',
              1: 'Accepté',
              2: 'Imputé',
            }[statut];
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
          auteur: state.sapeur.liste.find((s) => s.id == t.auteur_id)
            ?.nom_prenom,
          unite: state.unite.liste.find(
            (u) =>
              u.id ==
              state.travailType.liste.find((e) => e.id == t.travail_type_id)
                ?.type_unite_id
          )?.unite,
        })),
    }),
  },
};
</script>

<style scoped></style>
