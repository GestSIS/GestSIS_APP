<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import ArticleService from '../../services/materiel/ArticleService';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';

const { data } = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const errors = ref({});
const date = ref(new Date().toISOString().slice(0, 10));
const emplacement_id = ref(null);

const store = useStore();

const close = () => store.commit('HIDE_MODAL');
const save = async () =>
  ArticleService.retourArticles({
    date: date.value,
    emplacement_id: emplacement_id.value,
    articleIds: [data.id],
  })
    .then(close)
    .catch((err) => (errors.value = err));
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Retour matériel</h5>
      <button type="button" class="btn-close" @click="close"></button>
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
      <SelectEmplacement v-model="emplacement_id" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="close">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
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
