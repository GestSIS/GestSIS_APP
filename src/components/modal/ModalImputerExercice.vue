<script setup>
import { computed, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useModalStore } from '../../stores/common/Modal.js';
import MultiStep from '../base/MultiStep.vue';
import { useUniteStore } from '../../stores/common/Unite.js';

const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const compteStore = useCompteStore();
const imputationStore = useImputationStore();
const uniteStore = useUniteStore();
fonctionStore.fetchFonctions();

const { callback, data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const phase = ref(1);
const activeIndemniteIndex = ref(null);
const activeIndemnite = ref(null);
const ecritures = ref([]);
const successMessageVisibility = ref(true);

const indemnitesTypes = computed(
  () => imputationStore.fraisIndemnites.exercices,
);
const fonctions = computed(() => fonctionStore.liste);
const sapeurs = computed(() => sapeurStore.liste);
const comptes = computed(() => compteStore.liste);
const unites = computed(() => uniteStore.liste);

const activeIndemniteHasFonction = computed(() => {
  return activeIndemnite.value !== null && activeIndemnite.value.par_fonction;
});
const columns = computed(() => {
  const configurations = new Set(
    activeIndemnite.value?.fonctions
      ?.filter((f) => f.fonction_id)
      ?.map((f) => f.type + ' ' + f.compte_id) || [],
  );
  const columns = Object.fromEntries(
    [...configurations]
      .map((e) => [e, e.split(' ')])
      .map(([index, e]) => [
        index,
        {
          type: parseInt(e[0]),
          compte_id: parseInt(e[1]),
          fonctions: {},
        },
      ]),
  );

  activeIndemnite.value?.fonctions
    ?.filter((f) => f.fonction_id)
    ?.forEach((f) => {
      columns[f.type + ' ' + f.compte_id].fonctions[f.fonction_id] = f.tarif;
    });
  return columns;
});
const filteredFonctions = computed(() => {
  const fonctionsIds = new Set(
    [
      ...Object.values(columns.value)
        .map((e) => new Set(Object.keys(e.fonctions)))
        .reduce((acc, b) => new Set([...acc, ...b])),
    ].map((a) => parseInt(a)),
  );
  return fonctions.value.filter((f) => fonctionsIds.has(parseInt(f.id)));
});
const computedIndemnites = computed(() => {
  return indemnitesTypes.value.map((e) => {
    const indemniteBase = e.fonctions.filter((f) => !f.fonction_id);
    const soldes = indemniteBase.filter((e) => e.type == 1);
    const indemnites = indemniteBase.filter((e) => e.type == 2);

    const sumReducer = (acc, a) => acc + parseFloat(a);

    return {
      ...e,
      total_solde: soldes.map((e) => e.tarif).reduce(sumReducer, 0.0),
      solde_undefined: soldes.length == 0,
      // min_solde: soldes.length == 0 ? 0 : soldes.length == 1 ? (soldes[0].tarif_min || 0) : NaN,
      // min_solde_pour: soldes.length == 0 ? 0 : soldes.length == 1 ? (soldes[0].tarif_min_pour || 0) : NaN,
      compte_solde_id:
        soldes.length == 0
          ? null
          : soldes.length == 1
            ? soldes[0].compte_id
            : NaN,
      total_indemnite: indemnites.map((e) => e.tarif).reduce(sumReducer, 0.0),
      indemnite_undefined: indemnites.length == 0,
      // min_indemnite: indemnites.length == 0 ? 0 : indemnites.length == 1 ? (indemnites[0].tarif_min || 0) : NaN,
      // min_indemnite_pour: indemnites.length == 0 ? 0 : indemnites.length == 1 ? (indemnites[0].tarif_min_pour || 0) : NaN,
      compte_indemnite_id:
        indemnites.length == 0
          ? null
          : indemnites.length == 1
            ? indemnites[0].compte_id
            : NaN,
    };
  });
});

const { closeModal } = useModalStore();

const selectIndemnite = (index) => {
  activeIndemniteIndex.value = index;
  activeIndemnite.value = computedIndemnites.value[index];
};
const cancel = () => {
  (callback() ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};
const imputer = () => {
  if (activeIndemnite.value === null) {
    return;
  }

  imputationStore
    .imputerExercice({
      exercice_id: data.id,
      indemnite_exercice_type_id: activeIndemnite.value.id,
    })
    .then((data) => {
      phase.value = 2;
      ecritures.value = data.ecritures;
    });
};
const formatUnite = (uniteId) => {
  return unites.value.find((f) => f.id === uniteId)?.unite || '';
};
const formatCompte = (compteId) => {
  const compte = comptes.value.find(
    (f) => parseInt(f.id) == parseInt(compteId),
  );
  return compte ? compte?.numero + ' - ' + compte?.designation : '';
};
const formatType = (type) => {
  const mapping = {
    0: 'Autre',
    1: 'Solde',
    2: 'Indemnité',
    3: 'Frais forfaitaire',
    4: 'Frais effectif',
    5: 'Charges AVS/AC',
  };
  return mapping[type] || '';
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Imputer l'exercice</h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <multi-step
        :steps="['Type de frais', 'Résultat']"
        :active-index="phase - 1"
      />
      <div v-if="phase === 1" class="row">
        <div
          :class="{
            'col-12': !activeIndemniteHasFonction,
            'col-8': activeIndemniteHasFonction,
          }"
        >
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Unité</th>
                <th>Solde</th>
                <!-- <th>Solde min</th>
                <th>Pour</th>-->
                <th>Compte</th>
                <th>Indemnité</th>
                <!-- <th>Indemnité min</th>
                <th>Pour</th>-->
                <th>Compte</th>
                <th>Par fonction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!computedIndemnites.length">
                <td colspan="10">Aucune indemnité</td>
              </tr>
              <tr
                v-for="(i, index) in computedIndemnites"
                :key="index"
                :class="{
                  'table-primary': index === activeIndemniteIndex,
                }"
                @click="selectIndemnite(index)"
              >
                <td>{{ i.designation }}</td>
                <td>{{ formatUnite(i.type_unite_id) }}</td>
                <!-- <td v-if="!i.solde_undefined && i.min_solde == NaN">NaN</td> -->
                <td v-if="!i.solde_undefined">{{ i.total_solde }}</td>
                <td v-else>-</td>
                <!-- <td v-if="!i.solde_undefined && i.min_solde != NaN">{{ i.min_solde }}</td>
                <td v-else>-</td>
                <td v-if="!i.solde_undefined && i.min_solde != NaN">{{ i.min_solde_pour }}</td>
                <td v-else>-</td>-->
                <td v-if="!i.solde_undefined">
                  {{
                    i.compte_solde_id
                      ? formatCompte(i.compte_solde_id)
                      : "Plus d'un compte"
                  }}
                </td>
                <td v-else>-</td>
                <!-- <td v-if="!i.indemnite_undefined && i.min_indemnite == NaN">NaN</td> -->
                <td v-if="!i.indemnite_undefined">{{ i.total_indemnite }}</td>
                <td v-else>-</td>
                <!--<td v-if="!i.indemnite_undefined && i.min_indemnite != NaN">{{ i.min_indemnite }}</td>
                <td v-else>-</td>
                <td
                  v-if="!i.indemnite_undefined && i.min_indemnite != NaN"
                >{{ i.min_indemnite_pour }}</td>
                <td v-else>-</td>-->
                <td v-if="!i.indemnite_undefined">
                  {{
                    i.compte_indemnite_id
                      ? formatCompte(i.compte_indemnite_id)
                      : "Plus d'un compte"
                  }}
                </td>
                <td v-else>-</td>
                <td class="text-center">
                  <input
                    id="par_fonction"
                    type="checkbox"
                    class="form-check-input"
                    :checked="i.par_fonction"
                    disabled
                  />
                  <label class="form-check-label" for="par_fonction"></label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="activeIndemniteHasFonction" class="col-4">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th v-for="(column, i) in columns" :key="i">
                  {{ formatType(column.type) }}
                </th>
              </tr>
              <tr>
                <th>Compte</th>
                <th v-for="(column, i) in columns" :key="i">
                  {{ formatCompte(column.compte_id) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredFonctions.length">
                <td colspan="3">Aucune fonction paramétrée</td>
              </tr>
              <tr v-for="f in filteredFonctions" :key="f.id">
                <td>{{ f.nom }}</td>
                <td v-for="(column, i) in columns" :key="i">
                  {{ column.fonctions[parseInt(f.id)] || 0.0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div
          v-if="successMessageVisibility"
          class="alert alert-dismissible alert-success"
        >
          <button
            type="button"
            class="btn-close"
            @click="successMessageVisibility = false"
          ></button>
          Imputations effectuées avec <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th>Tarif</th>
              <th>Total</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>{{ ecriture.designation }}</td>
              <td>
                {{
                  sapeurs.find((f) => f.id == ecriture.sapeur_id)?.nom_prenom
                }}
              </td>
              <td>{{ ecriture.quantite }}</td>
              <td>{{ ecriture.tarif }}</td>
              <td>{{ ecriture.total }}</td>
              <td>{{ formatType(ecriture.type) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="cancel">
        {{ phase === 1 ? 'Annuler' : 'Fermer' }}
      </button>
      <button
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        :disabled="activeIndemnite === null"
        @click="imputer()"
      >
        Imputer
      </button>
    </div>
  </div>
</template>
