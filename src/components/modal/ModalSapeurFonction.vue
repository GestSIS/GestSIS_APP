<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une fonction</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          type="date"
          v-model="activeFonction.debut"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
          id="debut"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Fin</label>
        <input
          type="date"
          v-model="activeFonction.fin"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
          id="fin"
        />
      </div>
      <div class="mb-3">
        <label for="fonction">Fonction</label>
        <select
          id="fonction"
          v-model="activeFonction.fonction_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['fonction_id'] }"
          :disabled="(activeFonction.id || 0) !== 0"
        >
          <option v-for="f in listeFonctions" :key="f.id" :value="f.id">
            {{ f.nom }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          type="text"
          v-model="activeFonction.remarque"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
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
import { mapGetters, mapMutations, mapState } from 'vuex';

//TODO: Empêcher fonctions à double

export default {
  name: 'ModalSapeurFonction',
  data() {
    return {
      errors: {},
    };
  },
  computed: {
    ...mapState({
      listeFonctions: (state) => state.fonction.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
    }),
    ...mapGetters(['activeFonction']),
  },
  mounted() {
    if (this.listeFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeFonction.id || 0) === 0) {
        this.$store
          .dispatch('addSapeurFonction', this.activeFonction)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editSapeurFonction', this.activeFonction)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      }
    },
  },
};
</script>

<style scoped></style>
