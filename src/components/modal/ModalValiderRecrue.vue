<script setup>
import { ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { toLocalIsoDate } from "../../tools/index.js";

const { callback } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
});

const { closeModal } = useModalStore();
const incorporation = ref(toLocalIsoDate(new Date()));
const errors = ref({});

const submit = async () => {
  try {
    const close = await (callback(incorporation.value) ?? Promise.resolve(true));
    if (close ?? true) {
      closeModal();
    }
  } catch (err) {
    errors.value = err ?? {};
  }
};
</script>

<template>
  <form @submit.prevent="submit">
    <div class="modal-header">
      <h5 class="modal-title">Valider la recrue</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <p>La recrue devient un sapeur actif à partir de la date d'incorporation choisie.</p>
      <div class="mb-3">
        <label for="incorporation">Date d'incorporation</label>
        <input
          id="incorporation"
          v-model="incorporation"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['incorporation'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Annuler</button>
      <button type="submit" class="btn btn-primary">Valider</button>
    </div>
  </form>
</template>
