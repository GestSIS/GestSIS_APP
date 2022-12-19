<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Références professionnelles</h3>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary"
        @click.prevent="saveSapeurRefPro"
      >
        Enregistrer
      </button>
    </div>
    <form role="form">
      <div class="card-body">
        <div class="mb-3">
          <label for="m-sap-profession">Profession</label>
          <input
            id="m-sap-profession"
            v-model="activeSapeur.profession"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            name="profession"
          />
        </div>
        <div class="mb-3">
          <label for="m-sap-employeur">Employeur</label>
          <input
            id="m-sap-employeur"
            v-model="activeSapeur.employeur"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            name="employeur"
          />
        </div>
        <div class="mb-3">
          <label for="m-sap-lieu-travail">Lieu de travail</label>
          <input
            id="m-sap-lieu-travail"
            v-model="activeSapeur.lieu_de_travail"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            name="lieu_travail"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MesDonneesPerso',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeSapeur: { ...this.modelValue },
      hasEditPermission: false,
      errors: {},
    };
  },
  computed: {
    ...mapState({
      localites: (state) => state.localite.liste,
      civilites: (state) => state.baseData.civilites,
    }),
  },
};
</script>

<style scoped></style>
