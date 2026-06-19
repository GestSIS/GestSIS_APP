<script setup>
import { computed, nextTick, useTemplateRef } from 'vue';

import { indexedData } from '../../tools/index.js';

const articles = defineModel({ default: () => [] });

const { articleTypes } = defineProps({
  articleTypes: { type: Array, required: true },
});

if (articles.value.length === 0) {
  articles.value.push({
    materiel_type_id: '',
    taille: null,
    remarque: null,
    quantite: 1,
  });
}

const types = computed(() =>
  [...articleTypes].sort((a, b) => a.designation.localeCompare(b.designation)),
);
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
            v-model="item.materiel_type_id"
            :required="true"
            placeholder="&lt;Sélectionnez un matériel type&gt;"
            :options="types"
          />
        </td>
        <td v-if="afficherColoneVehicule">
          <input
            v-if="indexedTypes[item.materiel_type_id]?.type === 3"
            v-model="item.designation"
            :required="true"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            v-tooltip.bottom="'Uniquement pour les véhicules'"
            class="ms-4"
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
            v-tooltip.bottom="'Uniquement pour les véhicules'"
            class="ms-4"
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
            v-tooltip.bottom="'Uniquement pour les véhicules'"
            class="ms-4"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneNumero">
          <input
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.numero"
            :required="true"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            v-tooltip.bottom="'Matériel non numéroté'"
            class="ms-4"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneQuantite">
          <input
            v-if="!indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.quantite"
            :required="true"
            class="form-control form-control-sm"
            type="text"
          />
          <font-awesome-icon
            v-else
            v-tooltip.bottom="'Matériel unique'"
            class="ms-4"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="afficherColoneNumero">
          <div class="form-check">
            <input
              v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
              v-model="item.est_etiquete"
              type="checkbox"
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
            v-tooltip.bottom="'Taille unique'"
            class="ms-4"
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
