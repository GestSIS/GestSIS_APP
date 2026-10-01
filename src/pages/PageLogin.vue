<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth";
import TwoFactorForcedSetup from "../components/TwoFactorForcedSetup.vue";

const email = ref(null);
const password = ref(null);
const rememberMe = ref(true);
const errors = ref(null);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 'credentials' -> 'challenge' (2FA déjà activé) ou 'setup-qr' -> 'setup-recovery-codes'
// (2FA obligatoire, pas encore configuré).
const step = ref("credentials");
const code = ref("");
const codeError = ref(null);

// null tant que l'utilisateur n'a pas choisi (affiche le sélecteur), sinon
// 'totp' | 'webauthn'. Fixé directement si une seule méthode est disponible.
const twoFactorMethod = ref(null);
const webauthnError = ref(null);
const webauthnLoading = ref(false);

const goToDestination = () => router.push(route.query.redirect ? route.query.redirect : "accueil");

const login = async () => {
  if (
    email.value?.trim()?.toLowerCase()?.endsWith("@gestsis.ch") &&
    email.value?.trim()?.toLowerCase() !== "admin@gestsis.ch" &&
    email.value?.trim()?.toLowerCase() !== "demo@gestsis.ch"
  ) {
    errors.value = {
      email: "Email invalid",
    };
    return;
  }

  authStore
    .login({
      email: email.value?.trim(),
      password: password.value,
      rememberMe: rememberMe.value,
    })
    .then(async (result) => {
      errors.value = null;
      if (result?.requiresTwoFactor) {
        step.value = "challenge";
        const methods = authStore.twoFactorAvailableMethods;
        if (methods.length === 1 && methods[0] === "webauthn") {
          await useWebauthnLogin();
        } else {
          twoFactorMethod.value = methods.length === 1 ? methods[0] : null;
        }
        return;
      }
      if (result?.requiresTwoFactorSetup) {
        step.value = "setup";
        return;
      }
      goToDestination();
    })
    .catch((err) => {
      if (err?.requiresEmailConfirmation) {
        router.push({ name: "register", query: { confirm: email.value?.trim() } });
        return;
      }
      errors.value = err;
    });
};

const verifyChallenge = async () => {
  codeError.value = null;
  try {
    await authStore.verifyTwoFactor(code.value);
    goToDestination();
  } catch (err) {
    codeError.value = err?.message || "Code invalide";
  }
};

const useWebauthnLogin = async () => {
  twoFactorMethod.value = "webauthn";
  webauthnError.value = null;
  webauthnLoading.value = true;
  try {
    await authStore.verifyWebauthnLogin();
    goToDestination();
  } catch (err) {
    webauthnError.value = err?.message || "Échec de la vérification WebAuthn";
  } finally {
    webauthnLoading.value = false;
  }
};

const backToCredentials = () => {
  authStore.cancelTwoFactorChallenge();
  step.value = "credentials";
  code.value = "";
  codeError.value = null;
  twoFactorMethod.value = null;
  webauthnError.value = null;
};
</script>

