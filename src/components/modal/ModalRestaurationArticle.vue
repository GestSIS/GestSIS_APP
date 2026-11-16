<script setup>
import { computed, ref } from "vue";
import ArticleService from "../../services/materiel/ArticleService";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { useSubmit } from "../../composables/useSubmit.js";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";

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
const materielTypeStore = useMaterielTypeStore();

await Promise.all([emplacementStore.fetchEmplacements(), materielTypeStore.fetchMaterielTypes()]);

// Un véhicule (type qui est lui-même un emplacement) n'est pas rangé : son
// emplacement est simplement réactivé, aucun emplacement n'est à choisir.
const estVehicule = computed(
  () =>
    !!materielTypeStore.liste.find((t) => t.id === data.article.materiel_type_id)?.est_emplacement,
);

// Le dernier emplacement n'est présélectionné que s'il est encore actif.
const dernierEmplacement = emplacementStore.liste.find((e) => e.id === data.article.emplacement_id);
const emplacementId = ref(dernierEmplacement?.statut ? dernierEmplacement.id : null);
const erreurEmplacement = computed(
  () => errors.value["emplacement_id"]?.[0] ?? errors.value["emplacementId"]?.[0],
);

const save = async () => {
  const { ok } = await submit(
    () =>
      ArticleService.restaurerArticles(
        [data.article.id],
        estVehicule.value ? null : emplacementId.value,
      ),
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
      <p v-if="estVehicule">Le véhicule et son emplacement seront réactivés.</p>
      <template v-else>
        <p>Choisissez l'emplacement dans lequel remettre l'article.</p>
        <select-emplacement
          v-model="emplacementId"
          :required="true"
          :filtre="(e) => !!e.statut"
          label="Emplacement"
        />
        <div v-if="erreurEmplacement" class="text-danger small mt-1">
          {{ erreurEmplacement }}
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button
        :disabled="isSubmitting || (!estVehicule && !emplacementId)"
        type="button"
        class="btn btn-primary"
        @click="save"
      >
        Restaurer
      </button>
    </div>
  </div>
</template>
