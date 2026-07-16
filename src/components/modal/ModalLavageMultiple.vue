<script setup>
import { ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import LavageService from "../../services/materiel/LavageService";
import ArticleService from "../../services/materiel/ArticleService";
import ArticleSelecteur from "../materiel/ArticleSelecteur.vue";

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

const errors = ref({});
const activeAttribution = ref({
  date: new Date().toISOString().slice(0, 10),
  articles: [],
});

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();

await Promise.all([materielTypeStore.fetchMaterielTypes(), emplacementStore.fetchEmplacements()]);

const articlesLavable = ref(await ArticleService.getLavable());

const awn = useNotification();
const { closeModal } = useModalStore();
const save = async () => {
  const lavages = activeAttribution.value.articles.map((a) => ({
    date: activeAttribution.value.date,
    article_id: a.id,
  }));
  LavageService.creerLavages(lavages)
    .then((data) => {
      callback();
      closeModal();
    })
    .catch((error) => awn.alert(error.message ?? "Erreur lors de la création des lavages"));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Ajouter des lavages</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6 mb-3">
          <label for="date">Date du lavage</label>
          <input
            id="date"
            v-model="activeAttribution.date"
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attributions.0.date'] }"
          />
        </div>
        <div class="col-md-12">
          <article-selecteur v-model="activeAttribution.articles" :articles="articlesLavable" />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary">Ajouter</button>
    </div>
  </form>
</template>
