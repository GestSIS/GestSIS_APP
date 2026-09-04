<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth.js";
import { DOC_URL } from "../http/Env.js";
import screenshotDashboard from "../assets/screenshot-dashboard-light.png";
import screenshotMobileLight from "../assets/screenshot-dashboard-mobile-light.png";

const authStore = useAuthStore();

const decoded = atob("c3VwcG9ydEBnZXN0c2lzLmNo");
const prefix = atob("bWFpbHRvOg==");

const router = useRouter();

const login = () => router.push({ path: authStore.isLoggedIn ? "accueil" : "login" });

const fonctionnalites = [
  {
    icon: ["fas", "user"],
    titre: "Effectif",
    texte: "Gérez les sapeurs, civils et recrues de votre corps ainsi que leur parcours.",
  },
  {
    icon: ["fas", "toolbox"],
    titre: "Matériel",
    texte: "Suivez l'inventaire, l'attribution et l'emplacement de votre matériel.",
  },
  {
    icon: ["fas", "calendar-alt"],
    titre: "Exercices & présences",
    texte: "Planifiez exercices et séances, gérez convocations et présences.",
  },
  {
    icon: ["fas", "fire-extinguisher"],
    titre: "Interventions",
    texte: "Journalisez vos interventions et leur suivi administratif.",
  },
  {
    icon: ["fas", "calculator"],
    titre: "Comptabilité",
    texte: "Gérez indemnités, écritures comptables et exercices comptables.",
  },
  {
    icon: ["far", "chart-bar"],
    titre: "Statistiques",
    texte: "Suivez l'activité de votre corps au travers de statistiques détaillées.",
  },
];
</script>

<template>
  <div>
    <header>
      <div class="navbar navbar-dark bg-dark">
        <div class="container d-flex justify-content-between">
          <a href="#" class="navbar-brand">gestsis.ch</a>
          <a class="text-white" :href="prefix + decoded">{{ decoded }}</a>
        </div>
      </div>
    </header>
    <main role="main">
      <section class="jumbotron text-center">
        <div class="container">
          <h1 class="jumbotron-heading">GestSIS</h1>
          <p class="lead text-muted">
            Programme de gestion spécialement élaboré pour vous aider à gèrer les données de votre
            SIS.
          </p>
          <p>
            <button class="btn btn-primary me-1" @click="login">Accès GestSIS 2.0</button>
          </p>
        </div>
      </section>

      <div class="container">
        <div class="row row-cols-1 row-cols-md-3 g-4 py-5">
          <div v-for="f in fonctionnalites" :key="f.titre" class="col text-center">
            <font-awesome-icon :icon="f.icon" class="feature-icon" />
            <h3 class="h5">{{ f.titre }}</h3>
            <p class="text-muted">{{ f.texte }}</p>
          </div>
        </div>
      </div>

      <div class="album text-muted">
        <div class="container text-center py-5">
          <h2>Aperçu de l'application</h2>
          <div class="d-flex justify-content-center align-items-end flex-wrap gap-4 mt-4">
            <img
              :src="screenshotDashboard"
              alt="Aperçu du tableau de bord GestSIS, en mode clair sur ordinateur"
              class="screenshot rounded shadow-sm"
            />
            <img
              :src="screenshotMobileLight"
              alt="Aperçu du tableau de bord GestSIS, en mode clair sur mobile"
              class="screenshot rounded shadow-sm"
            />
          </div>
        </div>
      </div>

      <div class="container text-center py-5">
        <h2>Open source</h2>
        <p class="text-muted">
          GestSIS est développé en open source, son code source est librement consultable.
        </p>
        <a href="https://github.com/GestSIS" target="_blank" class="btn btn-outline-secondary me-2">
          <font-awesome-icon :icon="['brands', 'github']" class="me-1" />
          Voir sur GitHub
        </a>
        <a v-if="DOC_URL" :href="DOC_URL" target="_blank" class="btn btn-outline-secondary">
          <font-awesome-icon :icon="['far', 'question-circle']" class="me-1" />
          Documentation
        </a>
      </div>

      <div class="album text-muted">
        <div class="container text-center py-5">
          <font-awesome-icon :icon="['fas', 'mobile-screen']" class="feature-icon" />
          <h2 id="C2">GestSIS Mobile</h2>
          <p class="lead">
            Saisissez vos rapports d'intervention ainsi que vos présences aux exercices en mode
            déconnecté, directement sur une tablette ou un smartphone.
          </p>
          <a
            class="btn btn-primary"
            href="https://play.google.com/store/apps/details?id=ch.gestsis.app"
            target="_blank"
          >
            <font-awesome-icon :icon="['brands', 'google-play']" class="me-1" />
            Télécharger sur Google Play
          </a>
        </div>
      </div>
    </main>

    <footer class="text-muted">
      <div class="container">
        <p>All rights reserved © {{ new Date().getFullYear() }} GestSIS</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.jumbotron {
  padding-top: 6rem;
  padding-bottom: 6rem;
  margin-bottom: 0;
  background-color: var(--bs-body-bg);
}

.jumbotron p:last-child {
  margin-bottom: 0;
}

.jumbotron-heading {
  font-weight: 300;
}

.jumbotron .container {
  max-width: 40rem;
}

.album:first-of-type {
  padding-top: 3rem;
}

.album {
  background-color: var(--bs-tertiary-bg);
}

.feature-icon {
  font-size: 2.5rem;
  color: var(--bs-primary-text-emphasis);
  margin-bottom: 1rem;
}

.screenshot {
  border: 1px solid var(--bs-border-color);
  height: 400px;
  width: auto;
  max-width: 100%;
}

footer {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

footer p {
  margin-bottom: 0.25rem;
}

.align-vertical {
  margin: auto;
}

.img-fetch {
  height: auto;
  max-height: 220px;
  width: 100%;
  display: block;
}

.bg-red {
  background-color: red;
}
</style>
