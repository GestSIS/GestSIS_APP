<script setup>
import { ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

// `data.credential` : la clé à supprimer. `data.totpActive` : exige aussi un
// code de votre application d'authentification en plus du mot de passe (même
// logique que pour l'ajout d'un moyen supplémentaire, voir ModalAddWebauthnKey).
const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const { closeModal } = useModalStore();
const authStore = useAuthStore();

const password = ref("");
const code = ref("");
const error = ref(null);
const busy = ref(false);

const submit = async () => {
  error.value = null;
  busy.value = true;
  try {
    await authStore.deleteWebauthnCredential(
      data.credential.id,
      password.value,
      data?.totpActive ? code.value : null,
    );
    closeModal();
    await callback(true);
  } catch (e) {
    error.value = e?.message || "Mot de passe ou code incorrect";
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="submit">
    <div class="modal-header">
      <h5 class="modal-title">Supprimer la clé « {{ data?.credential?.name }} »</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <p class="text-body-secondary">
        Attention, l'action est irréversible. Confirmez votre mot de passe
        <template v-if="data?.totpActive"
          >et un code de votre application d'authentification</template
        >
        pour supprimer cette clé de sécurité.
      </p>
      <div class="mb-3">
        <label for="delete-webauthn-password">Mot de passe</label>
        <input
          id="delete-webauthn-password"
          v-model="password"
          type="password"
          autocomplete="off"
          required
          autofocus
          class="form-control form-control-sm"
          :class="{ 'is-invalid': error }"
        />
        <div v-if="error && !data?.totpActive" class="invalid-feedback">{{ error }}</div>
      </div>
      <div v-if="data?.totpActive" class="mb-3">
        <label for="delete-webauthn-code">Code de votre application d'authentification</label>
        <input
          id="delete-webauthn-code"
          v-model="code"
          type="text"
          autocomplete="one-time-code"
          autocapitalize="off"
          placeholder="123456"
          required
          class="form-control form-control-sm"
          :class="{ 'is-invalid': error }"
        />
        <div class="form-text">
          Le code à 6 chiffres actuellement affiché dans votre application, ou l'un de vos codes de
          secours.
        </div>
        <div v-if="error" class="invalid-feedback">{{ error }}</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
      <button type="submit" class="btn btn-danger" :disabled="busy">Supprimer</button>
    </div>
  </form>
</template>
