<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth/Auth";

const email = ref(null);
const error = ref({});
const sent = ref(false);

const authStore = useAuthStore();

const request = async () => {
  if (email.value?.trim()?.toLowerCase()?.endsWith("@gestsis.ch")) {
    error.value = {
      email: "Email invalid",
    };
    return;
  }

  authStore
    .forgottenPassword(email.value)
    .then(() => {
      error.value = {};
      sent.value = true;
    })
    .catch((err) => {
      error.value = err;
    });
};
</script>

<template>
  <div class="centered">
    <form class="text-center form-signin" @submit.prevent="request">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
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
        :class="{ 'is-invalid': error['email'] }"
      />
      <div v-if="!sent && error['email']" class="invalid-feedback">
        {{ error["email"] }}
      </div>
      <button v-if="!sent" class="btn btn-lg btn-primary btn-block mt-3" type="submit">
        M'envoyer un lien de récupération
      </button>
      <div v-if="sent">
        <p>
          Un email a été envoyé à <strong>{{ email }}</strong> si cette email est valide. Cliquez
          sur le lien reçu afin de réinitialiser votre de mot de passe puis reconnectez-vous.
        </p>
      </div>
      <p class="mt-5 mb-3 text-muted">© GestSIS {{ new Date().getFullYear() }}</p>
      <router-link :to="{ name: 'login' }" class="btn btn-link is-active">Se connecter</router-link>
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
