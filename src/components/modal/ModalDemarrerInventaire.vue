<script setup>
import { computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { toLocalIsoDate } from "../../tools/index.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useSubmit } from "../../composables/useSubmit.js";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";

// data : { emplacementId?: number } (emplacement présélectionné)
const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const { closeModal } = useModalStore();
const router = useRouter();
const emplacementStore = useEmplacementStore();
const inventaireStore = useInventaireStore();

await emplacementStore.fetchEmplacements();

const today = toLocalIsoDate();
const form = reactive({
  emplacement_id: data?.emplacementId ?? null,
  designation: "",
  date: today,
});

const emplacementChoisi = computed(() =>
  emplacementStore.liste.find((e) => e.id === form.emplacement_id),
);

// Désignation proposée d'après l'emplacement, tant que l'utilisateur ne l'a pas modifiée.
const designationProposee = (emplacement) =>
  emplacement ? `Inventaire ${emplacement.designation}` : "";
watch(
  emplacementChoisi,
  (nouveau, ancien) => {
    if (form.designation === "" || form.designation === designationProposee(ancien)) {
      form.designation = designationProposee(nouveau);
    }
  },
  { immediate: true },
);

const save = async () => {
  const { ok, data: inventaire } = await submit(
    () => inventaireStore.demarrerInventaire({ ...form, designation: form.designation.trim() }),
    "Impossible de démarrer l'inventaire",
  );
  if (ok) {
    callback();
    closeModal();
    await router.push({ name: "materiel-inventaire-details", params: { id: inventaire.id } });
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Démarrer un inventaire</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <p class="text-body-secondary">
        L'inventaire couvre l'emplacement choisi et tous ses sous-emplacements actifs.
      </p>
      <select-emplacement
        v-model="form.emplacement_id"
        :required="true"
        :filtre="(e) => !!e.statut"
        label="Emplacement"
      />
      <div v-if="errors['emplacement_id']" class="text-danger small mt-1">
        {{ errors["emplacement_id"][0] }}
      </div>
      <div class="mb-3 mt-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          type="text"
          required
          maxlength="255"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
        <div v-if="errors['designation']" class="invalid-feedback">
          {{ errors["designation"][0] }}
        </div>
      </div>
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          required
          :max="today"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
        <div v-if="errors['date']" class="invalid-feedback">{{ errors["date"][0] }}</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting || !form.emplacement_id || form.designation.trim() === ''"
      >
        Démarrer
      </button>
    </div>
  </form>
</template>
