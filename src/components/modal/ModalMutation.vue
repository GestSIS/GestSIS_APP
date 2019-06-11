<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une promotion</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="cours-date">Incorporation</label>
        <input
          type="date"
          v-model="activeMutation.incorporation"
          class="form-control"
          :class="{ 'is-invalid': errors['incorporation'] }"
          id="incorporation"
        />
      </div>
      <div class="form-group">
        <label for="cours-date">Sortie</label>
        <input
          type="date"
          v-model="activeMutation.sortie"
          class="form-control"
          :class="{ 'is-invalid': errors['sortie'] }"
          id="cours-date"
        />
      </div>
      <div class="form-group">
        <label for="localite">Localite</label>
        <select
          id="localite"
          v-model="activeMutation.localite_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['localite_id'] }"
        >
          <option v-for="l in listLocalites" :key="l.id" :value="l.id">{{
            l.designation
          }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="motif">Motif</label>
        <input
          type="text"
          v-model="activeMutation.motif"
          class="form-control"
          :class="{ 'is-invalid': errors['motif'] }"
          id="motif"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeMutation.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ModalMutation',
  data() {
    return {
      errors: {}
    }
  },
  computed: {
    ...mapGetters(['activeSapeurId', 'listLocalites', 'activeMutation'])
  },
  mounted() {
    if (this.listLocalites.length === 0) {
      this.$store.dispatch('fetchLocalites')
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeMutation.id || 0) === 0) {
        this.$store
          .dispatch('addMutation', this.activeMutation)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      } else {
        this.$store
          .dispatch('editMutation', this.activeMutation)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      }
    }
  }
}
</script>

<style scoped></style>
