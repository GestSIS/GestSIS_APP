<template>
  <div class="centered">
    <form class="text-center form-signin d-grid" @submit.prevent="register">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
      <h1 class="h3 mb-3 fwnormal">Veuillez-vous enregistrer</h1>
      <label for="inputName" class="sr-only">Nom d'utilisateur</label>
      <input
        v-model="name"
        type="text"
        id="inputName"
        class="form-control form-control-sm"
        placeholder="Nom d'utilisateur"
        required
        autofocus
        autocomplete="off"
        :class="{ 'is-invalid': error.name }"
      />
      <div class="invalid-feedback" v-if="error.name">Nom invalide</div>
      <label for="inputEmail" class="sr-only">Email</label>
      <input
        v-model="email"
        type="email"
        id="inputEmail"
        class="form-control form-control-sm"
        placeholder="Email"
        required
        autocomplete="off"
        :class="{ 'is-invalid': error.email }"
      />
      <div class="invalid-feedback" v-if="error.email">Email déjà existant</div>
      <label for="inputPassword" class="sr-only">Mot de passe</label>
      <input
        v-model="password"
        type="password"
        id="inputPassword"
        class="form-control form-control-sm"
        placeholder="Mot de passe"
        required
        autocomplete="off"
        :class="{ 'is-invalid': error.password }"
      />
      <div class="invalid-feedback" v-if="error.password">
        Taille minimum: 8
      </div>
      <label for="inputPasswordConfirmation" class="sr-only"
        >Confirmation</label
      >
      <input
        v-model="password_confirmation"
        type="password"
        id="inputPasswordConfirmation"
        class="form-control form-control-sm"
        placeholder="Confirmation"
        required
        autocomplete="off"
        :class="{
          'is-invalid':
            error.password_confirmation || password !== password_confirmation,
        }"
      />
      <div class="invalid-feedback" v-if="error.password_confirmation">
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
          <label for="inputToken" class="sr-only">Jeton d'enregistrement</label>
          <input
            v-model="token"
            type="text"
            id="inputToken"
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

      <router-link to="/login" class="btn btn-link is-active"
        >Se connecter</router-link
      >
    </form>
  </div>
</template>

<script>
import TransitionExpand from '@/components/transition/TransitionExpand.vue';

export default {
  name: 'register',
  components: {
    TransitionExpand,
  },
  data() {
    return {
      avance: false,
      name: null,
      email: null,
      password: null,
      password_confirmation: null,
      token: '',
      error: {},
    };
  },
  methods: {
    async register() {
      this.$store
        .dispatch('register', {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
          token: this.token || null,
        })
        .then(() => {
          this.error = {};
          this.$router.push(
            this.$route.query.redirect ? this.$route.query.redirect : 'accueil'
          );
        })
        .catch((data) => {
          this.error = data.error;
        });
    },
  },
};
</script>

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
