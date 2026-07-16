<script setup>
import { reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  cumulable: false,
  actif: true,
  ...data,
});

const fonctionStore = useFonctionStore();

const { closeModal } = useModalStore();
const save = async () => {
  (form?.id ? fonctionStore.updateFonction : fonctionStore.addFonction)(form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} une fonction</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="form.tri"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          id="nom"
          v-model="form.nom"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          id="abreviation"
          v-model="form.abreviation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-cumulable-modal"
            v-model="form.cumulable"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-cumulable-modal">Cumulable</label>
        </div>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-actif-modal"
            v-model="form.actif"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-actif-modal">Actif</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
