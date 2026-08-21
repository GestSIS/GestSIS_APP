<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth";

const email = ref(null);
const password = ref(null);
const error = ref(null);

const router = useRouter();
const route = useRoute();

const login = async () => {
  if (
    email.value?.trim()?.toLowerCase()?.endsWith("@gestsis.ch") &&
    email.value?.trim()?.toLowerCase() !== "admin@gestsis.ch" &&
    email.value?.trim()?.toLowerCase() !== "demo@gestsis.ch"
  ) {
    error.value = {
      email: "Email invalid",
    };
    return;
  }

  useAuthStore()
    .login({
      email: email.value?.trim(),
      password: password.value,
    })
    .then(() => {
      error.value = null;
      router.push(route.query.redirect ? route.query.redirect : "accueil");
    })
    .catch((error) => {
      error.value = error;
    });
};
</script>

<template>
  <div class="centered">
    <form class="text-center form-signin" @submit.prevent="login">
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
        :class="{ 'is-invalid': error }"
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
        :class="{ 'is-invalid': error }"
      />
      <div v-if="error" class="invalid-feedback">Informations de connexion invalides</div>
      <button class="btn btn-lg btn-primary w-100" type="submit">Se connecter</button>
      <p class="mt-5 mb-3 text-body-secondary">© GestSIS {{ new Date().getFullYear() }}</p>

      <router-link :to="{ name: 'forgotten-password' }" class="btn btn-link is-active"
        >Mot de passe oublié</router-link
      >
      <router-link :to="{ name: 'register' }" class="btn btn-link is-active"
        >S'enregistrer</router-link
      >
    </form>
  </div>
</template>

<style scoped>
.centered {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5 !important;
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
