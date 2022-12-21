<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Informations bancaires</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="save"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="f-sap-nom">IBAN</label>
            <input
              id="f-sap-nom"
              v-model="activeSapeur.iban"
              type="text"
              class="form-control form-control-sm"
              name="nom"
              :readonly="!hasEditPermission"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'SapeurBanque',
  computed: {
    ...mapState({
      activeSapeur: (state) => state.sapeur.active.data,
      activeSapeurId: (state) => state.sapeur.active.id,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeur', id);
    },
  },
  methods: {
    async save() {
      this.$store
        .dispatch('saveActiveSapeur', {
          iban: this.activeSapeur.iban,
        })
        .then(() => {
          this.$awn.success('Modification enregistrée');
        })
        .catch((err) => {
          this.$awn.alert(err?.message ?? 'Erreur lors la sauvegarde');
        });
    },
  },
};
</script>

<style scoped></style>
