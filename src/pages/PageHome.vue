<script setup>
import { computed, onUnmounted, ref } from 'vue';
import useNotification from '../composables/useNotification.js';
import Api from '/src/http/Request';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth/Auth.js';

const authStore = useAuthStore();

const loading = ref(false);
const disableCounter = ref(0);
const disableInterval = ref(null);
const resendCounter = ref(0);
const resendInterval = ref(null);

const router = useRouter();

const listeSis = computed(() => authStore.sis.liste);
const validated = computed(() => authStore.validated);
const availableSisListe = computed(() => authStore.availableSisListe);

const awn = useNotification();

if (listeSis.value.length <= 0) {
  loading.value = true;
  await authStore.loadSisListe().then(() => {
    loading.value = false;
  });
}

onUnmounted(() => {
  if (disableInterval.value != null) {
    clearInterval(disableInterval.value);
    disableInterval.value = null;
  }
  if (resendInterval.value != null) {
    clearInterval(resendInterval.value);
    resendInterval.value = null;
  }
});

const getImageUrl = (sis) => {
  return Api.API_URL + `/sis-logo/${sis.api_key}`;
};
const connectToSis = async (sis) => {
  await authStore.selectSis(sis);
  router.push({ name: 'dashboard' });
};
const refresh = () => {
  authStore.refreshToken().then(() => {
    if (!validated.value) {
      awn.warning("Votre compte n'est toujours pas validé !");
      disableCounter.value = 5;
      disableInterval.value = setInterval(() => {
        disableCounter.value--;
        if (disableCounter.value <= 0) {
          clearInterval(disableInterval.value);
          disableInterval.value = null;
        }
      }, 1000);
    }
  });
};
const resend = () => {
  const callback = () => {
    resendCounter.value = 30;
    resendInterval.value = setInterval(() => {
      resendCounter.value--;
      if (resendCounter.value <= 0) {
        clearInterval(resendInterval.value);
        resendInterval.value = null;
      }
    }, 1000);
  };
  authStore
    .resendValidationEmail()
    .then((res) => {
      awn.success(
        res?.message ??
          'Un nouvel email vous a été envoyé, controllez votre boîte mail',
      );
      callback();
    })
    .catch((err) => {
      awn.alert(
        err?.error ??
          "Une erreur a eu lieu durant le renvoie de l'email de confirmation",
      );
      callback();
    });
};
</script>

<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container mb-3">
        <div class="row mt-5">
          <h2 id="C1">Vos SIS</h2>
        </div>
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div v-if="!validated" class="col-12">
            <div class="alert alert-warning" role="alert">
              Attention, votre compte n'est pas encore validé, veuillez cliquer
              sur le lien reçu dans votre boîte mail pour activer votre compte.
              <br />
              <button
                class="btn btn-secondary mt-2"
                :disabled="disableCounter > 0"
                @click="refresh"
              >
                Rafraichir
                <em v-if="disableCounter > 0"
                  >[Réessayer dans {{ disableCounter }} s]</em
                >
              </button>
              <button
                class="btn btn-secondary mt-2 ms-2"
                :disabled="disableCounter > 0"
                @click="resend"
              >
                Renvoyer l'email
                <em v-if="resendCounter > 0"
                  >[Réessayer dans {{ resendCounter }} s]</em
                >
              </button>
            </div>
          </div>

          <div
            v-if="availableSisListe.length <= 0"
            class="card col-md-3 col-sm-6 col-xs-12"
          >
            <div class="align-vertical">
              <p v-if="!validated">
                Vous devez valider votre compte afin de pouvoir obtenir des
                droits depuis votre SIS.
              </p>
              <p v-else>
                Vous n'avez actuellement aucun droit, demandez des droits à
                votre SIS.
              </p>
            </div>
          </div>
          <div
            v-for="sis in availableSisListe"
            :key="sis.id"
            class="card col-md-3 col-sm-6 col-xs-12"
          >
            <div class="align-vertical">
              <button class="btn btn-link" @click="connectToSis(sis)">
                <img class="img-fetch" :src="getImageUrl(sis)" :alt="sis.nom" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.columns {
  overflow: scroll;
}

.img-fetch {
  height: auto;
  max-height: 220px;
  width: 100%;
  display: block;
}

.align-vertical {
  margin: auto;
}
</style>
