<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import MultiStep from '/src/components/base/MultiStep.vue';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';

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
const activeIndemnite = ref(null);
const ecritures = ref([]);
const successMessageVisibility = ref(true);

const store = useStore();

const indemnitesTypes = computed(
  () => store.state.imputation.fraisIndemnites.cours,
);
const categories = computed(() => store.state.ecritureCategorie.liste);
const sapeurs = computed(() => store.state.sapeur.liste);
const comptes = computed(() => store.state.compte.liste);
const unites = computed(() => store.state.unite.liste);
const anneeComptableId = computed(() => store.state.exerciceComptable.activeId);

const computedIndemnites = computed(() => {
  return indemnitesTypes.value.map((c) => ({
    ...c,
    getData: () =>
      Promise.resolve(
        c.fonctions.map((e) => ({
          ...e,
          unite: unites.value.find((u) => u.id == e.type_unite_id)?.unite,
          compte: comptes.value.find((c) => c.id == e.compte_id)?.designation,
        })),
      ),
    categorie: categories.value.find((e) => e.id == c.ecriture_categorie_id)
      ?.designation,
  }));
});

const { closeModal } = useModalStore();
const awn = inject('awn');

const selectIndemnite = (indemnite) => {
  activeIndemnite.value = indemnite;
};
const cancel = () => {
  // TODO Cancel depending on state
  (callback() ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};
const imputer = () => {
  if (activeIndemnite.value === null) {
    awn.warning('Veuillez sélectioner une indemnité type');
    return;
  }

  store
    .dispatch('imputerCours', {
      id: data.id,
      indemnite_cours_type_id: activeIndemnite.value.id,
      exercice_comptable_id: anneeComptableId.value,
    })
    .then((res) => {
      phase.value = 2;
      ecritures.value = res;
    });
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

const fields = [
  { title: 'Désignation', key: 'designation' },
  { title: 'Catégorie comptable', key: 'categorie' },
];
const detailRowOptions = {
  fields: [
    {
      title: 'Type',
      key: 'type',
      formatter: (type) => {
        const mapping = {
          0: 'Autre',
          1: 'Solde',
          2: 'Indemnité',
          3: 'Frais forfaitaire',
          4: 'Frais effectif',
          5: 'Charges AVS/AC',
        };
        return mapping[type] || '';
      },
    },
    { title: 'Tarif', key: 'tarif' },
    { title: 'Unité', key: 'unite' },
    { title: 'Compte', key: 'compte' },
  ],
  noData: 'Aucune indemnité',
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Imputer le cours</h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <multi-step
        :steps="['Type de frais', 'Résultat']"
        :active-index="phase - 1"
      />
      <div v-if="phase === 1" class="row">
        <div class="col-12">
          <base-table
            ref="table"
            :data="computedIndemnites"
            :fields="fields"
            no-data="Aucune indemnité de cours"
            detail-row-class="m-td-0"
            :detail-row-column="true"
            :selectable="true"
            @selected="(indemnite) => selectIndemnite(indemnite)"
          >
            <template #detail-row="{ rowData }">
              <generic-details-row
                :options="detailRowOptions"
                :row-data="rowData"
              />
            </template>
          </base-table>
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
