<script setup>
import { computed, ref } from 'vue';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useStore } from 'vuex';
import ArticleService from '../../services/materiel/ArticleService';

const { data } = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const errors = ref({});
const date = ref(Date.now());
const emplacement_id = ref(null);

const store = useStore();
const emplacementStore = useEmplacementStore();
const emplacements = computed(() => emplacementStore.liste);

await emplacementStore.fetchEmplacements();

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
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Retour matériel</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
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
      <base-select :options="emplacements" v-model="emplacement_id" />
      <!-- TODO: Retour partiel de matériel -->
      <!-- <div v-if="data?.materiel && !data?.materiel?.uuid" class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          id="quantite"
          v-model="activeAttribution.quantite"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.quantite'] }"
          min="1"
          :max="data?.materiel?.quantite"
        />
      </div> -->
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

<style scoped></style>
