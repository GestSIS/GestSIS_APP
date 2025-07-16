<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
await store.dispatch('fetchExercicesComptables');

store.dispatch('fetchListeSapeur');
store.dispatch('fetchUnites');
store.dispatch('fetchComptes');
store.dispatch('fetchEcritureCategories');

const activeExerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchEcrituresDivers', activeExerciceComptableId.value);
  loading.value = false;
});

const selectedItem = ref(null);
const selected = (item) => (selectedItem.value = item);

const sapeurs = computed(() => store.state.sapeur.liste);
const comptes = computed(() => store.state.compte.liste);
const unites = computed(() => store.state.unite.liste);
const categories = computed(() => store.state.ecritureCategorie.liste);
const ecritures = computed(() => store.state.imputation.ecritures.divers);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);

const computedData = computed(() => {
  const formatCompte = (compte) => compte?.numero + ' ' + compte?.designation;
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

  return ecritures.value?.map((e) => ({
    ...e,
    sapeur: sapeurs.value.find((s) => s.id == e.sapeur_id)?.nom_prenom,
    unite: unites.value.find((u) => u.id == e.type_unite_id)?.unite,
    ecriture_categorie: categories.value.find(
      (c) => c.id == e.ecriture_categorie_id,
    )?.designation,
    compte: formatCompte(comptes.value.find((c) => c.id == e.compte_id)),
    ecritureType: formatType(e.type),
  }));
});
const filteredSapeurs = computed(() => {
  const ids = new Set(ecritures.value?.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});
const filteredComptes = computed(() => {
  const ids = new Set(ecritures.value?.map((i) => i.compte_id));
  return comptes.value.filter((t) => ids.has(t.id));
});
const filteredCategories = computed(() => {
  const ids = new Set(ecritures.value?.map((i) => i.ecriture_categorie_id));
  return categories.value.filter((t) => ids.has(t.id));
});

const awn = inject('awn');
const { confirm, showModal } = useModalStore();

const newEcriture = () => {
  showModal({ component: 'ModalEcritureDivers', data: {} });
};
const editEcriture = (ecriture) => {
  if (!ecriture.decompte_id) {
    showModal({ component: 'ModalEcritureDivers', data: ecriture });
  } else {
    awn.alert(
      'Impossible de modifier une écriture déjà présente dans un décompte',
    );
  }
};
const deleteEcriture = (ecritureId) => {
  confirm(
    'Voulez-vous vraiment supprimer cette écriture ?',
    "Attention, la suppression d'une écriture est irréversible ! Toutes les données de cette écriture seront perdues !",
  ).then(() =>
    store
      .dispatch('removeEcriture', ecritureId)
      .catch((err) =>
        awn.alert(
          err?.message ?? 'Erreur, impossible de supprimer cette écriture',
        ),
      ),
  );
};
const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }
  const statutsClass = {
    0: '', //'A saisir',
    1: '', //'En attente de validation',
    2: '', // 'Validé',
    3: 'table-success', //'Imputé'
  };
  return statutsClass[dataItem.statut];
};

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Designation', key: 'designation' },
  { title: 'Sapeur', key: 'sapeur' },
  { title: 'Type', key: 'ecritureType' },
  { title: 'Compte', key: 'compte' },
  { title: 'Catégorie', key: 'ecriture_categorie' },
  { title: 'Quantité', key: 'quantite' },
  { title: 'Unité', key: 'unite' },
  { title: 'Tarif', key: 'tarif', type: Number },
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
    id="compta-divers"
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
            <button class="btn btn-outline-primary" @click="newEcriture">
              Nouveau
            </button>
            <button
              class="btn btn-outline-primary"
              :disabled="!selectedItem"
              @click="editEcriture(selectedItem)"
            >
              Modifier
            </button>
            <button
              class="btn btn-outline-danger"
              :disabled="!selectedItem"
              @click="deleteEcriture(selectedItem?.id)"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-8 col-xl-9">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Filtres</h3>
          </div>
          <form class="card-body">
            <div class="row">
              <base-select
                class="col-md-4 mb-1"
                display-key="nom_prenom"
                base-option="&lt;Sapeur&gt;"
                :options="filteredSapeurs"
                :model-value="filters.sapeur_id"
                @update:model-value="(value) => setFilter('sapeur_id', value)"
              />
              <base-select
                class="col-md-4 mb-1"
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
              <base-select
                class="col-md-4 mb-1"
                base-option="&lt;Compte&gt;"
                :options="filteredComptes"
                :model-value="filters.compte_id"
                @update:model-value="(value) => setFilter('compte_id', value)"
              />
              <base-select
                class="col-md-4 mb-1"
                base-option="&lt;Catégorie comptable&gt;"
                :options="filteredCategories"
                :model-value="filters.ecriture_categorie_id"
                @update:model-value="
                  (value) => setFilter('ecriture_categorie_id', value)
                "
              />
              <div v-if="canReset" class="col-md-4">
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
            <h3>Autres</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune écriture à afficher"
              :data="filteredData"
              :selectable="true"
              @selected="selected"
            >
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission"
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="editEcriture(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  v-if="hasEditPermission"
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="deleteEcriture(rowData?.id)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
              <template #foot>
                <tr>
                  <th :colspan="9">Total</th>
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
