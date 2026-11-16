<script setup>
import { computed, ref } from "vue";
import ArticleService from "../../services/materiel/ArticleService";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useSubmit } from "../../composables/useSubmit.js";

// data : { article: Article } (article supprimé)
const { data, callback } = defineProps({
  data: {
    type: Object,
    required: true,
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const { closeModal } = useModalStore();
const emplacementStore = useEmplacementStore();

await emplacementStore.fetchEmplacements();

// Le dernier emplacement n'est présélectionné que s'il est encore actif.
const dernierEmplacement = emplacementStore.liste.find((e) => e.id === data.article.emplacement_id);
const emplacementId = ref(dernierEmplacement?.statut ? dernierEmplacement.id : null);
const erreurEmplacement = computed(
  () => errors.value["emplacement_id"]?.[0] ?? errors.value["emplacementId"]?.[0],
);

const save = async () => {
  const { ok } = await submit(
    () => ArticleService.restaurerArticles([data.article.id], emplacementId.value),
    "Une erreur est survenue",
    "Restauration effectuée.",
  );
  if (ok) {
    callback();
    closeModal();
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Restaurer</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <p>Choisissez l'emplacement dans lequel remettre l'article.</p>
      <select-emplacement
        v-model="emplacementId"
        :required="true"
        :filtre="(e) => !!e.statut"
        label="Emplacement"
      />
      <div v-if="erreurEmplacement" class="text-danger small mt-1">{{ erreurEmplacement }}</div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button
        :disabled="isSubmitting || !emplacementId"
        type="button"
        class="btn btn-primary"
        @click="save"
      >
        Restaurer
      </button>
    </div>
  </div>
</template>
