<script setup>
import { computed, inject, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import ArticleService from '../../services/materiel/ArticleService';
import { useModalStore } from '../../stores/common/Modal.js';

const awn = inject('awn');
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

const sapeurStore = useSapeurStore();
await sapeurStore.fetchListeSapeur();
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const errors = ref({});
const form = ref({
  date: new Date().toISOString().slice(0, 10),
  sapeur_id: null,
  id: data?.id,
});

const { closeModal } = useModalStore();
const save = async () => {
  ArticleService.attribuerArticles(form.value.sapeur_id, {
    date: form.value.date,
    articleIds: [form.value.id],
  })
    .then(() => {
      closeModal();
      callback();
    })
    .catch((err) => {
      errors.value = err;
      awn.warning(err.message ?? "Erreur lors de l'attribution du matériel");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="date">Date attribution</label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.date'] }"
        />
      </div>
      <base-select
        v-model="form.sapeur_id"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
        :select-class="{ 'is-invalid': errors['attributions.0.sapeur_id'] }"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">Attribuer</button>
    </div>
  </form>
</template>
