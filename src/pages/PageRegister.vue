<script setup>
import { ref } from "vue";
import TransitionExpand from "/src/components/transition/TransitionExpand.vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth";
import TwoFactorForcedSetup from "../components/TwoFactorForcedSetup.vue";
import useNotification from "../composables/useNotification.js";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, passwordErrors } from "../tools/passwordPolicy.js";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const awn = useNotification();

const avance = ref(false);
const name = ref(null);
// `?confirm=<email>` : arrivée depuis PageLogin sur un compte dont l'email
// n'est pas encore confirmé — reprend directement à la saisie du code et en
// envoie un nouveau. `?email=<email>` : même étape, sans renvoi (URL réécrite
// après l'envoi, pour qu'un rechargement n'invalide pas le code reçu).
const pendingConfirmationEmail = route.query?.confirm ?? route.query?.email ?? null;
const email = ref(pendingConfirmationEmail);
const password = ref(null);
const password_confirmation = ref(null);
const token = ref(route.query?.token ?? "");
const errors = ref({});
const submitting = ref(false);

// 'form' -> 'confirm-email' (code reçu par email à saisir) -> 'setup'
// (2FA obligatoire, uniquement si l'enforcement est actif).
const step = ref(pendingConfirmationEmail ? "confirm-email" : "form");
const confirmationCode = ref("");
const codeError = ref(null);
const resending = ref(false);

const goToDestination = () => router.push(route.query.redirect ? route.query.redirect : "accueil");

const register = async () => {
  // Empêche les envois en double (double-clic, réseau lent) qui provoquent
  // une erreur de contrainte unique côté backend.
  if (submitting.value) {
    return;
  }
  // Erreurs évidentes bloquées avant l'envoi : chaque requête est comptée par
  // le throttling de l'inscription côté Auth.
  const localPasswordErrors = passwordErrors(password.value);
  if (localPasswordErrors.length > 0 || password.value !== password_confirmation.value) {
    errors.value = localPasswordErrors.length > 0 ? { password: localPasswordErrors } : {};
    return;
  }
  submitting.value = true;
  return authStore
    .register({
      name: name.value?.trim(),
      email: email.value?.trim(),
      password: password.value,
      password_confirmation: password_confirmation.value,
      token: token.value?.trim() || null,
    })
    .then(() => {
      errors.value = {};
      step.value = "confirm-email";
    })
    .catch((error) => {
      // 422 : erreurs par champ ; sinon (jeton invalide, trop de tentatives,
      // envoi de l'email en échec…) seul `message` est affiché.
      errors.value = error?.errors ?? {
        message: error?.message || "Erreur lors de la création du compte",
      };
    })
    .finally(() => {
      submitting.value = false;
    });
};

const confirmEmail = async () => {
  codeError.value = null;
  try {
    const result = await authStore.confirmRegistrationEmail(
      email.value?.trim(),
      confirmationCode.value,
    );
    if (result?.requiresTwoFactorSetup) {
      step.value = "setup";
      return;
    }
    goToDestination();
  } catch (err) {
    codeError.value = err?.message || "Code invalide";
  }
};

const resendCode = async () => {
  resending.value = true;
  try {
    await authStore.resendValidationEmail(email.value?.trim());
    awn.success("Un nouveau code vous a été envoyé");
  } catch {
    awn.alert("Erreur lors du renvoi du code");
  } finally {
    resending.value = false;
  }
};

// Depuis PageLogin, aucun code n'a été envoyé à l'instant (l'ancien a pu
// expirer) : en envoyer un nouveau d'office.
if (route.query?.confirm) {
  resendCode();
  const { confirm, ...query } = route.query;
  router.replace({ query: { ...query, email: confirm } });
}
</script>

