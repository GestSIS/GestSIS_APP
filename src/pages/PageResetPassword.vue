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

<script>
export default {
  name: 'PageReset',
  data() {
    return {
      password: null,
      password_confirmation: null,
      token: '',
      error: {},
      reseted: false,
      time: 10,
      timeInterval: null,
    };
  },
  mounted() {
    this.token = this.$route.query.token;
    if (!this.token) {
      this.$router.push({ name: 'public' });
    }
  },
  unmounted() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  methods: {
    async reset() {
      if (this.password.length < 8) {
        this.error['password'] = 'Mot de passe trop court (min 8 charactères)';
        return;
      }
      this.error = {};
      this.$store
        .dispatch('resetPassword', {
          password: this.password,
          password_confirmation: this.password_confirmation,
          token: this.token || null,
        })
        .then(() => {
          this.error = {};
          this.reseted = true;
          if (!this.timeInterval) {
            this.timeInterval = setInterval(() => {
              if (this.time <= 0) {
                clearInterval(this.timeInterval);
                this.$router.push(
                  this.$route.query.redirect
                    ? this.$route.query.redirect
                    : 'accueil'
                );
              } else {
                this.time--;
              }
            }, 1000);
          }
        })
        .catch((data) => {
          console.log(data.error);
          console.log({ ...(data?.error ?? {}) });
          this.error = { ...(data?.error ?? {}) };
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
