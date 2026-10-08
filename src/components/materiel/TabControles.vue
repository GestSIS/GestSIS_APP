<script setup>
import NavigationControles from "./NavigationControles.vue";
import ControleDetail from "./ControleDetail.vue";
import ListeArticlePourControle from "./ListeArticlePourControle.vue";

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <div class="row nested-container">
    <div class="col-12 col-md-3 custom-scroll-column">
      <suspense>
        <navigation-controles />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
    <div class="col-12 col-md-9 custom-scroll-column">
      <div v-if="parseInt(id) > 0" class="row">
        <div class="col-12">
          <suspense>
            <controle-detail :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
        <div class="col-12">
          <suspense>
            <liste-article-pour-controle :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
      </div>
      <div v-else class="card">
        <div class="card-header">
          <h5 class="m-0">Aucun contrôle sélectionné</h5>
        </div>
        <div class="card-body">Sélectionnez un contrôle dans la liste de gauche</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins/breakpoints";

// Desktop : comme PageSapeurs, la navigation et la liste d'articles
// défilent chacune dans leur colonne (hauteur fournie par PageMateriel).
@include media-breakpoint-up(md) {
  .nested-container {
    height: 100%;
    overflow: hidden;
  }

  .custom-scroll-column {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
