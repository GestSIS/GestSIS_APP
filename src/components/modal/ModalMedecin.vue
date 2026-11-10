<script setup>
import { computed, reactive } from "vue";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useMedecinStore } from "../../stores/controleMedical/Medecin.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSubmit } from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  actif: 1,
  ...data,
});

const localiteStore = useLocaliteStore();
const medecinStore = useMedecinStore();
const localites = computed(() => localiteStore.liste);

const { closeModal } = useModalStore();

const save = async () => {
  const { ok } = await submit(async () => {
    if (form.id) {
      await medecinStore.updateMedecin(form);
    } else {
      await medecinStore.addMedecin(form);
    }
  });
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un médecin</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="adresse">Adresse</label>
        <input
          id="adresse"
          v-model="form.adresse"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['adresse'] }"
        />
      </div>
      <base-select
        v-model="form.localite_id"
        placeholder="<Localité>"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="medecin-actif-modal"
            v-model="form.actif"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
          />
          <label class="form-check-label" for="medecin-actif-modal">Actif</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
