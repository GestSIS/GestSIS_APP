<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Ajouter un contact à la liste <em>{{ data?.designation }}</em>
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-sis-email">Email</label>
        <input
          id="m-sis-email"
          v-model="contact.email"
          type="email"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['email'] }"
          name="email"
          required
        />
        <div v-if="errors['email']" class="invalid-feedback">
          {{ errors['email'] }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="save()">
        {{ contact.id ? 'Modifier' : 'Ajouter' }}
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
      contact: {
        email: '',
      },
    };
  },
  mounted() {},
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
      this.contact.email = this.contact.email?.toLowerCase()?.trim();
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!this.contact.email || !this.contact.email.match(validRegex)) {
        this.errors['email'] = 'Email invalide !';
        return;
      }

      this.$store
        .dispatch('addSisContact', { ...this.contact, liste: this.data.id })
        .then(() => {
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = errors;
          this.$awn.alert(
            errors?.message ?? "Erreur lors de l'ajout du contact"
          );
        });
    },
  },
};
</script>

<style scoped></style>
