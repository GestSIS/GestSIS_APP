<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeFonction.id ? 'Modifier' : 'Ajouter' }} une fonction
      </h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeFonction.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="form-group">
        <label for="nom">Nom</label>
        <input
          type="text"
          v-model="activeFonction.nom"
          class="form-control"
          :class="{ 'is-invalid': errors['nom'] }"
          id="nom"
        />
      </div>
      <div class="form-group">
        <label for="abreviation">Abréviation</label>
        <input
          type="text"
          v-model="activeFonction.abreviation"
          class="form-control"
          :class="{ 'is-invalid': errors['abreviation'] }"
          id="abreviation"
        />
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="fonction-cumulable-modal"
            v-model="activeFonction.cumulable"
          />
          <label class="custom-control-label" for="fonction-cumulable-modal"
            >Cumulable</label
          >
        </div>
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
import { mapMutations } from 'vuex';

export default {
  name: 'ModalFonction',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeFonction: {},
    };
  },
  mounted() {
    this.activeFonction = {
      ...this.activeFonction,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      //Format back dates to SQL Format
      if ((this.activeFonction.id || 0) === 0) {
        this.$store
          .dispatch('addFonction', this.activeFonction)
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
          .dispatch('updateFonction', this.activeFonction)
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
