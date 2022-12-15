<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Modifier Sis</h5>
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
        />
      </div>
      <div class="mb-3">
        <label for="m-sis-description">Description</label>
        <input
          id="m-sis-description"
          v-model="sis.description"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
          name="m-sis-description"
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
      <button class="btn btn-primary" @click="save()">Modifier</button>
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
        description: '',
        mobile: false,
      },
    };
  },
  mounted() {
    this.sis = {
      ...this.data,
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
        .dispatch('editSis', this.sis)
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = errors;
        });
    },
  },
};
</script>

<style scoped></style>
