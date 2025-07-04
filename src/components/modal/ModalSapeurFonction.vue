<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeFonction.id ? 'Modifier' : 'Ajouter' }} une fonction
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          id="debut"
          v-model="activeFonction.debut"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Fin</label>
        <input
          id="fin"
          v-model="activeFonction.fin"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
      </div>
      <base-select
        v-model="activeFonction.fonction_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['fonction_id'] }"
        label="Fonction"
        display-key="nom"
        :options="listeFonctions"
      />
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="activeFonction.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
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
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

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
      listeFonctions: (state) => state.fonction.liste.filter((f) => f.actif),
      activeSapeurId: (state) => state.sapeur.active.id,
      activeFonction: (state) => state.fonction.currentFonction,
    }),
  },
  mounted() {
    if (this.listeFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
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
