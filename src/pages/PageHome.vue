<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container">
        <div class="row mt-5">
          <h2 id="C1">Vos SIS</h2>
        </div>
        <!-- <div>Loading {{ loading }}</div> -->
        <div class="row">
          <div v-if="validated" class="col-12">
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
                <img class="img-fetch" :src="getImageUrl(sis)" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'PageHome',
  data() {
    return {
      loading: false,
      disableCounter: 0,
      disableInterval: null,
      resendCounter: 0,
      resendInterval: null,
    };
  },
  computed: {
    ...mapState({
      listeSis: (state) => state.auth.sis.liste,
      available: (state) => state.auth.sis.available,
      sisId: (state) => state.auth.sis.activeId,
      sisKey: (state) => state.auth.sis.activeKey,
      validated: (state) => state.auth.validated,
    }),
    ...mapGetters(['availableSisListe']),
  },
  created() {
    if (this.listeSis.length <= 0) {
      const self = this;
      this.loading = true;
      this.$store.dispatch('loadSisListe').then(() => {
        self.loading = false;
      });
    }
  },
  unmounted() {
    if (this.disableInterval != null) {
      clearInterval(this.disableInterval);
      this.disableInterval = null;
    }
    if (this.resendInterval != null) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  },
  methods: {
    getImageUrl(sis) {
      return new URL(`../assets/sis/${sis.api_key}.jpg`, import.meta.url).href;
    },
    connectToSis(sis) {
      this.$store.dispatch('selectSis', sis).then(() => {
        this.$router.push({ name: 'dashboard' });
      });
    },
    refresh() {
      this.$store.dispatch('refreshToken').then(() => {
        if (!this.validated) {
          this.$awn.warning("Votre compte n'est toujours pas validé !");
          this.disableCounter = 5;
          this.disableInterval = setInterval(() => {
            this.disableCounter--;
            if (this.disableCounter <= 0) {
              clearInterval(this.disableInterval);
              this.disableInterval = null;
            }
          }, 1000);
        }
      });
    },
    resend() {
      const callback = () => {
        this.resendCounter = 30;
        this.resendInterval = setInterval(() => {
          this.resendCounter--;
          if (this.resendCounter <= 0) {
            clearInterval(this.resendInterval);
            this.resendInterval = null;
          }
        }, 1000);
      };
      this.$store
        .dispatch('resendValidationEmail')
        .then((res) => {
          this.$awn.success(
            res?.message ??
              'Un nouvel email vous a été envoyé, controllez votre boîte mail'
          );
          callback();
        })
        .catch((err) => {
          this.$awn.alert(
            err?.error ??
              "Une erreur a eu lieu durant le renvoie de l'email de confirmation"
          );
          callback();
        });
    },
  },
};
</script>

<style scoped>
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
