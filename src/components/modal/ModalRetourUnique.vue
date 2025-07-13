<script setup>
import { ref } from 'vue';
import ArticleService from '../../services/materiel/ArticleService';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';
import { useModalStore } from '../../stores/common/Modal.js';

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

const errors = ref({});
const date = ref(new Date().toISOString().slice(0, 10));
const emplacement_id = ref(null);

const { closeModal } = useModalStore();
const save = async () =>
  ArticleService.retourArticles(emplacement_id.value, {
    date: date.value,
    articleIds: [data.id],
  })
    .then(() => {
      callback();
      closeModal();
    })
    .catch((err) => (errors.value = err));
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Retour matériel</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body overflow-visible">
      <div class="mb-3">
        <label for="date">Date du retour</label>
        <input
          id="date"
          v-model="date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.date'] }"
        />
      </div>
      <select-emplacement
        v-model="emplacement_id"
        label="Emplacement"
        class="mb-3"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        Valider
      </button>
    </div>
  </div>
</template>

<style>
:root {
  --vs-option-padding: 4px 6px;
}
</style>
