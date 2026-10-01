<script setup>
import { onMounted, ref } from "vue";
import QRCode from "qrcode";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

// `data.requiresStepUp` : exige le mot de passe avant de démarrer
// l'activation (tout enrôlement volontaire).
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

// password (step-up requis) -> loading -> qr -> recovery-codes
const step = ref(data?.requiresStepUp ? "password" : "loading");
const password = ref("");
const secret = ref("");
const qrCodeDataUrl = ref("");
const code = ref("");
const codeError = ref(null);
const recoveryCodes = ref([]);

const startEnrollment = async (stepUp = null) => {
  step.value = "loading";
  try {
    const enrollmentData = await authStore.enableTwoFactor(stepUp);
    secret.value = enrollmentData.secret;
    qrCodeDataUrl.value = await QRCode.toDataURL(enrollmentData.provisioningUri);
    step.value = "qr";
  } catch (e) {
    if (stepUp) {
      step.value = "password";
      codeError.value = e?.message || "Mot de passe incorrect";
    } else {
      codeError.value =
        e?.message || "Erreur lors de l'activation de l'application d'authentification";
    }
  }
};

onMounted(() => {
  if (!data?.requiresStepUp) {
    startEnrollment();
  }
});

const submitPassword = () => {
  codeError.value = null;
  return startEnrollment({ password: password.value });
};

const confirm = async () => {
  codeError.value = null;
  try {
    const confirmData = await authStore.confirmTwoFactor(code.value);
    // Absent si ce n'est pas le tout premier moyen 2FA du compte (WebAuthn
    // déjà actif, par ex.) : les codes ne sont émis qu'une fois, pas à
    // chaque méthode ajoutée — pas d'étape "codes de secours" dans ce cas.
    if (confirmData.recoveryCodes?.length) {
      recoveryCodes.value = confirmData.recoveryCodes;
      step.value = "recovery-codes";
    } else {
      finish();
    }
  } catch (e) {
    codeError.value = e?.message || "Code invalide";
  }
};

const onSubmit = () => {
  if (step.value === "password") {
    return submitPassword();
  }
  if (step.value === "qr") {
    return confirm();
  }
};

// closeModal() est une action Pinia synchrone (pas de Promise à chaîner).
const finish = () => {
  closeModal();
  callback(true);
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="modal-header">
      <h5 class="modal-title">Activer l'application d'authentification</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <template v-if="step === 'password'">
        <p class="text-body-secondary">
          Confirmez votre mot de passe pour ajouter cette méthode à votre compte.
        </p>
        <div class="mb-3">
          <label for="totp-enable-password">Mot de passe</label>
          <input
            id="totp-enable-password"
            v-model="password"
            type="password"
            autocomplete="off"
            required
            autofocus
            class="form-control form-control-sm"
            :class="{ 'is-invalid': codeError }"
          />
          <div v-if="codeError" class="invalid-feedback">{{ codeError }}</div>
        </div>
      </template>

      <div v-else-if="step === 'loading'" class="text-center py-3">Chargement…</div>

      <template v-else-if="step === 'qr'">
        <p>
          Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy,
          …), puis entrez le code généré pour confirmer.
        </p>
        <div class="text-center mb-3">
          <img
            :src="qrCodeDataUrl"
            alt="QR code d'activation"
            class="img-fluid mb-2"
            style="max-width: 220px"
          />
          <p class="text-body-secondary small mb-0">
            Impossible de scanner ? Entrez ce code manuellement : <code>{{ secret }}</code>
          </p>
        </div>
        <div class="mb-3">
          <label for="totp-enable-code">Code affiché par l'application</label>
          <input
            id="totp-enable-code"
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="123456"
            required
            autofocus
            class="form-control form-control-sm"
            :class="{ 'is-invalid': codeError }"
          />
          <div v-if="codeError" class="invalid-feedback">{{ codeError }}</div>
        </div>
      </template>

      <div v-else-if="step === 'recovery-codes'">
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
      <template v-if="step === 'password'">
        <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
        <button type="submit" class="btn btn-primary">Continuer</button>
      </template>
      <template v-else-if="step === 'qr'">
        <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
        <button type="submit" class="btn btn-primary">Confirmer</button>
      </template>
      <button
        v-else-if="step === 'recovery-codes'"
        type="button"
        class="btn btn-primary"
        @click="finish"
      >
        J'ai noté mes codes
      </button>
      <button v-else type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
    </div>
  </form>
</template>
