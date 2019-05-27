<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une fonction</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="debut">Début</label>
        <input
          type="date"
          v-model="activeFonction.debut"
          class="form-control"
          id="debut"
        />
      </div>
      <div class="form-group">
        <label for="fin">Fin</label>
        <input
          type="date"
          v-model="activeFonction.fin"
          class="form-control"
          id="fin"
        />
      </div>
      <div class="form-group">
        <label for="fonction">Fonction</label>
        <select
          id="fonction"
          v-model="activeFonction.fonction_id"
          class="form-control select"
          :disabled="(activeFonction.id || 0) !== 0"
        >
          <option v-for="f in listFonctions" :key="f.id" :value="f.id">
            {{ f.nom }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="remarque">Remarque</label>
        <input
          type="text"
          v-model="activeFonction.remarque"
          class="form-control"
          id="remarque"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeFonction.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ModalCours',
  computed: {
    ...mapGetters([
      'activeSapeurId',
      'listFonctions',
      'getCours',
      'activeFonction'
    ])
  },
  mounted() {
    if (this.listFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions')
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeFonction.id || 0) === 0) {
        this.$store.dispatch('addFonction', this.activeFonction).then(() => {
          this.HIDE_MODAL()
        })
      } else {
        this.$store.dispatch('editFonction', this.activeFonction).then(() => {
          this.HIDE_MODAL()
        })
      }
    }
  }
}
</script>

<style scoped></style>
