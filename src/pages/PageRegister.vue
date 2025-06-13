<script setup>
import { ref } from 'vue';
import TransitionExpand from '/src/components/transition/TransitionExpand.vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

const avance = ref(false);
const name = ref(null);
const email = ref(null);
const password = ref(null);
const password_confirmation = ref(null);
const token = ref('');
const error = ref({});

const store = useStore();
const route = useRoute();
const router = useRouter();

const register = async () =>
  store
    .dispatch('register', {
      name: name.value?.trim(),
      email: email.value?.trim(),
      password: password.value,
      password_confirmation: password_confirmation.value,
      token: token.value?.trim() || null,
    })
    .then(() => {
      error.value = {};
      router.push(route.query.redirect ? route.query.redirect : 'accueil');
    })
    .catch((data) => {
      error.value = data.error;
    });
</script>

<template>
  <div class="centered">
    <form class="text-center form-signin d-grid" @submit.prevent="register">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
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
        :class="{ 'is-invalid': error.name }"
      />
      <div v-if="error.name" class="invalid-feedback">Nom invalide</div>
      <label for="inputEmail" class="visually-hidden">Email</label>
      <input
        id="inputEmail"
        v-model="email"
        type="email"
        class="form-control form-control-sm"
        placeholder="Email"
        required
        autocomplete="off"
        :class="{ 'is-invalid': error.email }"
      />
      <div v-if="error.email" class="invalid-feedback">Email déjà existant</div>
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
      <div v-if="error.password_confirmation" class="invalid-feedback">
        Mot de passe différent
      </div>
      <button
        class="btn btn-link btn-block"
        type="button"
        @click.prevent="avance = !avance"
      >
        Avancé
      </button>
      <transition-expand>
        <div v-show="avance">
          <label for="inputToken" class="visually-hidden"
            >Jeton d'enregistrement</label
          >
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
      <button class="btn btn-lg btn-primary btn-block mt-3" type="submit">
        Créer un compte
      </button>
      <p class="mt-5 mb-3 text-muted">
        © GestSIS {{ new Date().getFullYear() }}
      </p>

      <router-link :to="{ name: 'login' }" class="btn btn-link is-active"
        >Se connecter</router-link
      >
    </form>
  </div>
</template>

<style lang="scss" scoped>
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
