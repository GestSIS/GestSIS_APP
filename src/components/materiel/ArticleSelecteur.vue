<script setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  useTemplateRef,
} from 'vue';

import { useStore } from 'vuex';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import { indexedData } from '../../tools';
import SelectEmplacement from './SelectEmplacement.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const awn = inject('awn');

const selectedArticles = ref([
  {
    id: null,
    materiel_type_id: null,
    emplacement_id: null,
    taille: null,
    remarque: null,
  },
]);

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const store = useStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  store.dispatch('fetchListeSapeur'),
]);

const types = computed(() => materielTypeStore.liste);
const indexedTypes = computed(() => indexedData(types.value));
const emplacements = computed(() => emplacementStore.liste);
const indexedEmplacements = computed(() => indexedData(emplacements.value));
const articles = ref(await ArticleService.getAttribuable());

// types des articles disponible
const typesDisponible = computed(() => {
  const ids = new Set(articles.value.map((a) => a.materiel_type_id));
  return types.value.filter((t) => ids.has(t.id));
});

const articleReference = useTemplateRef(`articles-reference`);
const addEmptyLine = () => {
  selectedArticles.value.push({
    materiel_type_id: null,
    numero: null,
    taille: null,
    remarque: null,
  });

  nextTick(() => {
    articleReference.value[articleReference.value.length - 1].focus();
  });
};

const selectEmplacement = (item, value) => {
  // TODO: a implémenter
};
const selectMaterielTypeNumerote = (item, value) => {
  // TODO: a implémenter
  // Select première combinaison valable
  // const materiel = materielNumeroteDispo.find(
  //   (m) => m.materiel_type_id == value,
  // );
  // item.id = materiel?.id;
  // item.taille = materiel?.taille;
  // item.numero = materiel?.numero;
  // item.remarque = materiel?.remarque;
};
const selectNumero = (item, value) => {
  // TODO: a implémenter
  // const materiel = materielNumeroteDispo.find((m) => m.id == value);
  // item.taille = materiel?.taille;
  // item.numero = materiel?.numero;
  // item.id = materiel?.id;
  // item.remarque = materiel?.remarque;
};
const selectMaterielTypeGenerique = (item) => {
  // TODO: a implémenter
  // item.quantite = 1;
};
</script>

<template>
  <table class="table table-sm">
    <thead>
      <tr>
        <th class="col-4">Matériel type</th>
        <th class="col-2">Numéro</th>
        <th class="col-2">Taille</th>
        <th class="col-2">Emplacement</th>
        <th>Remarque</th>
        <th class="col-1"></th>
      </tr>
    </thead>
    <tbody v-if="articles.length === 0">
      <tr>
        <td colspan="6">
          Aucun article dans l'inventaire, utilisez l'attribution hors
          inventaire ou ajouter du matériel au préalable.
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr v-for="(item, index) in selectedArticles" :key="index">
        <td>
          <base-select
            ref="articles-reference"
            v-model="item.materiel_type_id"
            :options="typesDisponible"
            base-option="&lt;Matériel type&gt;"
            @update:model-value="
              (value) => selectMaterielTypeNumerote(item, value)
            "
          />
        </td>
        <td>
          <base-select
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.id"
            :options="
              articles.filter(
                (a) => a.materiel_type_id == item.materiel_type_id,
              )
            "
            base-option="&lt;Aucun matériel correspondant&gt;"
            display-key="numero"
            @update:model-value="(value) => selectNumero(item, value)"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Matériel non numéroté'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td>
          <base-select
            v-if="indexedTypes[item.materiel_type_id]?.est_taillee"
            v-model="item.id"
            :options="
              articles.filter(
                (a) => a.materiel_type_id == item.materiel_type_id,
              )
            "
            base-option="&lt;Aucun matériel correspondant&gt;"
            display-key="taille"
            @update:model-value="(value) => selectNumero(item, value)"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Taille unique'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td>
          <!-- TODO: v-model -->
          <select-emplacement v-model="item.emplacement_id" />
          <!-- <base-select
            v-model="item.id"
            :options="
              articles.filter(
                (a) => a.materiel_type_id == item.materiel_type_id
              )
            "
            base-option="&lt;Aucun matériel correspondant&gt;"
            display-key="emplacement_id"
            @update:model-value="(value) => selectNumero(item, value)"
          /> -->
          <!-- {{ articles }} -->
        </td>
        <td>{{ item.remarque }}</td>
        <td>
          <button
            class="btn btn-outline-danger border-0"
            @click="selectedArticles.splice(index, 1)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </td>
      </tr>
      <tr>
        <td colspan="6">
          <button class="btn btn-outline-primary" @click="addEmptyLine">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
