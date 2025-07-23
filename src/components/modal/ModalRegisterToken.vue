<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Nouveau jeton d'inscription</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div v-if="step === 1" class="modal-body">
      <div class="mb-3">
        <label for="desc">Description</label>
        <input
          id="desc"
          ref="desc"
          v-model="token.description"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Validité</label>
        <input
          id="designation"
          v-model="token.validite"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Rôles</label>
        <div v-for="role in roles" :key="role.id" class="form-check">
          <input
            :id="'r' + role.id"
            v-model="token.roles"
            type="checkbox"
            class="form-check-input"
            :value="role.id"
          />
          <label class="form-check-label" :for="'r' + role.id">
            {{ role.nom }}
          </label>
        </div>
        <div class="invalid-feedback" :class="{ 'd-block': errors['roles'] }">
          {{ errors['roles'] }}
        </div>
      </div>
    </div>
    <div v-if="step === 2" class="modal-body">
      <p>
        Votre token a été généré avec succès, vous pouvez le transmettre à votre
        contact qui pourra alors l'utiliser lors de la création d'un nouveau
        compte.
      </p>
      <p>Ce compte aura dès lors accès au rôles précédemment défini.</p>
      <div class="mb-3">
        <div class="input-group input-group-sm mb-3">
          <input
            id="desc"
            ref="displayedToken"
            v-model="token.token"
            type="text"
            class="form-control form-control-sm"
            readonly
          />
          <button
            class="btn btn-outline-secondary"
            title="Copier dans le press-papier"
            @click="copyToClipboard"
          >
            <font-awesome-icon :icon="['fas', 'copy']" />
          </button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        {{ step == 1 ? 'Annuler' : 'Fermer' }}
      </button>
      <button
        v-if="step === 1"
        type="button"
        class="btn btn-primary"
        @click="save()"
      >
        Créer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalRegisterToken',
  data() {
    return {
      step: 1,
      errors: {},
      token: {
        description: '',
        validite: null,
        email: '',
        roles: [],
        token: '',
      },
    };
  },
  computed: {
    ...mapState({
      roles: (state) => state.auth.roles,
    }),
  },
  mounted() {
    var d = new Date();
    d.setMonth(d.getMonth() + 1);
    this.token.validite = d.toISOString().substring(0, 10);
    this.$refs.desc.focus();
  },
  methods: {
    ...mapActions(useModalStore, { closeModal: 'closeModal' }),
    copyToClipboard() {
      const copyText = this.$refs.displayedToken;

      copyText.select();
      copyText.setSelectionRange(0, 99999); /* For mobile devices */

      document.execCommand('copy');
    },
    async save() {
      if (this.token.roles.length <= 0) {
        this.errors = { roles: 'Sélectionnez au minimum 1 rôle' };
      } else {
        delete this.errors.roles;
      }
      if (this.token.description === '') {
        this.errors = { description: 'Description invalide' };
      } else {
        delete this.errors.description;
      }
      if (new Date(this.token.validite) <= new Date()) {
        this.errors = { validite: 'Validité incorrecte' };
      } else {
        delete this.errors.validite;
      }
      if (Object.keys(this.errors).length > 0) {
        return;
      }

      this.$store
        .dispatch('newRegisterToken', this.token)
        .then((token) => {
          this.errors = {};
          this.step = 2;
          this.token.token = token;
          // this.closeModal();
        })
        .catch((errors) => {
          this.errors = {
            ...errors,
          };
        });
    },
  },
};
</script>
