<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Informations bancaires</h3>
          <button @click.prevent="save" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <!-- /.card-header -->
        <div class="card-body">
          <!-- IBAN -->
          <div class="mb-3">
            <label for="f-sap-nom">IBAN</label>
            <input
              type="text"
              class="form-control"
              id="f-sap-nom"
              name="nom"
              v-model="activeSapeur.iban"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'SapeurBanque',
  computed: {
    ...mapGetters(['activeSapeur', 'activeSapeurId']),
  },
  methods: {
    save() {
      this.$store
        .dispatch('saveActiveSapeur', {
          iban: this.activeSapeur.iban,
        })
        .then(() => {
          this.$notify({
            group: 'succes',
            title: 'Modification enregistrée',
          });
        })
        .catch(() => {
          this.$notify({
            group: 'erreur',
            title: 'Erreur lors la sauvegarde',
            text: 'Vérifier que les dates sont valides',
          });
        });
    },
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeur', id);
    },
  },
};
</script>

<style scoped></style>
