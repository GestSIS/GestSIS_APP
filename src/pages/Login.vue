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

<template>
  <div class="centered">
    <form class="text-center form-signin" _lpchecked="1">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
      <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
      <label for="inputEmail" class="sr-only">Email address</label>
      <input
        v-model="email"
        type="email"
        id="inputEmail"
        class="form-control"
        placeholder="Email address"
        required=""
        autofocus=""
        autocomplete="off"
        :class="{ 'is-invalid': error }"
      />
      <label for="inputPassword" class="sr-only">Password</label>
      <input
        v-model="password"
        type="password"
        id="inputPassword"
        class="form-control"
        placeholder="Password"
        required=""
        autocomplete="off"
        :class="{ 'is-invalid': error }"
      />
      <div class="invalid-feedback" v-if="error">
        Informations de connexion invalides
      </div>
      <button
        class="btn btn-lg btn-primary btn-block"
        type="submit"
        @click="login"
      >
        Sign in
      </button>
      <p class="mt-5 mb-3 text-muted">© 2019</p>

      <router-link to="/register" class="btn btn-link is-active"
        >S'enregistrer</router-link
      >
    </form>
  </div>
</template>

<script>
// import { mapGetters, mapState } from 'vuex'

export default {
  name: 'register',
  data() {
    return {
      email: null,
      password: null,
      error: null
    };
  },
  methods: {
    login() {
      this.$store
        .dispatch('login', { email: this.email, password: this.password })
        .then(() => {
          this.error = null;
          this.$router.push(
            this.$route.query.redirect ? this.$route.query.redirect : 'sapeurs'
          );
        })
        .catch(error => {
          this.error = error;
        });
    }
  }
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
