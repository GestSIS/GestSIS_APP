<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeTelephone.id ? 'Modifier' : 'Ajouter' }} un téléphone
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeTelephone.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          type="text"
          v-model="activeTelephone.nom"
          class="form-control"
          :class="{ 'is-invalid': errors['nom'] }"
          id="nom"
        />
      </div>
      <div class="mb-3">
        <label for="numero">Numéro</label>
        <input
          type="text"
          v-model="activeTelephone.numero"
          class="form-control"
          :class="{ 'is-invalid': errors['numero'] }"
          id="numero"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeTelephone.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalTelephone',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeTelephone: {},
    };
  },
  mounted() {
    this.activeTelephone = {
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeTelephone.id || 0) === 0) {
        this.$store
          .dispatch('addTelephone', this.activeTelephone)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
              })
          );
      } else {
        this.$store
          .dispatch('updateTelephone', this.activeTelephone)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => {
            this.errors = {
              ...errors,
            };
          });
      }
    },
  },
};
</script>

<style scoped></style>
