<script setup>
import { ref, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth/Auth';

const route = useRoute();
const router = useRouter();

const password = ref(null);
const password_confirmation = ref(null);
const token = ref(route.query.token);
const error = ref({});
const reseted = ref(false);
const time = ref(10);
const timeInterval = ref(null);

if (!token.value) {
  router.push({ name: 'public' });
}

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value);
  }
});

const reset = async () => {
  if (password.value.length < 8) {
    error.value['password'] = 'Mot de passe trop court (min 8 charactères)';
    return;
  }
  error.value = {};
  useAuthStore()
    .resetPassword({
      password: password.value,
      password_confirmation: password_confirmation.value,
      token: token.value || null,
    })
    .then(() => {
      error.value = {};
      reseted.value = true;
      if (!timeInterval.value) {
        timeInterval.value = setInterval(() => {
          if (time.value <= 0) {
            clearInterval(timeInterval.value);
            router.push(
              route.query.redirect ? route.query.redirect : 'accueil',
            );
          } else {
            time.value--;
          }
        }, 1000);
      }
    })
    .catch((data) => {
      error.value = { ...(data?.error ?? {}) };
    });
};
</script>

<template>
  <div class="centered">
    <form class="text-center form-signin d-grid" @submit.prevent="reset">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
      <h1 class="h3 mb-3">Réinitialisation de votre mot de passe</h1>
      <template v-if="!reseted">
        <label for="inputPassword" class="visually-hidden">Mot de passe</label>
        <input
          id="inputPassword"
          v-model="password"
          type="password"
          class="form-control form-control-sm"
          placeholder="Mot de passe"
          required
          autocomplete="off"
          :class="{ 'is-invalid': error.password }"
        />
        <div v-if="error.password" class="invalid-feedback">
          Taille minimum: 8
        </div>
        <label for="inputPasswordConfirmation" class="visually-hidden"
          >Confirmation</label
        >
        <input
          id="inputPasswordConfirmation"
          v-model="password_confirmation"
          type="password"
          class="form-control form-control-sm"
          placeholder="Confirmation"
          required
          autocomplete="off"
          :class="{
            'is-invalid':
              error.password_confirmation || password !== password_confirmation,
          }"
        />
        <div v-if="password !== password_confirmation" class="invalid-feedback">
          Mot de passe différent
        </div>
        <div v-if="error.message" class="invalid-feedback d-block">
          {{ error.message }}
        </div>
        <button class="btn btn-lg btn-primary btn-block mt-3" type="submit">
          Réinitialiser
        </button>
      </template>
      <template v-else>
        <div>
          <p>
            Votre mot de passe a été réinitalisé, vous allez être redirigé vers
            la page de connection dans {{ time }} secondes.
          </p>
        </div>
      </template>
      <p class="mt-5 mb-3 text-muted">
        © GestSIS {{ new Date().getFullYear() }}
      </p>

      <router-link :to="{ name: 'login' }" class="btn btn-link is-active"
        >Se connecter</router-link
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

.form-signin input[type='email'] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type='password'] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
