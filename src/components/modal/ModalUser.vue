<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ user.id ? 'Modifier' : 'Ajouter' }} Utilisateur
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-user-name">Nom</label>
        <input
          id="m-user-name"
          v-model="user.name"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['name'] }"
          name="name"
          required
          min="1"
        />
      </div>
      <div class="mb-3">
        <label for="m-user-email">Email</label>
        <input
          id="m-user-email"
          v-model="user.email"
          type="email"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['email'] }"
          name="m-user-email"
          required
        />
      </div>
      <div class="mb-3">
        <input
          id="user-admin"
          v-model="user.admin"
          name="user-admin"
          type="checkbox"
          class="form-check-input"
        />
        <label for="user-admin" class="ms-1">Admin</label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="save()">
        {{ user.id ? 'Modifier' : 'Ajouter' }}
      </button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalUser',
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
      user: {
        name: '',
        email: '',
        admin: false,
      },
    };
  },
  mounted() {
    this.user = {
      ...this.user,
      ...(this.data ?? {}),
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    close() {
      (this.callback(null) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    async save() {
      if (!this.user?.id) {
        return this.$awn.alert(
          "Impossible d'ajouter un utilisateur pour le moment",
        );
      }
      this.$store
        .dispatch(this.user?.id ? 'editUser' : 'addUser', this.user)
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = errors;
          this.$awn.alert(errors?.message ?? "Erreur lors de l'enregistrement");
        });
    },
  },
};
</script>

<style scoped></style>
