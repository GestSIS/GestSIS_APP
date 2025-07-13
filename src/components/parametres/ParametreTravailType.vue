<script setup>
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';

const store = useStore();
const loadTravailTypes = store.dispatch('fetchTravailTypes');
const loadUnites = store.dispatch('fetchUnites');
const loadComptes = store.dispatch('fetchComptes');
const loadEcritureCategories = store.dispatch('fetchEcritureCategories');

await Promise.all([
  loadComptes,
  loadUnites,
  loadTravailTypes,
  loadEcritureCategories,
]);

const fields = [
  { title: 'Désignation', key: 'designation' },
  { title: 'Catégorie comptable', key: 'categorie' },
  { title: 'Actions', slot: 'actions' },
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

const computedData = computed(() => {
  return store.state.travailType.liste.map((c) => ({
    ...c,
    getData: () =>
      Promise.resolve(
        c.fonctions.map((e) => ({
          ...e,
          unite: store.state.unite.liste.find((u) => u.id == c.type_unite_id)
            ?.unite,
          compte: store.state.compte.liste.find((c) => c.id == e.compte_id)
            ?.designation,
        })),
      ),
    categorie: store.state.ecritureCategorie.liste.find(
      (e) => e.id == c.ecriture_categorie_id,
    )?.designation,
  }));
});

const { showModal } = useModalStore();
const awn = inject('awn');

const ajoutTravailType = () =>
  showModal({
    component: 'ModalTravailType',
    size: 1,
    data: {},
  });

const updateTravailType = (travailType) =>
  showModal({
    component: 'ModalTravailType',
    size: 1,
    data: { ...travailType },
  });

const deleteTravailType = (travailType) =>
  store
    .dispatch('removeTravailType', travailType.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Travaux types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTravailType">
        Ajouter un travail type
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="computedData"
        :fields="fields"
        no-data="Aucun travail type"
        :detail-row-column="true"
        :selectable="true"
      >
        <template #detail-row="{ rowData }">
          <generic-details-row :options="detailRowOptions" :row-data="rowData" />
        </template>
        <template #actions="{ rowData }">
          <td class="align-middle text-center">
            <button
              type="button"
              class="btn btn-outline-primary border-0"
              @click="updateTravailType(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              @click="deleteTravailType(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </td>
        </template>
      </base-table>
    </div>
  </div>
</template>
