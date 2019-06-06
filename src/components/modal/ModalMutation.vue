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
          id="incorporation"
        />
      </div>
      <div class="form-group">
        <label for="cours-date">Sortie</label>
        <input
          type="date"
          v-model="activeMutation.sortie"
          class="form-control"
          id="cours-date"
        />
      </div>
      <div class="form-group">
        <label for="localite">Localite</label>
        <select
          id="localite"
          v-model="activeMutation.localite_id"
          class="form-control select"
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
        this.$store.dispatch('addMutation', this.activeMutation).then(() => {
          this.HIDE_MODAL()
        })
      } else {
        this.$store.dispatch('editMutation', this.activeMutation).then(() => {
          this.HIDE_MODAL()
        })
      }
    }
  }
}
</script>

<style scoped></style>
