<script setup>
import { computed, inject, ref, useTemplateRef, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useModalStore } from '../../stores/common/Modal.js';
import CompteService from '/src/services/CompteService.js';

const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();

await exerciceComptableStore.fetchExercicesComptables();

exerciceComptableStore.fetchExercicesComptables();
sapeurStore.fetchListeSapeur();
await compteStore.fetchComptes();

const activeExerciceComptableId = computed(
  () => exerciceComptableStore.activeId,
);

const activeCompteId = ref(compteStore.liste[0]?.id ?? null);

const loading = ref(false);
watchEffect(async () => {
  if (activeCompteId.value === null) {
    return;
  }
  loading.value = true;
  await imputationStore.fetchEcritureComptes({
    exerciceComptableId: activeExerciceComptableId.value,
    compteId: activeCompteId.value,
  });
  loading.value = false;
});

const dropdown = useTemplateRef('dropdown');

const ecritures = computed(() => imputationStore.active.ecritures);
const sapeurs = computed(() => sapeurStore.liste);
const comptes = computed(() => compteStore.liste);

const computedData = computed(() => {
  return ecritures.value.map((e) => ({
    ...e,
    sapeur: sapeurs.value.find((s) => s.id == e.sapeur_id)?.nom_prenom,
  }));
});
const filteredSapeurs = computed(() => {
  const ids = new Set(ecritures.value.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});

const awn = inject('awn');
const { showModal, closeModal } = useModalStore();

const formatCompte = (compte) => {
  if (!compte) return '';
  return compte?.numero + ' - ' + compte?.designation;
};
const formatedDate = () => {
  var today = new Date();
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};
const justificatifIndividuel = (compteId) => {
  const compte = comptes.value.find((f) => f.id == activeCompteId.value);
  const filename = `${formatedDate()}_justificatif-compte-${compte.numero}.pdf`;

  showModal({ component: 'ModalChargement' });

  CompteService.downloadJustificatifIndividuel(
    filename,
    activeExerciceComptableId.value,
    compteId,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          'Une erreur a eu lieu durant la génération de votre fichier',
      );
    });
};
const justificatifComplet = () => {
  const filename = `${formatedDate()}_justificatif-complet.pdf`;
  showModal({ component: 'ModalChargement' });

  CompteService.downloadJustificatifComplet(
    filename,
    activeExerciceComptableId.value,
  )
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(
        err?.message ||
          'Une erreur a eu lieu durant la génération de votre fichier',
      );
    });
};

const selectCompte = (id) => {
  dropdown.value.close();
  activeCompteId.value = id;
};

const fields = [
  { title: 'Date', key: 'date', type: Date },
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
  { title: 'Designation', key: 'designation' },
  { title: 'Sapeur', key: 'sapeur' },
  { title: 'Total', key: 'total', type: Number },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <stateful-filter
    id="comptes"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Impressions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button
              class="btn btn-outline-primary"
              @click="justificatifIndividuel(activeCompteId)"
            >
              Justificatif du compte
            </button>
            <button
              class="btn btn-outline-primary"
              @click="justificatifComplet"
            >
              Justificatif complet
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-8 col-xl-6">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Filtres</h3>
          </div>
          <form class="card-body">
            <div class="row">
              <base-select
                class="col-md-6"
                display-key="nom_prenom"
                base-option="&lt;Sapeur&gt;"
                :options="filteredSapeurs"
                :model-value="filters.sapeur_id"
                @update:model-value="(value) => setFilter('sapeur_id', value)"
              />
              <base-select
                class="col-md-6"
                base-option="&lt;Type&gt;"
                :options="[
                  { id: 0, designation: 'Autre' },
                  { id: 1, designation: 'Solde' },
                  { id: 2, designation: 'Indemnité' },
                  { id: 3, designation: 'Frais forfaitaire' },
                  { id: 4, designation: 'Frais effectif' },
                  { id: 5, designation: 'Charges AVS/AC' },
                ]"
                :model-value="filters.type"
                @update:model-value="(value) => setFilter('type', value)"
              />
              <div v-if="canReset" class="col-md-6 mt-1">
                <button class="btn btn-sm btn-warning w-100" @click="reset">
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="col-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <div class="card-title">
              <h3 class="card-title">Comptes</h3>
              <base-dropdown
                v-if="comptes.length"
                ref="dropdown"
                button-class="ms-1 btn btn-outline-secondary dropdown-toggle"
                menu-class="dropdown-menu"
                :title="
                  formatCompte(comptes.find((f) => f.id == activeCompteId))
                "
              >
                <template #default>
                  <button
                    v-for="c in comptes"
                    :key="c.id"
                    class="dropdown-item"
                    :class="{ active: activeCompteId == c.id }"
                    type="button"
                    @click="selectCompte(c.id)"
                  >
                    {{ formatCompte(c) }}
                  </button>
                </template>
              </base-dropdown>
            </div>
          </div>
          <div v-if="!comptes.length" class="card-body">
            Veuillez configurer les comptes dans
            <router-link class="btn-link" :to="{ name: 'param-comptabilite' }"
              >Configuration</router-link
            >
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              no-data="Aucune écriture à afficher"
              :selectable="true"
              :data="filteredData"
            >
              <template #foot>
                <tr>
                  <th colspan="4">Total</th>
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
