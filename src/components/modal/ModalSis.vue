<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ sis.id ? 'Modifier' : 'Ajouter' }} Sis
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-sis-nom">Nom</label>
        <input
          id="m-sis-nom"
          v-model="sis.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
          name="nom"
          required
        />
      </div>
      <div class="mb-3">
        <label for="m-sis-abreviation">Abréviation</label>
        <input
          id="m-sis-abreviation"
          v-model="sis.abreviation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
          name="m-sis-abreviation"
          required
        />
      </div>
      <div class="mb-3">
        <label for="m-sis-api_key">API KEY</label>
        <input
          id="m-sis-api_key"
          v-model="sis.api_key"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['api_key'] }"
          name="m-sis-api_key"
          required
          :readonly="sis?.id"
          :disabled="sis?.id"
        />
      </div>
      <div class="mb-3">
        <input
          id="sis-mobile"
          v-model="sis.mobile"
          name="sis-mobile"
          type="checkbox"
          class="form-check-input"
        />
        <label for="sis-mobile" class="ms-1">Mobile</label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="save()">
        {{ sis.id ? 'Modifier' : 'Ajouter' }}
      </button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalSis',
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    callback: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      sis: {
        nom: '',
        abreviation: '',
        mobile: false,
        api_key: '',
      },
    };
  },
  mounted() {
    this.sis = {
      ...this.sis,
      ...(this.data ?? {}),
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    close() {
      (this.callback(null) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    async save() {
      this.$store
        .dispatch(this.sis?.id ? 'editSis' : 'addSis', this.sis)
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = errors;
          this.$awn.alert(errors?.message ?? "Erreur lors de l'ajout du SIS");
        });
    },
  },
};
</script>

<style scoped></style>
