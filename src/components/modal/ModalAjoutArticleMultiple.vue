<script setup>
import { ref } from 'vue';
import useNotification from '../../composables/useNotification.js';

import { useModalStore } from '../../stores/common/Modal.js';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';

import ArticleService from '../../services/materiel/ArticleService';
import ArticleCreation from '../materiel/ArticleCreation.vue';

const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const awn = useNotification();

const activeAttribution = ref({
  emplacement_id: data?.emplacementId ?? null,
  articles: [],
});

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  sapeurStore.fetchListeSapeur(),
]);

const { closeModal } = useModalStore();
const save = async () => {
  if (!activeAttribution.value.emplacement_id) {
    awn.warning('Veuillez sélectionner un sapeur');
    return;
  }

  // Création du matériel
  const articles = activeAttribution.value.articles.map((a) => ({
    emplacement_id: activeAttribution.value.emplacement_id,
    sapeur_id: null,
    ...a,
  }));
  ArticleService.creerArticles(articles)
    .then((data) => {
      callback();
      closeModal();
    })
    .catch((error) =>
      awn.alert(error.message ?? "Erreur lors de l'attribution du matériel"),
    );
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter du matériel</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-md-12">
          <article-creation v-model="activeAttribution.articles" />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        Ajouter
      </button>
    </div>
  </div>
</template>
