<script setup>
import { useModalStore } from "../../stores/common/Modal.js";

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

const { closeModal } = useModalStore();

const submit = async (confirm) => {
  const close = await (callback(confirm) ?? Promise.resolve(true));
  if (close ?? true) {
    closeModal();
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ data.title }}</h5>
      <button type="button" class="btn-close" @click="submit(false)"></button>
    </div>
    <div class="modal-body">
      <p>{{ data.question }}</p>
    </div>
    <div class="modal-footer">
      <button autofocus type="button" class="btn btn-secondary" @click="submit(false)">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="submit(true)">Confirmer</button>
    </div>
  </div>
</template>
