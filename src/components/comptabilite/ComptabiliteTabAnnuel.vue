<script setup>
import { useModalStore } from '../../stores/common/Modal.js';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import permissions from '../../store/permissions';
import { useStore } from 'vuex';
import { computed, inject, ref, watchEffect } from 'vue';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
await store.dispatch('fetchExercicesComptables');

store.dispatch('fetchListeSapeur');
store.dispatch('fetchComptes');
store.dispatch('fetchFonctions');
store.dispatch('fetchFraisIndemnitesTypes');

const activeExerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchEcrituresAnnuels',
    activeExerciceComptableId.value,
  );
  loading.value = false;
});

const sapeurs = computed(() => store.state.sapeur.liste);
const comptes = computed(() => store.state.compte.liste);
const ecritures = computed(() => store.state.imputation.ecritures.annuels);
const fonctions = computed(() => store.state.fonction.liste);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);
const computedData = computed(() => {
  //Group by sapeur ID
  return (
    Object.entries(
      ecritures.value.reduce((reduced, ecriture) => {
        (reduced[ecriture.sapeur_id] = reduced[ecriture.sapeur_id] || []).push(
          ecriture,
        );
        return reduced;
      }, {}),
    )
      // Map to real data
      .map(([key, value]) => ({
        id: +key,
        ecritures: value,
        total: value.map((e) => parseFloat(e.total)).reduce((a, b) => a + b),
      }))
      // Add sapeur data
      .map((e) => {
        let sapeur = sapeurs.value.find((s) => s.id == e.id);
        return {
          ...e,
          ...sapeur,
          fonction: fonctions.value.find((f) => f.id == sapeur.fonction_id)
            ?.nom,
        };
      })
      // Add data relative to table
      .map((s) => ({
        ...s,
        getData: () =>
          new Promise(
            function (resolve) {
              resolve(ecritures.value);
            }.bind(s),
          ),
      }))
  );
});
const filteredSapeurs = computed(() => {
  const ids = new Set(ecritures.value.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});

const { confirm, showModal } = useModalStore();
const awn = inject('awn');

const regenererSapeur = () =>
  showModal({ component: 'ModalImputerAnnuel', size: 2 });

const annulerImputation = async () =>
  confirm(
    "Voulez-vous annuler l'imputation annuel des frais ?",
    'Attention, les écritures actuelles seront supprimées, mais il vous sera toujours possible de générer ces écritures à nouveau.',
  ).then(() =>
    store
      .dispatch('annulerImputationAnnuel', activeExerciceComptableId.value)
      .catch((err) =>
        awn.alert(
          err?.message ??
            "Une erreur est survenue durant l'annulation des indemnités/frais annuelles",
        ),
      ),
  );
const generer = () => showModal({ component: 'ModalImputerAnnuel', size: 2 });

const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }
  const statutsClass = {
    0: 'text-danger', //'inactif',
    1: '', //'Actif',
  };
  return statutsClass[dataItem.actif];
};

const detailRowOptions = {
  fields: [
    { title: 'Designation', key: 'designation' },
    {
      title: 'Type',
      key: 'type',
      formatter: (t) => {
        const mapping = {
          0: 'Autre',
          1: 'Solde',
          2: 'Indemnité',
          3: 'Frais forfaitaire',
          4: 'Frais effectif',
          5: 'Cotisation AVS/AC',
        };
        return mapping[t] ?? 'Autre';
      },
    },
    {
      title: 'Compte',
      key: 'compte_id',
      formatter: (id) => comptes.value.find((f) => f.id == id)?.label,
    },
    {
      title: 'Tarif',
      key: 'tarif',
      type: Number,
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
    {
      title: 'Quantité',
      key: 'quantite',
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
    {
      title: 'Total',
      key: 'total',
      type: Number,
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
  ],
};
const fields = [
  { title: 'Sapeur', key: 'nom_prenom' },
  { title: 'Fonction', key: 'fonction' },
  { title: 'Total', key: 'total', type: Number },
  {
    title: 'Actions',
    slot: 'actions',
    titleClass: 'align-middle text-center',
    columnClass: 'align-middle text-center',
  },
];
</script>

<template>
  <stateful-filter
    id="annuel"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div v-if="hasEditPermission" class="col-12 col-md-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Actions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button
              class="btn btn-outline-primary"
              :title="computedData.length ? 'Regénérer tous' : 'Générer'"
              @click.prevent="generer"
            >
              {{ computedData.length ? 'Regénérer' : 'Générer' }}
            </button>
            <button
              v-if="computedData.length"
              class="btn btn-outline-danger"
              @click.prevent="annulerImputation"
            >
              Tout supprimer
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Filtres</h3>
          </div>
          <form class="card-body">
            <base-select
              display-key="nom_prenom"
              base-option="&lt;Sapeur&gt;"
              :options="filteredSapeurs"
              :model-value="filters.id"
              @update:model-value="(value) => setFilter('id', value)"
            />
            <div v-if="canReset" class="w-100 mt-3">
              <button class="btn btn-sm btn-warning w-100" @click="reset">
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title me-auto">Indemnités et Frais annuels</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :data="filteredData"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune écriture à afficher"
              :detail-row-column="true"
              :selectable="true"
            >
              <template #detail-row="{ rowData }">
                <generic-details-row
                  :options="detailRowOptions"
                  :row-data="rowData"
                />
              </template>
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission"
                  title="Regénérer les frais de ce sapeur"
                  class="btn btn-outline-primary border-0"
                  @click="regenererSapeur(rowData)"
                >
                  <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
                </button>
              </template>
              <template #foot>
                <tr>
                  <th :colspan="filteredData.length ? 3 : 2">Total</th>
                  <th>
                    {{
                      filteredData
                        .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                        ?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                    }}
                    CHF
                  </th>
                  <th></th>
                </tr>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
