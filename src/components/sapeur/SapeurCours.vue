<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
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
      <table id="sap-cours" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th data-field="date">Date</th>
            <th data-field="designation">Désignation</th>
            <th data-field="lieu">Lieu</th>
            <th class="text-center" data-field="duree">Durée [jours]</th>
            <th v-if="hasEditPermission" class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="activeSapeurCours.length <= 0">
            <td :colspan="hasEditPermission ? 5 : 4">Aucun cours suivi</td>
          </tr>
          <tr v-for="c in activeSapeurCours" :key="c.id">
            <td>{{ c.date }}</td>
            <td>
              {{ cours.find((cours) => cours.id == c.cours_id).designation }}
            </td>
            <td>
              {{ localites.find((l) => l.id == c.localite_id).designation }}
            </td>
            <td class="text-center">{{ c.duree }}</td>
            <td v-if="hasEditPermission" class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="editCours(c.id)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerCours(c.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'SapeurCours',
  computed: {
    ...mapState({
      activeSapeurCours: (state) =>
        state.sapeur.active.cours.sort((a, b) => b.date.localeCompare(a.date)),
      activeSapeurId: (state) => state.sapeur.active.id,
      cours: (state) => state.cours.liste,
      localites: (state) => state.localite.liste,
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
    if (this.cours.length === 0) {
      this.$store.dispatch('fetchCours');
    }
    this.$store.dispatch('fetchSapeurCours', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newCours() {
      this.$store.dispatch('resetActiveCours');
      this.SHOW_MODAL('ModalSapeurCours');
    },
    editCours(cours_id) {
      this.$store.dispatch(
        'updateActiveCours',
        Object.assign(
          { precedent_id: 0 },
          this.activeSapeurCours.find((c) => c.id == cours_id)
        )
      );
      this.SHOW_MODAL('ModalSapeurCours');
    },
    supprimerCours(fonction_id) {
      this.$store.dispatch('removeSapeurCours', fonction_id);
    },
  },
};
</script>

<style scoped></style>
