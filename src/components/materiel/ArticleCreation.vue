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
if (articles.value.length === 0) {
  articles.value.push({
    materiel_type_id: '',
    taille: null,
    remarque: null,
    quantite: 1,
  });
}

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

const afficherColoneTaille = computed(() =>
  articles.value.some(
    (a) => indexedTypes.value[a.materiel_type_id]?.est_taillee,
  ),
);
const afficherColoneNumero = computed(() =>
  articles.value.some(
    (a) => indexedTypes.value[a.materiel_type_id]?.est_numerote,
  ),
);
const afficherColoneQuantite = computed(() =>
  articles.value.some(
    (a) => !indexedTypes.value[a.materiel_type_id]?.est_numerote,
  ),
);
const afficherColoneVehicule = computed(() =>
  articles.value.some(
    (a) => indexedTypes.value[a.materiel_type_id]?.type === 3,
  ),
);

const articleReference = useTemplateRef(`articles-reference`);
const addEmptyLine = () => {
  articles.value.push({
    compartiment: null,
    materiel_type_id: '',
    numero: null,
    taille: null,
    remarque: null,
    achat: null,
    taille: null,
    remarque: null,
    quantite: 1,
  });

  nextTick(() => {
    articleReference.value[articleReference.value.length - 1].focus();
  });
};
</script>

<template>
  <table class="table table-sm">
    <thead>
      <tr>
        <th class="col-3">Matériel type</th>
        <th v-if="afficherColoneVehicule" class="col-1">Désignation</th>
        <th v-if="afficherColoneVehicule" class="col-1">Immatriculation</th>
        <th v-if="afficherColoneVehicule" class="col-1">Chassis</th>
        <th v-if="afficherColoneNumero" class="col-2">Numéro</th>
        <th v-if="afficherColoneQuantite" class="col-1">Quantité</th>
        <th v-if="afficherColoneNumero" class="col-1">Est etiqueté</th>
        <th v-if="afficherColoneTaille" class="col-1">Taille</th>
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
            :required="true"
            v-model="item.materiel_type_id"
            placeholder="&lt;Sélectionnez un matériel type&gt;"
            :options="types"
          />
        </td>
        <td v-if="afficherColoneVehicule">
          <input
            v-if="indexedTypes[item.materiel_type_id]?.type === 3"
            :required="true"
            v-model="item.designation"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Uniquement pour les véhicules'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneVehicule">
          <input
            v-if="indexedTypes[item.materiel_type_id]?.type === 3"
            v-model="item.immatriculation"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Uniquement pour les véhicules'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneVehicule">
          <input
            v-if="indexedTypes[item.materiel_type_id]?.type === 3"
            v-model="item.chassis"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Uniquement pour les véhicules'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneNumero">
          <input
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            :required="true"
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
        <td v-if="afficherColoneQuantite">
          <input
            v-if="!indexedTypes[item.materiel_type_id]?.est_numerote"
            :required="true"
            v-model="item.quantite"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Matériel unique'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneNumero">
          <div class="form-check">
            <input
              v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
              type="checkbox"
              v-model="item.est_etiquete"
              class="form-check-input"
            />
          </div>
        </td>
        <td v-if="afficherColoneTaille">
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
            v-model="item.achat"
            class="form-control form-control-sm"
            type="text"
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
          <button
            class="btn btn-outline-danger border-0"
            @click="articles.splice(index, 1)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </td>
      </tr>
      <tr>
        <td
          :colspan="
            12 -
            (afficherColoneNumero ? 1 : 0) -
            (afficherColoneTaille ? 1 : 0) -
            (afficherColoneQuantite ? 1 : 0) -
            (afficherColoneVehicule ? 3 : 0)
          "
        >
          <button class="btn btn-outline-primary" @click="addEmptyLine">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
