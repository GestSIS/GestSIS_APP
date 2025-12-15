<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import permissions from '../../composables/permissions.js';
import useHasPermission from '../../composables/usePermission.js';

const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const imputationStore = useImputationStore();

await exerciceComptableStore.fetchExercicesComptables();

sapeurStore.fetchListeSapeur();

const activeExerciceComptableId = computed(
  () => exerciceComptableStore.activeId,
);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await imputationStore.fetchAmendesExerciceComptable(
    activeExerciceComptableId.value,
  );
  loading.value = false;
});

const sapeurs = computed(() => sapeurStore.liste);
const amendes = computed(() => imputationStore.ecritures.amendes);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);

const computedData = computed(() => {
  const sapeursAmendes = amendes.value.reduce((rv, a) => {
    (rv[a.sapeur_id] = rv[a.sapeur_id] || {
      ...sapeurs.value.find((s) => s.id == a.sapeur_id),
      amendes: [],
    }).amendes.push(a);
    return rv;
  }, {});
  return Object.values(sapeursAmendes).map((s) => ({
    ...s,
    nb: s.amendes.length,
    sapeur: s.nom_prenom,
    total: s.amendes.reduce((rv, a) => rv + parseFloat(a.total), 0.0),
    getData: () => Promise.resolve(s.amendes),
  }));
});
const filteredSapeurs = computed(() => {
  const ids = new Set(amendes.value.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});

const awn = useNotification();
const generer = () => {
  imputationStore
    .genererAmendesAnnuels(activeExerciceComptableId.value)
    .then((amendes) => {
      if (amendes?.length == 0) {
        awn.success('Aucune amende requise pour cet exercice comptable');
      } else {
        awn.success('Amendes générées avec succes');
      }
    })
    .catch((err) =>
      awn.alert(
        err?.message ??
          'Une erreur est survenue durant le génération des indemnités/frais annuelles',
      ),
    );
};
const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }
  const statutsClass = {
    0: '', // A saisir
    1: '', // En attente de validation
    2: '', // Validée
    3: 'table-success', // Imputée
  };
  return statutsClass[dataItem.statut];
};

const detailRowOptions = {
  fields: [
    { title: 'Date', key: 'date', type: Date },
    { title: 'Exercice', key: 'designation' },
    { title: 'Excuse', key: 'complement' },
    { title: 'Total', key: 'total', type: Number },
  ],
};
const fields = [
  { title: 'Sapeur', key: 'sapeur' },
  { title: 'Nombre', key: 'nb' },
  { title: 'Montant', key: 'total', type: Number },
];
</script>

<template>
  <stateful-filter
    id="amendes"
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
            <button class="btn btn-primary" @click="generer">
              Générer les amendes
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
              base-option="<Sapeur>"
              :options="filteredSapeurs"
              :model-value="filters.id"
              @update:model-value="(value) => setFilter('id', value)"
            />
            <div v-if="canReset" class="w-100 mt-2">
              <button class="btn btn-sm btn-warning w-100" @click="reset">
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>Amendes</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune amende à afficher"
              :detail-row-column="true"
              :data="filteredData"
              :selectable="true"
            >
              <template #detail-row="{ rowData }">
                <generic-details-row
                  :options="detailRowOptions"
                  :row-data="rowData"
                />
              </template>
              <template #foot="{ data }">
                <tr>
                  <th :colspan="data.length ? 3 : 2">Total</th>
                  <th>
                    {{
                      data
                        .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })
                    }}
                    CHF
                  </th>
                </tr>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>
