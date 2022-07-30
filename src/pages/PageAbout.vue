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
        <div class="card card-primary card-outline mb-5">
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
                  <span v-for="(t, i) in change.split('`')" :key="i"
                    >{{ !(i % 2) ? t : '' }}<em v-if="i % 2">{{ t }}</em></span
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
        <div class="card card-primary card-outline mb-5">
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
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';
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
    };
  },
  mounted() {
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
};
</script>

<style></style>
