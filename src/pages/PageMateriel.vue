<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Certains onglets (ex. Par emplacement) gèrent eux-mêmes le scroll de leurs
// colonnes (meta `pleineHauteur` de la route) : la page doit alors occuper
// exactement la hauteur disponible.
const pleineHauteur = computed(() => route.meta.pleineHauteur === true);
</script>

<template>
  <div class="container-fluid" :class="{ 'custom-container': pleineHauteur }">
    <div class="row">
      <div class="col-md-6 col-12">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Matériel</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row" :class="{ 'nested-container': pleineHauteur }">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            {
              to: { name: 'materiel-tableau-bord' },
              texte: 'Tableau de bord',
              exact: false,
            },
            {
              to: { name: 'materiel-par-type' },
              texte: 'Par type',
              exact: false,
            },
            {
              to: { name: 'materiel-par-emplacement' },
              texte: 'Par emplacement',
              exact: false,
            },
            {
              to: { name: 'materiel-par-sapeur' },
              texte: 'Par sapeur',
              exact: false,
            },
            {
              to: { name: 'materiel-lavages' },
              texte: 'Lavages',
              exact: false,
            },
            {
              to: { name: 'materiel-controles' },
              texte: 'Contrôles & Maintenances',
              exact: false,
            },
          ]"
        />
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <Suspense>
              <router-view />
              <template #fallback>Chargement...</template>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins/breakpoints";

@include media-breakpoint-up(md) {
  .custom-container {
    display: flex;
    flex-flow: column;
    overflow: hidden;
  }

  .nested-container {
    overflow: hidden;

    > .col-md-12 {
      display: flex;
      flex-flow: column;
      height: 100%;
    }

    .tab-content {
      flex: 1;
      min-height: 0;
    }

    .tab-pane {
      height: 100%;
    }
  }
}
</style>
