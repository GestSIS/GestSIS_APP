<script setup>
import ListeArticlePourEmplacement from "./ListeArticlePourEmplacement.vue";
import NavigationParEmplacement from "./NavigationParEmplacement.vue";
import EmplacementDetail from "./EmplacementDetail.vue";

const { id } = defineProps({
  id: {
    type: String,
    required: false,
    default: "",
  },
});

// TODO: Redirect au premier élément si id=null et que des emplacements existent ?
</script>

<template>
  <div class="row nested-container">
    <div class="col-12 col-md-3 custom-scroll-column">
      <suspense>
        <navigation-par-emplacement />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
    <div class="col-12 col-md-9 custom-scroll-column">
      <div v-if="parseInt(id) > 0" class="row">
        <div class="col-12">
          <suspense>
            <emplacement-detail :id="id" />
            <template #fallback>Chargement...</template>
          </suspense>
        </div>
        <div class="col-12">
          <Suspense>
            <liste-article-pour-emplacement :id="id" />
            <template #fallback>Chargement...</template>
          </Suspense>
        </div>
      </div>
      <base-card title="Aucun emplacement sélectionné" v-else>
        <template #body>Sélectionnez un emplacement dans la liste de gauche</template>
      </base-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins/breakpoints";

:deep(table button.btn),
:deep(table a.btn) {
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.m-td-0 > td) {
  padding: 0 !important;
}

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
