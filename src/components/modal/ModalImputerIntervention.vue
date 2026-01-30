<script setup>
import { computed, ref } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import MultiStep from '../base/MultiStep.vue';
import useNotification from '../../composables/useNotification.js';

const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const compteStore = useCompteStore();
const imputationStore = useImputationStore();
const uniteStore = useUniteStore();
fonctionStore.fetchFonctions();

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

const phase = ref(1);
const activeIndemniteIndex = ref(null);
const activeIndemnite = ref(null);
const ecritures = ref([]);
const successMessageVisibility = ref(true);

const sapeurs = computed(() => sapeurStore.liste);
const indemnitesTypes = computed(
  () => imputationStore.fraisIndemnites.interventions,
);
const fonctions = computed(() => fonctionStore.liste);
const comptes = computed(() => compteStore.liste);
const unites = computed(() => uniteStore.liste);
const activeIndemniteHasFonction = computed(() => {
  return activeIndemnite.value !== null && activeIndemnite.value.par_fonction;
});

const awn = useNotification();
const { closeModal: close } = useModalStore();
const closeModal = () => {
  callback().then(() => close());
};
const selectIndemnite = (index) => {
  activeIndemniteIndex.value = index;
  activeIndemnite.value = indemnitesTypes.value[index];
};
const imputer = () => {
  if (activeIndemnite.value === null) {
    return;
  }

  imputationStore
    .imputerIntervention({
      intervention_id: data.id,
      indemnite_intervention_type_id: activeIndemnite.value.id,
    })
    .then((data) => {
      phase.value = 2;
      ecritures.value = data.ecritures;
    })
    .catch((err) =>
      awn.alert(err?.message ?? "Impossible d'effectuer cette action"),
    );
};
const formatCompte = (compte) => {
  if (!compte) return '';
  return compte?.numero + ' - ' + compte?.designation;
};
</script>
<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Imputer l'intervention</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
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
          <!-- TODO: Use BaseTable -->
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Tarif</th>
                <th class="text-center">Pro-rata</th>
                <th>Tarif min</th>
                <th>Pour</th>
                <th class="text-center">Pro-rata tarif min</th>
                <th>Taux nuit</th>
                <th>Taux weekend</th>
                <th>Unité</th>
                <th>Compte</th>
                <th class="text-center">Par fonction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="indemnitesTypes.length == 0">
                <td colspan="11">
                  Aucune indemnité type pour intervention de configuré
                </td>
              </tr>
              <tr
                v-for="(indemnite, index) in indemnitesTypes"
                :key="indemnite.id"
                class
                :class="{
                  'table-primary': index === activeIndemniteIndex,
                }"
                @click="selectIndemnite(index)"
              >
                <td>{{ indemnite.designation }}</td>
                <td>{{ indemnite.tarif }}</td>
                <td class="text-center">
                  <input
                    v-model="indemnite.tarif_pro_rata"
                    type="checkbox"
                    class="form-check-input"
                    disabled
                  />
                </td>
                <td>{{ indemnite.tarif_min }}</td>
                <td>{{ indemnite.tarif_min_pour }}</td>
                <td class="text-center">
                  <input
                    v-model="indemnite.tarif_min_pro_rata"
                    type="checkbox"
                    class="form-check-input"
                    disabled
                  />
                </td>
                <td>{{ indemnite.taux_nuit }}</td>
                <td>{{ indemnite.taux_weekend }}</td>
                <td>
                  {{
                    unites.find((u) => u.id == indemnite.type_unite_id)
                      ?.abreviation
                  }}
                </td>
                <td>
                  {{
                    formatCompte(
                      comptes.find((f) => f.id == indemnite.compte_id),
                    )
                  }}
                </td>
                <td class="text-center">
                  <input
                    id="checkbox-fonction"
                    type="checkbox"
                    class="form-check-input"
                    :checked="indemnite.par_fonction"
                    disabled
                  />
                  <label
                    class="form-check-label"
                    for="checkbox-fonction"
                  ></label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="activeIndemniteHasFonction" class="col-4">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Fonction</th>
                <th>Tarif</th>
                <th>Indemnité</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fonction in activeIndemnite.fonctions"
                :key="fonction.id"
              >
                <td>{{ fonctions.find((f) => f.id == fonction.id).nom }}</td>
                <td>{{ fonction.tarif }}</td>
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
          Imputations effectuées avec
          <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th>Unité</th>
              <th>Tarif</th>
              <th>Tarif min</th>
              <th>Pour</th>
              <th class="text-center">Pro-rata</th>
              <th>Taux</th>
              <th>Taux description</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>
                {{
                  sapeurs.find((f) => f.id == ecriture.sapeur_id)?.nom_prenom
                }}
              </td>
              <td>{{ ecriture.quantite }}</td>
              <td>
                {{
                  unites.find((u) => u.id == ecriture.type_unite_id)
                    ?.abreviation
                }}
              </td>
              <td>{{ ecriture.tarif }}</td>
              <td>{{ ecriture.tarif_min }}</td>
              <td>{{ ecriture.tarif_min_pour }}</td>
              <td class="text-center">
                <input
                  v-model="ecriture.tarif_min_pro_rata"
                  type="checkbox"
                  class="form-check-input"
                />
              </td>
              <td>{{ ecriture.taux }}</td>
              <td>{{ ecriture.taux_description }}</td>
              <td>{{ ecriture.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
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
