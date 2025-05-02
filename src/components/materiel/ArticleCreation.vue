<script setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue';

import { useStore } from 'vuex';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { indexedData } from '../../tools';

const { data, avecCompartiment } = defineProps({
  avecCompartiment: Boolean,
  data: {
    type: Object,
    default: () => {},
  },
});

const articles = defineModel({ default: () => [] });
articles.value.push({
  materiel_type_id: null,
  taille: null,
  remarque: null,
});

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

const articleReference = useTemplateRef(`articles-reference`);
const addEmptyLine = () => {
  articles.value.push({
    compartiment: null,
    materiel_type_id: null,
    numero: null,
    taille: null,
    remarque: null,
    achat: null,
    taille: null,
    remarque: null,
  });

  nextTick(() => {
    articleReference.value[articleReference.value.length - 1].focus();
  });
};

const save = () => {
  console.log('Save is forwarded');
};
</script>

<template>
  <table class="table table-sm">
    <thead>
      <tr>
        <th class="col-4">Matériel type</th>
        <th class="col-2">Numéro</th>
        <th class="col-1">Est etiqueté</th>
        <th class="col-1">Taille</th>
        <th class="col-1">Achat</th>
        <th>Remarque</th>
        <th class="col-1"></th>
      </tr>
    </thead>
    <tbody v-if="types.length === 0">
      <tr>
        <td colspan="6">
          Aucun matériel type de configuré ! Impossible d'ajouter du matériel'.
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr v-for="(item, index) in articles" :key="index">
        <td>
          <base-select
            ref="articles-reference"
            v-model="item.materiel_type_id"
            base-option="&lt;Matériel type&gt;"
            :options="types"
          />
        </td>
        <td>
          <input
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.numero"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Matériel non numéroté'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td>
          <div class="form-check">
            <!-- Checkbox est etiqueté correctement -->
            <input
              v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
              type="checkbox"
              v-model="item.est_etiquete"
              class="form-check-input"
            />
          </div>
        </td>
        <td>
          <input
            v-if="indexedTypes[item.materiel_type_id]?.est_taillee"
            v-model="item.taille"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Taille unique'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td>
          <input
            v-model="item.remarque"
            class="form-control form-control-sm"
            type="text"
          />
        </td>
        <td>
          <input
            v-model="item.achat"
            class="form-control form-control-sm"
            type="text"
          />
        </td>
        <td>
          <button
            class="btn btn-outline-danger border-0"
            @click="articles.splice(index, 1)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </td>
      </tr>
      <tr>
        <td colspan="7">
          <button class="btn btn-outline-primary" @click="addEmptyLine">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
