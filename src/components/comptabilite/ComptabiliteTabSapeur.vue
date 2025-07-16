<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import DecompteService from '../../services/DecompteService';
import ImputationService from '/src/services/ImputationService.js';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
await store.dispatch('fetchExercicesComptables');

store.dispatch('fetchListeSapeur');
store.dispatch('fetchFonctions');
store.dispatch('fetchComptes');

const activeExerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

const loading = ref(false);
const ecritures = ref([]);
watchEffect(async () => {
  loading.value = true;
  ecritures.value = await ImputationService.getEcrituresForExerciceComptable(
    activeExerciceComptableId.value,
  );
  loading.value = false;
});

const selectedId = ref(null);
const selected = (row) => (selectedId.value = row?.id ?? null);

const sapeurs = computed(() => store.state.sapeur.liste);
const fonctions = computed(() => store.state.fonction.liste);
const comptes = computed(() => store.state.compte.liste);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);

const computedData = computed(() => {
  let ecrituresBySapeur = ecritures.value
    .filter((s) => s.sapeur_id)
    .reduce((acc, e) => {
      acc.set(e.sapeur_id, [...(acc.get(e.sapeur_id) || []), e]);
      return acc;
    }, new Map());

  return sapeurs.value
    .filter((s) => ecrituresBySapeur.has(s.id))
    .map((s) => {
      return {
        id: s.id,
        nom_prenom: s.nom_prenom,
        fonction: fonctions.value.find((f) => f.id == s.fonction_id)?.nom ?? '',
        aPayer:
          ecrituresBySapeur
            .get(s.id)
            .findIndex(
              (e) =>
                e.decompte_id == null &&
                !comptes.value.find((c) => c.id === e.compte_id)?.produit,
            ) >= 0,
        total: ecrituresBySapeur
          .get(s.id)
          .reduce(
            (a, b) =>
              a +
              (comptes.value.find((c) => c.id === b.compte_id)?.produit
                ? -b.total
                : +b.total),
            0,
          ),
        getData: () =>
          Promise.resolve(
            ecrituresBySapeur
              .get(s.id)
              .map((e) =>
                comptes.value.find((c) => c.id === e.compte_id)?.produit
                  ? { ...e, total: -e.total, tarif: -e.tarif }
                  : e,
              ),
          ),
      };
    });
});
const filteredSapeurs = computed(() => {
  const ids = new Set(ecritures.value.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});

const awn = inject('awn');
const { closeModal, showModal } = useModalStore();

const printPourSapeur = (sapeurId) => {
  showModal({ component: 'ModalChargement' });

  DecompteService.downloadResumePourSapeur(
    activeExerciceComptableId.value,
    sapeurId,
    `resume_pour_sapeur.pdf`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message || 'Erreur lors de la génération du résumé pour sapeur',
      );
    });
};
const printParSapeur = () => {
  showModal({ component: 'ModalChargement' });

  DecompteService.downloadResumeParSapeur(
    activeExerciceComptableId.value,
    `resume_par_sapeur.pdf`,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message || 'Erreur lors de la génération du résumé par sapeur',
      );
    });
};
const genererDecompteSapeur = (sapeurId, sapeur) => {
  showModal({
    component: 'ModalDecompte',
    data: {
      type: 'sapeur',
      sapeurId,
      designation: sapeur,
    },
  });
};

const detailRowOptions = {
  fields: [
    { title: 'Date', key: 'date', type: Date },
    { title: 'Ecriture', key: 'designation' },
    {
      title: 'Module',
      key: 'module',
      formatter: (t) => {
        const mapping = {
          1: 'Exercice & séance',
          2: 'Intervention',
          3: 'Frais et indemnité annuel',
          0: 'Ecriture divers',
          5: 'Amende',
          6: 'Fiche de travail',
          7: 'Cours',
          4: 'Avs',
        };
        return mapping[t] ?? 'Autre';
      },
    },
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
      title: 'Tarif',
      key: 'tarif',
      type: Number,
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
    {
      title: 'Tarif min',
      key: 'indemnite',
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
      title: 'Taux',
      key: 'taux',
      type: Number,
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
  { title: 'Sapeur', key: 'nom_prenom', sortField: 'nom_prenom' },
  { title: 'Fonction', key: 'fonction', sortField: 'fonction' },
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
    id="sapeurs"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div v-if="hasEditPermission" class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Actions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button class="btn btn-outline-primary" disabled>
              Créer un décompte individuel
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Impressions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button class="btn btn-outline-primary" @click="printParSapeur">
              Résumé des frais complet
            </button>
            <button
              class="btn btn-outline-primary"
              :disabled="!selectedId"
              @click="printPourSapeur(selectedId)"
            >
              Résumé des frais pour sapeur
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
            <div v-if="canReset" class="w-100 mt-2">
              <button class="btn btn-sm btn-warning w-100" @click="reset">
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-12 col-xl-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Sapeurs</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :selectable="true"
              :fields="fields"
              :detail-row-column="true"
              no-data="Aucun sapeur à afficher"
              :data="filteredData"
              @selected="selected"
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
                  class="btn btn-outline-primary border-0"
                  title="Décompte sapeur"
                  :disabled="!rowData.aPayer"
                  @click="genererDecompteSapeur(rowData.id, rowData.nom_prenom)"
                >
                  <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
                </button>
              </template>
              <template #foot>
                <tr>
                  <th></th>
                  <th :colspan="filteredData.length ? 2 : 1">Total</th>
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
