<script setup>
import { ref } from "vue";
import QRCode from "qrcode";
import { useAuthStore } from "../stores/auth/Auth";

// Étape de configuration 2FA obligatoire, partagée entre PageLogin (parcours
// forcé au login pour un compte déjà existant) et PageRegister (2FA requis
// dès la confirmation d'email pour un compte fraîchement créé) : dans les
// deux cas, `authStore.twoFactorSetupToken` est déjà posé par l'appelant
// avant le montage de ce composant. Offre le même choix TOTP/WebAuthn que le
// parcours volontaire (voir ModalChooseTwoFactorMethod), au lieu d'imposer
// TOTP par défaut.
const emit = defineEmits(["done", "cancel"]);

const authStore = useAuthStore();

// 'choose' -> 'totp-qr' | 'webauthn' -> 'recovery-codes'
const step = ref("choose");
const code = ref("");
const codeError = ref(null);
const provisioningUri = ref("");
const qrCodeDataUrl = ref("");
const secret = ref("");
const recoveryCodes = ref([]);

const webauthnName = ref("");
const webauthnError = ref(null);
const webauthnLoading = ref(false);

const chooseTotp = async () => {
  webauthnError.value = null;
  step.value = "totp-qr";
  const data = await authStore.enableTwoFactor();
  provisioningUri.value = data.provisioningUri;
  secret.value = data.secret;
  qrCodeDataUrl.value = await QRCode.toDataURL(data.provisioningUri);
};

const chooseWebauthn = () => {
  webauthnError.value = null;
  step.value = "webauthn";
};

const confirmTotp = async () => {
  codeError.value = null;
  try {
    const data = await authStore.confirmTwoFactor(code.value);
    recoveryCodes.value = data.recoveryCodes || [];
    step.value = "recovery-codes";
  } catch (err) {
    codeError.value = err?.message || "Code invalide";
  }
};

const registerWebauthn = async () => {
  webauthnError.value = null;
  webauthnLoading.value = true;
  try {
    const data = await authStore.registerWebauthnCredential(webauthnName.value);
    recoveryCodes.value = data.recoveryCodes || [];
    step.value = "recovery-codes";
  } catch (err) {
    // Échec (annulation, refus, timeout, erreur serveur) : retour au choix de
    // la méthode plutôt que de rester bloqué sur le formulaire WebAuthn, avec
    // le message affiché sur cet écran de choix.
    webauthnError.value = err?.message || "Échec de l'ajout de la clé";
    step.value = "choose";
  } finally {
    webauthnLoading.value = false;
  }
};

const cancel = () => {
  authStore.cancelTwoFactorChallenge();
  emit("cancel");
};
</script>

<template>
  <div class="text-center form-signin">
    <template v-if="step === 'choose'">
      <h1 class="h3 mb-3">Configuration du 2FA obligatoire</h1>
      <p class="text-body-secondary">
        Le 2FA est désormais obligatoire sur votre compte. Choisissez comment confirmer votre
        identité à la connexion, en plus de votre mot de passe.
      </p>
      <div v-if="webauthnError" class="alert alert-danger">{{ webauthnError }}</div>
      <button
        type="button"
        class="btn btn-outline-primary w-100 mb-2 text-start"
        @click="chooseTotp"
      >
        <strong>Application d'authentification</strong>
        <div class="small text-body-secondary">
          Google Authenticator, Authy, … — un code à 6 chiffres généré sur votre téléphone.
        </div>
      </button>
      <button
        type="button"
        class="btn btn-outline-primary w-100 mb-2 text-start"
        @click="chooseWebauthn"
      >
        <strong>Clé de sécurité ou biométrie</strong>
        <div class="small text-body-secondary">
          Clé USB, Touch ID, Windows Hello, ou une passkey de votre téléphone.
        </div>
      </button>
      <button type="button" class="btn btn-link" @click="cancel">Retour</button>
    </template>

    <template v-else-if="step === 'totp-qr'">
      <h1 class="h3 mb-3">Application d'authentification</h1>
      <p class="text-body-secondary">
        Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy,
        …), puis entrez le code généré pour terminer.
      </p>
      <img :src="qrCodeDataUrl" alt="QR code 2FA" class="img-fluid mb-2" />
      <p class="text-body-secondary small mb-3">
        Impossible de scanner ? Entrez ce code manuellement : <code>{{ secret }}</code>
      </p>
      <form @submit.prevent="confirmTotp">
        <label for="two-factor-setup-code" class="visually-hidden">Code</label>
        <input
          id="two-factor-setup-code"
          v-model="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          class="form-control form-control-sm mb-2"
          placeholder="Code à 6 chiffres"
          required
          autofocus
          :class="{ 'is-invalid': codeError }"
        />
        <div v-if="codeError" class="invalid-feedback d-block mb-2">{{ codeError }}</div>
        <button class="btn btn-lg btn-primary w-100 mb-2" type="submit">
          Activer et continuer
        </button>
      </form>
      <button type="button" class="btn btn-link" @click="step = 'choose'">Autre méthode</button>
      <button type="button" class="btn btn-link" @click="cancel">Retour</button>
    </template>

    <template v-else-if="step === 'webauthn'">
      <h1 class="h3 mb-3">Clé de sécurité</h1>
      <p class="text-body-secondary">
        Donnez un nom à cette clé, puis suivez les instructions de votre navigateur (clé USB, Touch
        ID, Windows Hello, …).
      </p>
      <form @submit.prevent="registerWebauthn">
        <label for="two-factor-setup-webauthn-name" class="visually-hidden">Nom de la clé</label>
        <input
          id="two-factor-setup-webauthn-name"
          v-model="webauthnName"
          type="text"
          class="form-control form-control-sm mb-2"
          placeholder="ex. YubiKey bleue"
          required
          autofocus
        />
        <button class="btn btn-lg btn-primary w-100 mb-2" type="submit" :disabled="webauthnLoading">
          {{ webauthnLoading ? "En attente du navigateur…" : "Activer et continuer" }}
        </button>
      </form>
      <button type="button" class="btn btn-link" @click="step = 'choose'">Autre méthode</button>
      <button type="button" class="btn btn-link" @click="cancel">Retour</button>
    </template>

    <template v-else-if="step === 'recovery-codes'">
      <h1 class="h3 mb-3">Codes de secours</h1>
      <p class="text-body-secondary">
        Notez ces codes dans un endroit sûr. Chacun ne peut être utilisé qu'une seule fois pour vous
        connecter si vous perdez l'accès à votre méthode de double authentification.
      </p>
      <ul class="list-unstyled font-monospace mb-3">
        <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode">{{ recoveryCode }}</li>
      </ul>
      <button class="btn btn-lg btn-primary w-100" type="button" @click="emit('done')">
        J'ai noté mes codes, continuer
      </button>
    </template>
  </div>
</template>
