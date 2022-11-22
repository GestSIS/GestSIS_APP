<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">A propos</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-8">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>Notes de mise à jour</h3>
          </div>
          <div class="card-body">
            <div
              v-for="({ changes, date, app }, i) in all
                ? releases
                : releases.slice(0, Math.max(5, nbNew))"
              :key="i"
            >
              <h5>
                {{ date }} - {{ app }}
                <span v-if="i < nbNew" class="badge bg-danger">Nouveau</span>
              </h5>
              <ul>
                <li v-for="(change, j) in changes" :key="j">
                  <span v-for="(t, k) in change.split('`')" :key="k"
                    >{{ !(k % 2) ? t : '' }}<em v-if="k % 2">{{ t }}</em></span
                  >
                </li>
              </ul>
            </div>
            <button v-if="!all" class="btn btn-primary" @click="all = true">
              Tout afficher
            </button>
          </div>
        </div>
        <div class="timeline"></div>
      </div>
      <div class="col-md-4">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>A propos</h3>
          </div>
          <div class="card-body">
            <h1>GestSIS</h1>
            <p>
              Application métier pour la gestion d'un service d'incendie et de
              secours.
            </p>
            <p>Auteur : Bastien Wermeille</p>
            <p>
              GestSIS © {{ new Date().getFullYear() }} - Tous droits réservés
            </p>
          </div>
        </div>
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>Support</h3>
          </div>
          <div class="card-body">
            <!-- TODO: Ajout sujet par défault - Nom SIS -->
            <p>Contacter par <a href="mailto:support@gestsis.ch">email</a></p>
            <p>
              Télécharger
              <a
                target="_blank"
                href="https://anydesk.com/fr/downloads/thank-you?dv=win_exe"
                >anydesk</a
              >
            </p>
          </div>
        </div>
        <div v-if="isAdmin" class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>Admin</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <button class="btn btn-primary" @click="refreshTokens">
                Refresh tokens
              </button>
            </div>
            <div class="mb-3">
              <label for="copy-to-clipboard" class="form-label"
                >Access Token</label
              >
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder=""
                  :value="accessToken"
                  readonly
                  aria-label="Copier dans le press-papier"
                  aria-describedby="copy-to-clipboard"
                />
                <button
                  id="copy-to-clipboard"
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="copyToClipboard(accessToken)"
                >
                  <font-awesome-icon :icon="['far', 'clipboard']" />
                </button>
              </div>
              <div class="mb-3">
                <label for="copy-to-clipboard" class="form-label"
                  >Refresh Token</label
                >
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder=""
                    :value="refreshToken"
                    readonly
                    aria-label="Copier dans le press-papier"
                    aria-describedby="copy-to-clipboard"
                  />
                  <button
                    id="copy-to-clipboard"
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="copyToClipboard(refreshToken)"
                  >
                    <font-awesome-icon :icon="['far', 'clipboard']" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';
import { TokenService } from '../services/StorageService.js';
import { mapState } from 'vuex';
import * as data from '../../releases.json';

export default {
  name: 'PageAbout',
  components: {
    ExerciceComptable,
  },
  data: () => {
    return {
      releases: data.releases,
      all: false,
      nbNew: 0,
      accessToken: '',
      refreshToken: '',
    };
  },
  computed: {
    ...mapState({
      isAdmin: (state) => state.auth.admin,
    }),
  },
  mounted() {
    this.accessToken = TokenService.getAccessToken();
    this.refreshToken = TokenService.getRefreshToken();

    const date = localStorage.getItem(
      'latestReleaseDate',
      this.releases[0].date
    );
    const version = localStorage.getItem(
      'latestSeenVersion',
      this.releases[0].version
    );
    const latestReadIndex = this.releases.findIndex((r) => r.date == date);
    if (latestReadIndex < 0) {
      this.nbNew = this.releases.length;
    } else {
      this.nbNew = latestReadIndex;
      if (this.releases[latestReadIndex].version != version) {
        this.nbNew++;
      }
    }

    localStorage.setItem('latestReleaseDate', this.releases[0].date);
    localStorage.setItem('latestSeenVersion', this.releases[0].version);
  },
  methods: {
    refreshTokens() {
      this.$store.dispatch('refreshToken').then(() => {
        this.accessToken = TokenService.getAccessToken();
        this.refreshToken = TokenService.getRefreshToken();
      });
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
    },
  },
};
</script>

<style></style>
