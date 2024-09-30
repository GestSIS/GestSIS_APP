<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Cours</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary"
        @click="newCours"
      >
        Ajouter un cours
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="activeSapeurCours"
        no-data="Aucun cours suivi"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editCours(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerCours(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

import store from '/src/store/index';
async function loadData(routeTo, next) {
  const loadCours = store.dispatch('fetchCours');
  const loadSapeurCours = store.dispatch('fetchSapeurCours');

  Promise.all([loadCours, loadSapeurCours]).then(() => {
    next();
  });
}

export default {
  name: 'SapeurCours',
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
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurCours: (state) =>
        state.sapeur.active.cours
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((c) => ({
            ...c,
            designation: state.cours.liste.find(
              (cours) => cours.id == c.cours_id
            )?.designation,
            localite: state.localite.liste.find((l) => l.id == c.localite_id)
              ?.designation,
          })),
      activeSapeurId: (state) => state.sapeur.active.id,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchCours');
    this.$store.dispatch('fetchSapeurCours', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newCours() {
      this.$store.dispatch('resetActiveCours');
      this.SHOW_MODAL('ModalSapeurCours');
    },
    editCours(cours) {
      this.$store.dispatch(
        'updateActiveCours',
        Object.assign({ precedent_id: 0 }, cours)
      );
      this.SHOW_MODAL('ModalSapeurCours');
    },
    supprimerCours(cours) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce cours ?',
          question:
            "Attention, la suppression d'un cours est irréversible ! Toutes les données de ce cours seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeSapeurCours', cours?.id);
          }
        },
      });
    },
  },
};
</script>

<style scoped></style>
