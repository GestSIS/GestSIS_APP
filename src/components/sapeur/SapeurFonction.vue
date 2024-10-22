<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary"
        @click="newFonction"
      >
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="activeSapeurFonctions"
        no-data="Aucune fonction"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerFonction(rowData)"
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
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadSapeurFonctions = store.dispatch('fetchSapeurFonctions');

  Promise.all([loadFonctions, loadSapeurFonctions]).then(() => {
    next();
  });
}

export default {
  name: 'SapeurFonction',
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
        { title: 'Remarques', key: 'remarque' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurFonctions: (state) =>
        state.sapeur.active.fonctions
          .sort((a, b) => b.debut.localeCompare(a.debut))
          .map((f) => ({
            ...f,
            fonction: state.fonction.liste.find(
              (fonction) => fonction.id == f.fonction_id
            )?.nom,
          })),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurFonctions', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchFonctions');
    this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newFonction() {
      this.$store.dispatch('resetActiveFonction');
      this.SHOW_MODAL('ModalSapeurFonction');
    },
    editFonction(fonction) {
      this.$store.dispatch('updateActiveFonction', Object.assign({}, fonction));
      this.SHOW_MODAL('ModalSapeurFonction');
    },
    supprimerFonction(fonction) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette fonction ?',
          question:
            "Attention, la suppression d'une fonction est irréversible ! Toutes les données de cette fonction seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeSapeurFonction', fonction?.id);
          }
        },
      });
    },
  },
};
</script>

<style scoped></style>
