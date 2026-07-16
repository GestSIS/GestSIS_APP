<script setup>
import { TokenService } from "../services/StorageService.js";
import * as data from "../../releases.json";
import { computed, ref } from "vue";
import { useAuthStore } from "../stores/auth/Auth.js";

const authStore = useAuthStore();

const releases = ref(data.releases);
const all = ref(false);
const nbNew = ref(0);
const accessToken = ref(TokenService.getAccessToken());
const refreshToken = ref(TokenService.getRefreshToken());

const isAdmin = computed(() => authStore.admin);

const date = localStorage.getItem("latestReleaseDate") ?? releases.value[0].date;
const version = localStorage.getItem("latestSeenVersion") ?? releases.value[0].version;
localStorage.setItem("latestReleaseDate", releases.value[0].date);
localStorage.setItem("latestSeenVersion", releases.value[0].version);

const latestReadIndex = releases.value.findIndex((r) => r.date == date);
if (latestReadIndex < 0) {
  nbNew.value = releases.value.length;
} else {
  nbNew.value = latestReadIndex;
  if (releases.value[latestReadIndex].version != version) {
    nbNew.value++;
  }
}

const refreshTokens = () =>
  authStore.refreshToken().then(() => {
    accessToken.value = TokenService.getAccessToken();
    refreshToken.value = TokenService.getRefreshToken();
  });

const copyToClipboard = (text) => navigator.clipboard.writeText(text);
</script>

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
                    >{{ !(k % 2) ? t : "" }}<em v-if="k % 2">{{ t }}</em></span
                  >
                </li>
              </ul>
            </div>
            <button v-if="!all" class="btn btn-primary" @click="all = true">Tout afficher</button>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>A propos</h3>
          </div>
          <div class="card-body">
            <h1>GestSIS</h1>
            <p>Application métier pour la gestion d'un service d'incendie et de secours.</p>
            <p>Auteur : Bastien Wermeille</p>
            <p>
              Code source :
              <a href="https://github.com/GestSIS" target="_blank">
                <font-awesome-icon :icon="['fab', 'github']" /> GitHub
              </a>
            </p>
            <p>GestSIS © {{ new Date().getFullYear() }} - Tous droits réservés</p>
          </div>
        </div>
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>Contribuer</h3>
          </div>
          <div class="card-body">
            <p>
              Tu souhaites contribuer au projet ? Consulte le
              <a
                href="https://github.com/GestSIS/GestSIS_dev_docker/blob/main/CONTRIBUTING.md"
                target="_blank"
                >guide de contribution</a
              >
              sur GitHub.
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
              <a target="_blank" href="https://anydesk.com/fr/downloads/thank-you?dv=win_exe"
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
              <button class="btn btn-primary" @click="refreshTokens">Refresh tokens</button>
            </div>
            <div class="mb-3">
              <label for="copy-to-clipboard" class="form-label">Access Token</label>
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
                <label for="copy-to-clipboard" class="form-label">Refresh Token</label>
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
