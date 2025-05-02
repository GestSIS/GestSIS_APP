<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';
import ArticleService from '../../services/materiel/ArticleService';

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

const store = useStore();
await store.dispatch('fetchListeSapeur');
const sapeurs = computed(() => store.state.sapeur.liste.filter((s) => s.actif));

const errors = ref({});
const activeAttribution = ref({
  date: new Date().toISOString().slice(0, 10),
  sapeur_id: null,
  id: data?.id,
});

const close = async () => store.commit('HIDE_MODAL');

const save = async () => {
  ArticleService.attribuerArticles(activeAttribution.value.sapeur_id, {
    date: activeAttribution.value.date,
    articleIds: [activeAttribution.value.id],
  })
    .then(() => {
      close();
      callback();
    })
    .catch((errors) => {
      errors.value = errors;
      awn.warning(errors.message ?? "Erreur lors de l'attribution du matériel");
    });
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="date">Date attribution</label>
        <input
          id="date"
          v-model="activeAttribution.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.date'] }"
        />
      </div>
      <base-select
        v-model="activeAttribution.sapeur_id"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
        :select-class="{ 'is-invalid': errors['attributions.0.sapeur_id'] }"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="close">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        Attribuer
      </button>
    </div>
  </div>
</template>
<style scoped></style>
