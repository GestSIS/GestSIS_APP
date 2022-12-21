<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Résumé</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="save"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <label for="m-int-resume">Description</label>
          <textarea
            id="m-int-resume"
            v-model="activeInterventionData.description"
            :readonly="!hasEditPermission"
            class="form-control form-control-sm"
            rows="30"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

const degre = [
  { id: 1, type: 'Fausse-alarme' },
  { id: 2, type: 'Petite' },
  { id: 3, type: 'Moyenne' },
  { id: 4, type: 'Grande' },
];

export default {
  name: 'InterventionTabResume',
  props: {
    newMode: {
      type: Boolean,
    },
  },
  data() {
    return {
      errors: {},
      degre,
    };
  },
  computed: {
    ...mapState({
      activeInterventionId: (state) => state.intervention.active.id,
      activeInterventionData: (state) => state.intervention.active.data,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
  },
  methods: {
    async save() {
      this.$store
        .dispatch('saveActiveIntervention', {
          id: this.activeInterventionData.id,
          description: this.activeInterventionData.description,
        })
        .then((res) => {
          this.errors = {};
          this.$awn.success(res?.message || 'Modifications enregistrées');
        })
        .catch((err) => {
          this.errors = err;
          this.$awn.alert(err?.message || "Erreur lors de l'enregistrement");
        });
    },
  },
};
</script>

<style scoped></style>
