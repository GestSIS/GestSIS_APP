<script setup>
import { computed, inject, onMounted, ref, useTemplateRef } from 'vue';

import { useStore } from 'vuex';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';

import ArticleCreation from '../materiel/ArticleCreation.vue';
import ArticleSelecteur from '../materiel/ArticleSelecteur.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const awn = inject('awn');
const sapeur = useTemplateRef('sapeur');
onMounted(() => {
  sapeur.value.focus();
});

const errors = ref({});
const depuisInventaire = ref(true);
const activeAttribution = ref({
  date: new Date().toISOString().slice(0, 10),
  sapeur_id: data?.sapeurId ?? null,
  articlesDepuisInventaire: [],
  articlesHorsInventaire: [],
});

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const store = useStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  store.dispatch('fetchListeSapeur'),
]);

const sapeurs = computed(() => store.state.sapeur.liste);

const save = async () => {
  if (!activeAttribution.value.sapeur_id) {
    awn.warning('Veuillez sélectionner un sapeur');
    return;
  }

  if (depuisInventaire.value) {
    const attribution = {
      date: activeAttribution.value.date,
      articleIds: activeAttribution.value.articlesDepuisInventaire.map(
        (a) => a.id,
      ),
    };
    // TODO: Attribution du matériel
    ArticleService.attribuerArticles(
      activeAttribution.value.sapeur_id,
      attribution,
    );
  } else {
    // TODO: Création du matériel
    const articles = activeAttribution.value.articlesHorsInventaire.map(
      (a) => ({
        sapeur_id: activeAttribution.value.sapeur_id,
        emplacement_id: null,
        date: activeAttribution.value.date,
        ...a,
      }),
    );
    ArticleService.creerArticles(articles);
  }
};
const close = () => {
  store.commit('HIDE_MODAL');
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6 mb-3">
          <label for="date">Date attribution</label>
          <input
            id="date"
            v-model="activeAttribution.date"
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attributions.0.date'] }"
          />
        </div>
        <div class="col-6">
          <base-select
            ref="sapeur"
            v-model="activeAttribution.sapeur_id"
            class="mb-3"
            label="Sapeur"
            display-key="nom_prenom"
            :options="sapeurs"
            :select-class="{ 'is-invalid': errors['attributions.0.sapeur_id'] }"
          />
        </div>
        <div class="col-md-12 mb-3">
          <div class="form-check form-switch">
            <input
              id="switch-mode-attribution"
              v-model="depuisInventaire"
              class="form-check-input"
              type="checkbox"
              role="switch"
            />
            <label class="form-check-label" for="switch-mode-attribution"
              >Attribuer depuis l'inventaire
            </label>
          </div>
        </div>
        <div class="col-md-12">
          <article-selecteur
            v-show="depuisInventaire"
            v-model="activeAttribution.articlesDepuisInventaire"
          />
          <article-creation
            v-show="!depuisInventaire"
            v-model="activeAttribution.articlesHorsInventaire"
          />
        </div>
      </div>
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
