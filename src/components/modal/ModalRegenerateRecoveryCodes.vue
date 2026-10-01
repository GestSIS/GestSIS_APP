<script setup>
import { ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

// `data.totpActive` : le TOTP est la méthode active — exige aussi son code
// (comme pour l'ajout d'une méthode supplémentaire, voir
// ModalAddWebauthnKey). Un compte WebAuthn-only n'a que le mot de passe à
// confirmer.
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

const step = ref("form"); // form | codes
const password = ref("");
const code = ref("");
const error = ref(null);
const recoveryCodes = ref([]);

const submit = async () => {
  error.value = null;
  try {
    const result = await authStore.regenerateTwoFactorRecoveryCodes(
      password.value,
      data?.totpActive ? code.value : null,
    );
    recoveryCodes.value = result.recoveryCodes || [];
    step.value = "codes";
  } catch (e) {
    error.value = e?.message || "Mot de passe ou code incorrect";
  }
};

// closeModal() est une action Pinia synchrone (pas de Promise à chaîner).
const finish = () => {
  closeModal();
  callback(true);
};
</script>

<template>
  <form @submit.prevent="submit">
    <div class="modal-header">
      <h5 class="modal-title">Régénérer les codes de secours</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <template v-if="step === 'form'">
        <p class="text-body-secondary">
          Confirmez votre mot de passe
          <template v-if="data?.totpActive"
            >et un code de votre application d'authentification</template
          >
          pour régénérer vos codes de secours (les précédents seront invalidés).
        </p>
        <div class="mb-3">
          <label for="regen-password">Mot de passe</label>
          <input
            id="regen-password"
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
          <label for="regen-code">Code de votre application d'authentification</label>
          <input
            id="regen-code"
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
            Le code à 6 chiffres actuellement affiché dans votre application, ou l'un de vos codes
            de secours.
          </div>
          <div v-if="error" class="invalid-feedback">{{ error }}</div>
        </div>
      </template>

      <div v-else-if="step === 'codes'">
        <p>
          Notez ces codes de secours dans un endroit sûr : ils ne seront plus jamais affichés, et
          chacun n'est utilisable qu'une seule fois si vous perdez l'accès à votre application
          d'authentification.
        </p>
        <ul class="list-unstyled font-monospace">
          <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode">{{ recoveryCode }}</li>
        </ul>
      </div>
    </div>
    <div class="modal-footer">
      <template v-if="step === 'form'">
        <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
        <button type="submit" class="btn btn-primary">Régénérer</button>
      </template>
      <button v-else type="button" class="btn btn-primary" @click="finish">
        J'ai noté mes codes
      </button>
    </div>
  </form>
</template>
