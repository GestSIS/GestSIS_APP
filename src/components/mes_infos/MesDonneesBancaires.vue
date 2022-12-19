<template>
  <div class="card card-primary card-outline mb-3">
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
          :disabled="!hasEditPermission"
        />
      </div>
    </div>
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
