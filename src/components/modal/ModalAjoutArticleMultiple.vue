<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";

import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { indexedData } from "../../tools/index.js";

import ArticleService from "../../services/materiel/ArticleService";
import ArticleCreation from "../materiel/ArticleCreation.vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";

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
const sapeurStore = useSapeurStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  sapeurStore.fetchListeSapeur(),
]);

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));

const { closeModal } = useModalStore();
const save = async () => {
  if (!activeAttribution.value.emplacement_id) {
    awn.warning("Veuillez sélectionner un emplacement");
    return;
  }

  // Création du matériel : un article qui est lui-même un emplacement (ex: véhicule)
  // n'est pas rangé dans l'emplacement ciblé par ce formulaire, il garde son propre
  // emplacement (saisi ligne par ligne dans article-creation). Pour les autres, la
  // clé `emplacement` de la ligne n'a pas de sens ici et n'est pas transmise.
  const articles = activeAttribution.value.articles.map(({ emplacement, ...a }) =>
    indexedTypes.value[a.materiel_type_id]?.est_emplacement
      ? { ...a, emplacement, emplacement_id: null, sapeur_id: null }
      : { ...a, emplacement_id: activeAttribution.value.emplacement_id, sapeur_id: null },
  );
  ArticleService.creerArticles(articles)
    .then(() => {
      callback();
      closeModal();
    })
    .catch((error) => awn.alert(error.message ?? "Erreur lors de l'attribution du matériel"));
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Ajouter du matériel</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-md-12">
          <article-creation
            v-model="activeAttribution.articles"
            :article-types="materielTypeStore.liste"
          />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save">Ajouter</button>
    </div>
  </div>
</template>
