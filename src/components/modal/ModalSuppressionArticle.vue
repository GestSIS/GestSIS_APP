<script setup>
import { computed, ref } from "vue";
import { toLocalIsoDate } from "../../tools/index.js";
import ArticleService from "../../services/materiel/ArticleService";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSubmit } from "../../composables/useSubmit.js";

// data : { articles: Article[] } ou { lot: { materiel_type_id, emplacement_id, compartiment, nbPieces } }
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

const today = toLocalIsoDate();
const date = ref(today);
const remarque = ref("");
const estLot = computed(() => !!data.lot);
const quantite = ref(data.lot?.nbPieces ?? 1);

const save = async () => {
  const remarqueValue = remarque.value.trim() === "" ? null : remarque.value.trim();
  const { ok } = await submit(
    () =>
      estLot.value
        ? ArticleService.supprimerLot({
            materiel_type_id: data.lot.materiel_type_id,
            emplacement_id: data.lot.emplacement_id,
            compartiment: data.lot.compartiment,
            quantite: quantite.value,
            date: date.value,
            remarque: remarqueValue,
          })
        : ArticleService.supprimerArticles(
            data.articles.map((a) => a.id),
            date.value,
            remarqueValue,
          ),
    "Une erreur est survenue",
    "Suppression effectuée.",
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
      <h5 class="modal-title">Supprimer</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <p>L'article restera consultable dans l'historique.</p>
      <div v-if="estLot" class="mb-3">
        <label for="quantite">Quantité à supprimer (max. {{ data.lot.nbPieces }})</label>
        <input
          id="quantite"
          v-model.number="quantite"
          type="number"
          min="1"
          :max="data.lot.nbPieces"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
        />
        <div v-if="errors['quantite']" class="invalid-feedback">{{ errors["quantite"][0] }}</div>
      </div>
      <div class="mb-3">
        <label for="date">Date de suppression</label>
        <input
          id="date"
          v-model="date"
          type="date"
          :max="today"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
        <div v-if="errors['date']" class="invalid-feedback">{{ errors["date"][0] }}</div>
      </div>
      <div class="mb-3">
        <label for="remarque">Remarque (facultative)</label>
        <textarea
          id="remarque"
          v-model="remarque"
          rows="2"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        ></textarea>
        <div v-if="errors['remarque']" class="invalid-feedback">{{ errors["remarque"][0] }}</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button :disabled="isSubmitting" type="button" class="btn btn-danger" @click="save">
        Supprimer
      </button>
    </div>
  </div>
</template>
