<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Nouveau jeton d'inscription</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body" v-if="step === 1">
      <div class="mb-3">
        <label for="desc">Description</label>
        <input
          type="text"
          v-model="token.description"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
          id="desc"
          ref="desc"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Validité</label>
        <input
          type="date"
          v-model="token.validite"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Rôles</label>
        <div class="form-check" v-for="role in roles" :key="role.id">
          <input
            type="checkbox"
            class="form-check-input"
            :value="role.id"
            v-model="token.roles"
            :id="'r' + role.id"
          />
          <label class="form-check-label" :for="'r' + role.id">
            {{
            role.nom
            }}
          </label>
        </div>
        <div class="invalid-feedback" :class="{ 'd-block': errors['roles'] }">{{ errors['roles'] }}</div>
      </div>
    </div>
    <div class="modal-body" v-if="step === 2">
      <p>
        Votre token a été généré avec succès, vous pouvez le transmettre à votre
        contact qui pourra alors l'utiliser lors de la création d'un nouveau
        compte.
      </p>
      <p>Ce compte aura dès lors accès au rôles précédemment défini.</p>
      <div class="mb-3">
        <div class="input-group input-group-sm mb-3">
          <input
            type="text"
            class="form-control form-control-sm"
            readonly
            id="desc"
            v-model="token.token"
            ref="displayedToken"
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
      <button
        type="button"
        class="btn btn-secondary"
        @click="HIDE_MODAL()"
      >{{ step == 1 ? 'Annuler' : 'Fermer' }}</button>
      <button type="button" class="btn btn-primary" @click="save()" v-if="step === 1">Créer</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

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
  mounted() {
    var d = new Date();
    d.setMonth(d.getMonth() + 1);
    this.token.validite = d.toISOString().substring(0, 10);
    this.$refs.desc.focus();
  },
  computed: {
    ...mapState({
      roles: (state) => state.auth.roles,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
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
          // this.HIDE_MODAL();
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

<style scoped></style>
