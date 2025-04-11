<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Ma fiche de travail</h3>
      <button
        v-if="hasSaisiePermission"
        type="button"
        class="btn btn-primary"
        @click="addTravail"
      >
        Saisir une fiche de travail
      </button>
    </div>
    <div class="card-body table-responsive p-0">
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
import { mapMutations, mapState } from 'vuex';
import store from '/src/store/index';
import permissions from '../../store/permissions';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

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
      hasSaisiePermission: (state) =>
        state.auth.admin ||
        [
          permissions.FICHE_TRAVAIL.SAISIE_PERSO,
          permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
        ].some((p) => state.auth.sis.permissions.includes(p)),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    addTravail() {
      this.SHOW_MODAL({
        component: 'ModalTravail',
        callback: () => {
          this.$store.dispatch('fetchMesTravaux');
        },
      });
    },
  },
};
</script>

<style scoped></style>
