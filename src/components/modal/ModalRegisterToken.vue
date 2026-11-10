<script setup>
import { computed, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { toLocalIsoDate } from "../../tools/index.js";
import { useSubmit } from "../../composables/useSubmit.js";
import { useClipboard } from "../../composables/useClipboard.js";

const { copy } = useClipboard();

const authStore = useAuthStore();

const d = new Date();
d.setMonth(d.getMonth() + 1);

const step = ref(1);
const { errors, isSubmitting, submit } = useSubmit();
const token = ref({
  description: "",
  validite: toLocalIsoDate(d),
  email: "",
  roles: [],
  token: "",
});

const roles = computed(() => authStore.roles);

const { closeModal } = useModalStore();

const copyToClipboard = (value) => copy(value, "Jeton copié dans le presse-papiers");
const save = async () => {
  if (token.value.roles.length <= 0) {
    errors.value = { roles: "Sélectionnez au minimum 1 rôle" };
  } else {
    delete errors.value.roles;
  }
  if (token.value.description === "") {
    errors.value = { description: "Description invalide" };
  } else {
    delete errors.value.description;
  }
  if (new Date(token.value.validite) <= new Date()) {
    errors.value = { validite: "Validité incorrecte" };
  } else {
    delete errors.value.validite;
  }
  if (Object.keys(errors.value).length > 0) {
    return;
  }

  const { ok, data } = await submit(() => authStore.newRegisterToken(token.value));
  if (ok) {
    step.value = 2;
    token.value.token = data;
  }
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
        <label>Rôles</label>
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
          {{ errors["roles"] }}
        </div>
      </div>
    </div>
    <div v-if="step === 2" class="modal-body">
      <p>
        Votre token a été généré avec succès, vous pouvez le transmettre à votre contact qui pourra
        alors l'utiliser lors de la création d'un nouveau compte.
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
        {{ step == 1 ? "Annuler" : "Fermer" }}
      </button>
      <button :disabled="isSubmitting" v-if="step === 1" type="submit" class="btn btn-primary">
        Créer
      </button>
    </div>
  </form>
</template>
