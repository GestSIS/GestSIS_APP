<script setup>
import { onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const error = ref(null);
const success = ref(null);
const sec = ref(10);
const interval = ref(null);

const store = useStore();
const route = useRoute();
const router = useRouter();

const token = route.query.token;
if (!token) {
  router.push({ name: 'accueil' });
} else {
  store
    .dispatch('confirmation', token)
    .then(() => {
      error.value = null;
      success.value = true;
      interval.value = setInterval(() => {
        sec.value -= 1;
        if (sec.value <= 0) {
          clearInterval(interval.value);
          router.push(
            route.query.redirect ? route.query.redirect : { name: 'accueil' },
          );
        }
      }, 1000);
    })
    .catch(({ error }) => {
      error.value = error;
    });
}

onUnmounted(() => {
  clearInterval(interval.value);
});

const redirect = () => {
  router.push(
    route.query.redirect ? route.query.redirect : { name: 'accueil' },
  );
};
</script>

<template>
  <div class="centered">
    <form class="text-center form-signin" _lpchecked="1">
      <div :class="{ conditional: true }"></div>
      <!--<img class="mb-4" src="http://gestsis.ch/images/gestsis.gif" alt="" width="72" height="72">-->
      <h1 class="h1 mb-3">Confirmation de votre email</h1>
      <h2 v-if="success" class="h3 mb-3">
        Email validé avec succès, vous allez être redirigé dans
        {{ sec }} secondes
      </h2>
      <div v-if="error" class="h3 mb-3">{{ error }}</div>
      <button
        class="btn btn-lg btn-primary btn-block"
        type="submit"
        @click="redirect"
      >
        Accueil
      </button>
      <p class="mt-5 mb-3 text-muted">
        © GestSIS {{ new Date().getFullYear() }}
      </p>
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
