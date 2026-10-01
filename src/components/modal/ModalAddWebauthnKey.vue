<script setup>
import { ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

// `data.requiresStepUp` : exige le mot de passe (+ le code TOTP si
// `totpActive`) avant d'enregistrer cette clé (tout enrôlement volontaire).
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

const { closeModal, showModal } = useModalStore();
const authStore = useAuthStore();

const name = ref("");
const password = ref("");
const code = ref("");
const error = ref(null);
const busy = ref(false);

// 'form' -> 'recovery-codes' (uniquement si c'est le tout premier moyen 2FA
// du compte : les codes de secours sont alors émis, à afficher une seule
// fois — voir ModalEnableTotp pour l'équivalent TOTP).
const step = ref("form");
const recoveryCodes = ref([]);

const register = async () => {
  error.value = null;
  busy.value = true;
  try {
    const stepUp = data?.requiresStepUp
      ? { password: password.value, ...(data?.totpActive ? { code: code.value } : {}) }
      : null;
    const result = await authStore.registerWebauthnCredential(name.value, stepUp);
    if (result?.recoveryCodes?.length) {
      recoveryCodes.value = result.recoveryCodes;
      step.value = "recovery-codes";
    } else {
      closeModal();
      await callback(true);
    }
  } catch (e) {
    const message = e?.message || "Échec de l'ajout de la clé";
    if (data?.chooserData) {
      // Atteint via le choix de méthode (première activation) : y revenir
      // plutôt que de laisser l'utilisateur bloqué sur ce formulaire avec
      // pour seule option de fermer la fenêtre entièrement.
      showModal({
        component: "ModalChooseTwoFactorMethod",
        data: { ...data.chooserData, error: message },
        callback,
      });
    } else {
      error.value = message;
    }
  } finally {
    busy.value = false;
  }
};

// closeModal() est une action Pinia synchrone (pas de Promise à chaîner).
const finish = () => {
  closeModal();
  callback(true);
};
</script>

<template>
  <form v-if="step === 'form'" @submit.prevent="register">
    <div class="modal-header">
      <h5 class="modal-title">Ajouter une clé de sécurité</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <p class="text-body-secondary">
        Donnez un nom à cette clé, puis suivez les instructions de votre navigateur (clé USB, Touch
        ID, Windows Hello, …).
      </p>
      <div class="mb-3">
        <label for="webauthn-key-name">Nom de la clé</label>
        <input
          id="webauthn-key-name"
          v-model="name"
          type="text"
          required
          autofocus
          placeholder="ex. YubiKey bleue"
          class="form-control form-control-sm"
        />
      </div>
      <template v-if="data?.requiresStepUp">
        <div class="mb-3">
          <label for="webauthn-key-password">Mot de passe</label>
          <input
            id="webauthn-key-password"
            v-model="password"
            type="password"
            autocomplete="off"
            required
            class="form-control form-control-sm"
            :class="{ 'is-invalid': error }"
          />
        </div>
        <div v-if="data?.totpActive" class="mb-3">
          <label for="webauthn-key-code">Code de votre application d'authentification</label>
          <input
            id="webauthn-key-code"
            v-model="code"
            type="text"
            autocomplete="one-time-code"
            autocapitalize="off"
            placeholder="123456"
            required
            class="form-control form-control-sm"
            :class="{ 'is-invalid': error }"
          />
        </div>
      </template>
      <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
    </div>
    <div class="modal-footer">
      <button
        v-if="data?.chooserData"
        type="button"
        class="btn btn-link me-auto"
        @click="
          showModal({ component: 'ModalChooseTwoFactorMethod', data: data.chooserData, callback })
        "
      >
        Autre méthode
      </button>
      <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
      <button type="submit" class="btn btn-primary" :disabled="!name || busy">
        {{ busy ? "En attente du navigateur…" : "Continuer" }}
      </button>
    </div>
  </form>

  <div v-else-if="step === 'recovery-codes'">
    <div class="modal-header">
      <h5 class="modal-title">Codes de secours</h5>
    </div>
    <div class="modal-body">
      <p>
        Comme c'est votre premier moyen de double authentification, notez ces codes de secours dans
        un endroit sûr : ils ne seront plus jamais affichés, et chacun n'est utilisable qu'une seule
        fois si vous perdez l'accès à cette clé.
      </p>
      <ul class="list-unstyled font-monospace">
        <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode">{{ recoveryCode }}</li>
      </ul>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" @click="finish">J'ai noté mes codes</button>
    </div>
  </div>
</template>
