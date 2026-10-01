<script setup>
import { ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

const { callback } = defineProps({
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
    await authStore.disableTwoFactor(password.value, code.value);
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
      <h5 class="modal-title">Désactiver l'application d'authentification</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <p class="text-body-secondary">
        Confirmez votre mot de passe et un code (ou un code de secours) pour désactiver
        l'application d'authentification.
      </p>
      <div class="mb-3">
        <label for="disable-totp-password">Mot de passe</label>
        <input
          id="disable-totp-password"
          v-model="password"
          type="password"
          autocomplete="off"
          required
          autofocus
          class="form-control form-control-sm"
        />
      </div>
      <div class="mb-3">
        <label for="disable-totp-code">Code de votre application d'authentification</label>
        <input
          id="disable-totp-code"
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
      <button type="submit" class="btn btn-danger" :disabled="busy">Désactiver</button>
    </div>
  </form>
</template>
