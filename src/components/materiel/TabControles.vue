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
  <div class="row">
    <div class="col-12 col-md-3">
      <suspense>
        <navigation-controles />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
    <div class="col-12 col-md-9">
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
