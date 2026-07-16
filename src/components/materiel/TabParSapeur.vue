<script setup>
import NavigationParSapeur from "./NavigationParSapeur.vue";
import ListeArticlePourSapeur from "./ListeArticlePourSapeur.vue";

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

// TODO: Redirect au premier élément si id=null et que des sapeurs existent ?
</script>

<template>
  <div class="row">
    <div class="col-3">
      <suspense>
        <navigation-par-sapeur />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
    <div class="col-9">
      <suspense v-if="parseInt(id) > 0">
        <liste-article-pour-sapeur :id="id" />
        <template #fallback>Chargement...</template>
      </suspense>
      <div v-else class="card">
        <div class="card-header">
          <h5 class="m-0">Aucun sapeur sélectionné</h5>
        </div>
        <div class="card-body">Sélectionnez un sapeur dans la liste de gauche</div>
      </div>
    </div>
  </div>
</template>