<template>
  <div class="centered">
    <form v-if="step === 'form'" class="text-center form-signin d-grid" @submit.prevent="register">
      <h1 class="h3 mb-3">Veuillez-vous enregistrer</h1>
      <label for="inputName" class="visually-hidden">Nom Prénom</label>
      <input
        id="inputName"
        v-model="name"
        type="text"
        class="form-control form-control-sm"
        placeholder="Nom Prénom"
        required
        autofocus
        autocomplete="off"
        :class="{ 'is-invalid': errors.name }"
      />
      <div v-if="errors.name" class="invalid-feedback">{{ errors.name.join(" ") }}</div>
      <label for="inputEmail" class="visually-hidden">Email</label>
      <input
        id="inputEmail"
        v-model="email"
        type="email"
        class="form-control form-control-sm"
        placeholder="Email"
        required
        autocomplete="off"
        :class="{ 'is-invalid': errors.email }"
      />
      <div v-if="errors.email" class="invalid-feedback">{{ errors.email.join(" ") }}</div>
      <label for="inputPassword" class="visually-hidden">Mot de passe</label>
      <input
        id="inputPassword"
        v-model="password"
        type="password"
        class="form-control form-control-sm"
        placeholder="Mot de passe"
        :minlength="PASSWORD_MIN_LENGTH"
        required
        autocomplete="off"
        :class="{ 'is-invalid': errors.password }"
      />
      <div v-if="errors.password" class="invalid-feedback">{{ errors.password.join(" ") }}</div>
      <div v-else class="form-text text-start mb-2">{{ PASSWORD_HINT }}</div>
      <label for="inputPasswordConfirmation" class="visually-hidden">Confirmation</label>
      <input
        id="inputPasswordConfirmation"
        v-model="password_confirmation"
        type="password"
        class="form-control form-control-sm"
        placeholder="Confirmation"
        required
        autocomplete="off"
        :class="{
          'is-invalid': errors.password_confirmation || password !== password_confirmation,
        }"
      />
      <div v-if="errors.password_confirmation" class="invalid-feedback">
        {{ errors.password_confirmation.join(" ") }}
      </div>
      <button class="btn btn-link btn-block" type="button" @click.prevent="avance = !avance">
        Avancé
      </button>
      <transition-expand>
        <div v-show="avance">
          <label for="inputToken" class="visually-hidden">Jeton d'enregistrement</label>
          <input
            id="inputToken"
            v-model="token"
            type="text"
            class="form-control form-control-sm"
            placeholder="Jeton (optionnel)"
            autocomplete="off"
          />
        </div>
      </transition-expand>
      <div v-if="errors.message" class="invalid-feedback d-block mt-2">{{ errors.message }}</div>
      <button class="btn btn-lg btn-primary btn-block mt-3" type="submit" :disabled="submitting">
        {{ submitting ? "Création…" : "Créer un compte" }}
      </button>
      <p class="mt-5 mb-3 text-muted">© GestSIS {{ new Date().getFullYear() }}</p>

      <router-link :to="{ name: 'login' }" class="btn btn-link is-active">Se connecter</router-link>
    </form>

    <form
      v-else-if="step === 'confirm-email'"
      class="text-center form-signin"
      @submit.prevent="confirmEmail"
    >
      <h1 class="h3 mb-3">Confirmez votre email</h1>
      <p class="text-body-secondary">
        Un code de 8 caractères a été envoyé à <strong>{{ email }}</strong> — saisissez-le
        ci-dessous pour terminer votre inscription.
      </p>
      <label for="confirmation-code" class="visually-hidden">Code de confirmation</label>
      <input
        id="confirmation-code"
        v-model="confirmationCode"
        type="text"
        autocapitalize="characters"
        autocomplete="one-time-code"
        class="form-control form-control-sm mb-2"
        placeholder="Code à 8 caractères"
        required
        autofocus
        :class="{ 'is-invalid': codeError }"
      />
      <div v-if="codeError" class="invalid-feedback d-block mb-2">{{ codeError }}</div>
      <button class="btn btn-lg btn-primary w-100 mb-2" type="submit">Valider</button>
      <button type="button" class="btn btn-link" :disabled="resending" @click="resendCode">
        {{ resending ? "Envoi…" : "Renvoyer le code" }}
      </button>
    </form>

    <TwoFactorForcedSetup
      v-else-if="step === 'setup'"
      @done="goToDestination"
      @cancel="router.push({ name: 'login' })"
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
