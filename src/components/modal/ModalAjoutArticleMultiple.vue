<script setup>
import { computed, inject, onMounted, ref, useTemplateRef } from 'vue';

import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';

import ArticleCreation from '../materiel/ArticleCreation.vue';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';

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

const awn = inject('awn');

const errors = ref({});
const activeAttribution = ref({
  emplacement_id: data?.emplacementId ?? null,
  articles: [],
});

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const store = useStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  store.dispatch('fetchListeSapeur'),
]);

const sapeurs = computed(() => store.state.sapeur.liste);

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
        <!-- <div class="col-6">
          {{ activeAttribution.emplacement_id }}
          <select-emplacement
            label="Emplacement"
            class="mb-3"
            v-model="activeAttribution.emplacement_id"
          />
        </div> -->
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
