<template>
  <div class="centered">
    <form class="text-center form-signin" _lpchecked="1">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
      <h1 class="h1 mb-3 fwnormal">Confirmation de votre email</h1>
      <h2 class="h3 mb-3" v-if="success">
        Email validé avec succès, vous allez être redirigé dans
        {{ sec }} secondes
      </h2>
      <div class="h3 mb-3" v-if="error">{{ error }}</div>
      <button class="btn btn-lg btn-primary btn-block" type="submit" @click="redirect">Accueil</button>
      <p class="mt-5 mb-3 text-muted">© GestSIS {{ new Date().getFullYear() }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'confirmation',
  data() {
    return {
      error: null,
      success: null,
      sec: 10,
      interval: null,
    };
  },
  mounted() {
    const token = this.$route.query.token;
    if (!token) {
      this.$router.push({ name: 'accueil' });
    } else {
      this.$store
        .dispatch('confirmation', token)
        .then(() => {
          this.error = null;
          this.success = true;
          this.interval = setInterval(() => {
            this.sec -= 1;
            if (this.sec <= 0) {
              clearInterval(this.interval);
              this.$router.push(
                this.$route.query.redirect
                  ? this.$route.query.redirect
                  : { name: 'accueil' }
              );
            }
          }, 1000);
        })
        .catch(({ error }) => {
          this.error = error;
        });
    }
  },
  unmounted() {
    clearInterval(this.interval);
  },
  methods: {
    redirect() {
      this.$router.push(
        this.$route.query.redirect
          ? this.$route.query.redirect
          : { name: 'accueil' }
      );
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
