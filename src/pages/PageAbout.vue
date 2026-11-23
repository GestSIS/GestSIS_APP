<script setup>
import { safeLocalStorage } from "../tools/storage.js";
import * as data from "../../releases.json";
import { ref } from "vue";

const releases = ref(data.releases);
const all = ref(false);
const nbNew = ref(0);

const date = safeLocalStorage.get("latestReleaseDate") ?? releases.value[0].date;
const version = safeLocalStorage.get("latestSeenVersion") ?? releases.value[0].version;
safeLocalStorage.set("latestReleaseDate", releases.value[0].date);
safeLocalStorage.set("latestSeenVersion", releases.value[0].version);

const latestReadIndex = releases.value.findIndex((r) => r.date == date);
if (latestReadIndex < 0) {
  nbNew.value = releases.value.length;
} else {
  nbNew.value = latestReadIndex;
  if (releases.value[latestReadIndex].version != version) {
    nbNew.value++;
  }
}
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
              <a href="https://github.com/GestSIS" target="_blank" rel="noopener noreferrer">
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
                rel="noopener noreferrer"
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
      </div>
    </div>
  </div>
</template>
