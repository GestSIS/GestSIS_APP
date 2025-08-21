<script setup>
import { computed, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useStore } from 'vuex';

const d = new Date();
d.setMonth(d.getMonth() + 1);

const step = ref(1);
const errors = ref({});
const token = ref({
  description: '',
  validite: d.toISOString().substring(0, 10),
  email: '',
  roles: [],
  token: '',
});

const store = useStore();
const roles = computed(() => store.state.auth.roles);

const { closeModal } = useModalStore();

const copyToClipboard = (value) => {
  navigator.clipboard.writeText(value);
};
const save = () => {
  if (token.value.roles.length <= 0) {
    errors.value = { roles: 'Sélectionnez au minimum 1 rôle' };
  } else {
    delete errors.value.roles;
  }
  if (token.value.description === '') {
    errors.value = { description: 'Description invalide' };
  } else {
    delete errors.value.description;
  }
  if (new Date(token.value.validite) <= new Date()) {
    errors.value = { validite: 'Validité incorrecte' };
  } else {
    delete errors.value.validite;
  }
  if (Object.keys(errors.value).length > 0) {
    return;
  }

  store
    .dispatch('newRegisterToken', token.value)
    .then((res) => {
      errors.value = {};
      step.value = 2;
      token.value.token = res;
    })
    .catch((err) => {
      errors.value = err;
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Nouveau jeton d'inscription</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div v-if="step === 1" class="modal-body">
      <div class="mb-3">
        <label for="description">Description</label>
        <input
          id="description"
          v-model="token.description"
          required
          autofocus
          minlength="1"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        />
      </div>
      <div class="mb-3">
        <label for="validite">Validité</label>
        <input
          id="validite"
          v-model="token.validite"
          required
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
            type="button"
            class="btn btn-outline-secondary"
            title="Copier dans le press-papier"
            @click="copyToClipboard(token.token)"
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
      <button v-if="step === 1" type="submit" class="btn btn-primary">
        Créer
      </button>
    </div>
  </form>
</template>
