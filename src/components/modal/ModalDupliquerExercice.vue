<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useModalStore } from "../../stores/common/Modal.js";
import { useExerciceStore } from "../../stores/exercice/Exercice.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useSubmit } from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const exerciceStore = useExerciceStore();
const exerciceComptableStore = useExerciceComptableStore();
await exerciceComptableStore.fetchExercicesComptables();

// La copie reste dans l'exercice comptable de l'original
const exerciceComptable = computed(() =>
  exerciceComptableStore.liste.find((e) => e.id == data.exercice_comptable_id),
);

const form = reactive({
  date: "",
  designation: data.designation,
  garder_sapeurs: true,
});

const router = useRouter();
const { closeModal } = useModalStore();
const { errors, isSubmitting, submit } = useSubmit();
const duplicate = async () => {
  const { ok, data: created } = await submit(
    () => exerciceStore.dupliquerExercice(data.id, form),
    "Erreur lors de la duplication",
    "Exercice dupliqué.",
  );
  if (ok) {
    closeModal();
    router.push({ name: "exercice-details", params: { id: created.id } });
  }
};
</script>

<template>
  <form @submit.prevent="duplicate">
    <div class="modal-header">
      <h5 class="modal-title">Dupliquer l'exercice</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <p>
        Une copie de <strong>{{ data.designation }}</strong> est créée à la date choisie. Les
        présences, excuses et travaux ne sont pas copiés.
      </p>
      <div class="mb-3">
        <label for="m-dup-exe-date">Date</label>
        <input
          id="m-dup-exe-date"
          v-model="form.date"
          type="date"
          required
          :min="exerciceComptable?.debut"
          :max="exerciceComptable?.fin"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <div class="mb-3">
        <label for="m-dup-exe-des">Désignation</label>
        <input
          id="m-dup-exe-des"
          v-model="form.designation"
          type="text"
          required
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="form-check form-switch">
        <input
          id="m-dup-exe-sapeurs"
          v-model="form.garder_sapeurs"
          class="form-check-input"
          type="checkbox"
          role="switch"
        />
        <label class="form-check-label" for="m-dup-exe-sapeurs">
          Garder les sapeurs convoqués
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">Dupliquer</button>
    </div>
  </form>
</template>
