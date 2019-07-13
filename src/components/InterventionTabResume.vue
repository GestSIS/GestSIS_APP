<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Résumé</h3>
          <button @click.prevent="save" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <label for="m-int-resume">Description</label>
          <textarea
            id="m-int-resume"
            class="form-control"
            v-model="activeInterventionData.description"
            rows="30"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

const degre = [
  { id: 1, type: 'Fausse-alarme' },
  { id: 2, type: 'Petite' },
  { id: 3, type: 'Moyenne' },
  { id: 4, type: 'Grande' }
]

export default {
  name: 'InterventionTabResume',
  props: {
    newMode: {
      type: Boolean
    }
  },
  data() {
    return {
      errors: {},
      degre
    }
  },
  computed: {
    ...mapGetters(['activeInterventionId', 'activeInterventionData'])
  },
  methods: {
    save() {
      this.$store
        .dispatch('saveActiveIntervention', {
          id: this.activeInterventionData,
          description: this.activeInterventionData.description
        })
        .then(() => (this.errors = {}))
        .catch(errors => (this.errors = errors))
    }
  }
}
</script>

<style scoped></style>
