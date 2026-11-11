<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth/Auth";
import { useSubmit } from "../composables/useSubmit.js";

const email = ref(null);
const sent = ref(false);

const authStore = useAuthStore();
// Erreurs de champs : tableaux de messages (format API), comme la vérification locale ci-dessous.
const { errors, isSubmitting, submit } = useSubmit();

const request = async () => {
  if (email.value?.trim()?.toLowerCase()?.endsWith("@gestsis.ch")) {
    errors.value = {
      email: ["Email invalid"],
    };
    return;
  }

  const { ok } = await submit(
    () => authStore.forgottenPassword(email.value),
    "Erreur lors de la demande de récupération du mot de passe",
  );
  if (ok) {
    sent.value = true;
  }
};
</script>

<template>
  <div class="centered">
    <form class="text-center form-signin" @submit.prevent="request">
      <h1 class="h3 mb-3">Récupération de votre mot de passe</h1>
      <label v-if="!sent" for="inputEmail" class="visually-hidden">Email</label>
      <input
        v-if="!sent"
        id="inputEmail"
        v-model="email"
        type="email"
        class="form-control form-control-sm"
        placeholder="Email"
        required
        autofocus
        autocomplete="off"
        :class="{ 'is-invalid': errors['email'] }"
      />
      <div v-if="!sent && errors['email']" class="invalid-feedback">
        {{ errors["email"][0] }}
      </div>
      <button
        v-if="!sent"
        class="btn btn-lg btn-primary mt-3"
        type="submit"
        :disabled="isSubmitting"
      >
        M'envoyer un lien de récupération
      </button>
      <div v-if="sent">
        <p>
          Un email a été envoyé à <strong>{{ email }}</strong> si cette email est valide. Cliquez
          sur le lien reçu afin de réinitialiser votre de mot de passe puis reconnectez-vous.
        </p>
      </div>
      <p class="mt-5 mb-3 text-muted">© GestSIS {{ new Date().getFullYear() }}</p>
      <router-link :to="{ name: 'login' }" class="btn btn-link">Se connecter</router-link>
      <router-link :to="{ name: 'register' }" class="btn btn-link">S'enregistrer</router-link>
    </form>
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

.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
</style>