<template>
  <div class="centered">
    <form v-if="step === 'credentials'" class="text-center form-signin" @submit.prevent="login">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
      <h1 class="h3 mb-3">Veuillez-vous connecter</h1>
      <label for="inputEmail" class="visually-hidden">Email</label>
      <input
        id="inputEmail"
        v-model="email"
        type="email"
        class="form-control form-control-sm"
        placeholder="Email"
        required
        autofocus
        autocomplete="off"
        :class="{ 'is-invalid': errors }"
      />
      <label for="inputPassword" class="visually-hidden">Mot de passe</label>
      <input
        id="inputPassword"
        v-model="password"
        type="password"
        class="form-control form-control-sm"
        placeholder="Mot de passe"
        required
        autocomplete="off"
        :class="{ 'is-invalid': errors }"
      />
      <div v-if="errors" class="invalid-feedback">Informations de connexion invalides</div>
      <div class="text-start mb-3 mt-2">
        <base-checkbox v-model="rememberMe" label="Se souvenir de moi sur cet appareil" />
      </div>
      <button class="btn btn-lg btn-primary w-100" type="submit">Se connecter</button>
      <p class="mt-5 mb-3 text-body-secondary">© GestSIS {{ new Date().getFullYear() }}</p>

      <router-link :to="{ name: 'forgotten-password' }" class="btn btn-link is-active"
        >Mot de passe oublié</router-link
      >
      <router-link :to="{ name: 'register' }" class="btn btn-link is-active"
        >S'enregistrer</router-link
      >
    </form>

    <div v-else-if="step === 'challenge'" class="text-center form-signin">
      <h1 class="h3 mb-3">Double authentification</h1>

      <template v-if="twoFactorMethod === null">
        <p class="text-body-secondary">Choisissez une méthode de vérification.</p>
        <button
          v-if="authStore.twoFactorAvailableMethods.includes('totp')"
          type="button"
          class="btn btn-outline-primary w-100 mb-2"
          @click="twoFactorMethod = 'totp'"
        >
          Code d'authentification
        </button>
        <button
          v-if="authStore.twoFactorAvailableMethods.includes('webauthn')"
          type="button"
          class="btn btn-outline-primary w-100 mb-2"
          @click="useWebauthnLogin"
        >
          Clé de sécurité / biométrie
        </button>
        <button type="button" class="btn btn-link" @click="backToCredentials">Retour</button>
      </template>

      <form v-else-if="twoFactorMethod === 'totp'" @submit.prevent="verifyChallenge">
        <p class="text-body-secondary">
          Entrez le code généré par votre application d'authentification, ou un de vos codes de
          secours.
        </p>
        <label for="totp-code" class="visually-hidden">Code</label>
        <input
          id="totp-code"
          v-model="code"
          type="text"
          autocomplete="one-time-code"
          autocapitalize="off"
          class="form-control form-control-sm mb-2"
          placeholder="Code à 6 chiffres"
          required
          autofocus
          :class="{ 'is-invalid': codeError }"
        />
        <div v-if="codeError" class="invalid-feedback d-block mb-2">{{ codeError }}</div>
        <button class="btn btn-lg btn-primary w-100 mb-2" type="submit">Valider</button>
        <button
          v-if="authStore.twoFactorAvailableMethods.length > 1"
          type="button"
          class="btn btn-link"
          @click="twoFactorMethod = null"
        >
          Autre méthode
        </button>
        <button type="button" class="btn btn-link" @click="backToCredentials">Retour</button>
      </form>

      <template v-else-if="twoFactorMethod === 'webauthn'">
        <p v-if="webauthnLoading" class="text-body-secondary">
          Suivez les instructions de votre navigateur…
        </p>
        <div v-if="webauthnError" class="alert alert-danger">{{ webauthnError }}</div>
        <button
          type="button"
          class="btn btn-lg btn-primary w-100 mb-2"
          :disabled="webauthnLoading"
          @click="useWebauthnLogin"
        >
          Réessayer
        </button>
        <button
          v-if="authStore.twoFactorAvailableMethods.length > 1"
          type="button"
          class="btn btn-link"
          @click="twoFactorMethod = null"
        >
          Autre méthode
        </button>
        <button type="button" class="btn btn-link" @click="twoFactorMethod = 'recovery'">
          Je n'ai plus accès à ma clé de sécurité
        </button>
        <button type="button" class="btn btn-link" @click="backToCredentials">Retour</button>
      </template>

      <form v-else-if="twoFactorMethod === 'recovery'" @submit.prevent="verifyChallenge">
        <p class="text-body-secondary">Entrez un de vos codes de secours.</p>
        <label for="recovery-code" class="visually-hidden">Code de secours</label>
        <input
          id="recovery-code"
          v-model="code"
          type="text"
          autocomplete="one-time-code"
          autocapitalize="off"
          class="form-control form-control-sm mb-2"
          placeholder="xxxx-xxxx"
          required
          autofocus
          :class="{ 'is-invalid': codeError }"
        />
        <div v-if="codeError" class="invalid-feedback d-block mb-2">{{ codeError }}</div>
        <button class="btn btn-lg btn-primary w-100 mb-2" type="submit">Valider</button>
        <button type="button" class="btn btn-link" @click="twoFactorMethod = 'webauthn'">
          Utiliser ma clé de sécurité
        </button>
        <button type="button" class="btn btn-link" @click="backToCredentials">Retour</button>
      </form>
    </div>

    <TwoFactorForcedSetup
      v-else-if="step === 'setup'"
      @done="goToDestination"
      @cancel="backToCredentials"
    />
  </div>
</template>

<style scoped>
.centered {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bs-tertiary-bg);
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
}

.form-signin .checkbox {
  font-weight: 400;
}

.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}

.form-signin .form-control:focus {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
