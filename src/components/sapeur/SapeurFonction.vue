<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button type="button" class="btn btn-primary" @click="newFonction">Ajouter une fonction</button>
    </div>
    <div class="card-body">
      <table id="sap-fonctions" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Début</th>
            <th>Fin</th>
            <th>Fonction</th>
            <th>Remarques</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="activeSapeurFonctions.length <= 0">
            <td colspan="5">Aucune fonction</td>
          </tr>
          <tr v-for="f in activeSapeurFonctions" :key="f.id">
            <td>{{ f.debut }}</td>
            <td>{{ f.fin }}</td>
            <td>{{ formatFonction(fonctions.find((e) => e.id == f.fonction_id)) }}</td>
            <td>{{ f.remarque }}</td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="editFonction(f.id)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerFonction(f.id)"
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

export default {
  name: 'SapeurFonction',
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurFonctions: (state) => state.sapeur.active.fonctions,
    }),
  },
  mounted() {
    if (this.fonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
    this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurFonctions', id);
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatFonction(fonction) {
      return fonction?.nom;
    },
    newFonction() {
      this.$store.dispatch('resetActiveFonction');
      this.SHOW_MODAL('ModalSapeurFonction');
    },
    editFonction(fonction_id) {
      this.$store.dispatch(
        'updateActiveFonction',
        Object.assign(
          {},
          this.activeSapeurFonctions.find((f) => f.id == fonction_id)
        )
      );
      this.SHOW_MODAL('ModalSapeurFonction');
    },
    supprimerFonction(fonction_id) {
      this.$store.dispatch('removeSapeurFonction', fonction_id);
    },
  },
};
</script>

<style scoped></style>
