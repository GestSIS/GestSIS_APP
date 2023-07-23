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
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeFonction.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          id="nom"
          v-model="activeFonction.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          id="abreviation"
          v-model="activeFonction.abreviation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-cumulable-modal"
            v-model="activeFonction.cumulable"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-cumulable-modal"
            >Cumulable</label
          >
        </div>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-actif-modal"
            v-model="activeFonction.actif"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-actif-modal"
            >Actif</label
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
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeFonction: {
        cumulable: false,
        actif: true,
      },
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
    async save() {
      const action = this.activeFonction?.id ? 'updateFonction' : 'addFonction';
      this.$store
        .dispatch(action, this.activeFonction)
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
    },
  },
};
</script>

<style scoped></style>
