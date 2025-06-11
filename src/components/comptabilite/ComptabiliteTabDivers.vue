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
                class="col-md-4"
                display-key="nom_prenom"
                base-option="&lt;Sapeur&gt;"
                :options="filteredSapeurs"
                :model-value="filters.sapeur_id"
                @update:model-value="(value) => setFilter('sapeur_id', value)"
              />
              <base-select
                class="col-md-4"
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
                class="col-md-4"
                base-option="&lt;Compte&gt;"
                :options="filteredComptes"
                :model-value="filters.compte_id"
                @update:model-value="(value) => setFilter('compte_id', value)"
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Catégorie comptable&gt;"
                :options="filteredCategories"
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

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

import store from '/src/store/index';
import permissions from '../../store/permissions';

async function loadData(routeTo, next) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadUnites = store.dispatch('fetchUnites');
  const loadComptes = store.dispatch('fetchComptes');
  const loadEcritureCategorie = store.dispatch('fetchEcritureCategories');

  await store.dispatch('fetchExercicesComptables');

  const loadEcrituresDivers = store.dispatch('fetchEcrituresDivers');

  Promise.all([
    loadSapeurs,
    loadUnites,
    loadComptes,
    loadEcritureCategorie,
    loadEcrituresDivers,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ComptabiliteDivers',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      loading: true,
      selectedItem: null,
      fields: [
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
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      ecritures: (state) => state.imputation.ecritures.divers,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.COMPTABILITE.MODIFICATION,
        ),
    }),
    computedData() {
      const svm = this;
      const formatCompte = (compte) =>
        compte?.numero + ' ' + compte?.designation;
      return this.ecritures?.map((e) => ({
        ...e,
        sapeur: svm.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
        unite: svm.unites.find((u) => u.id == e.type_unite_id)?.unite,
        ecriture_categorie: svm.categories.find(
          (c) => c.id == e.ecriture_categorie_id,
        )?.designation,
        compte: formatCompte(svm.comptes.find((c) => c.id == e.compte_id)),
        ecritureType: svm.formatType(e.type),
      }));
    },
    filteredSapeurs() {
      const ids = new Set(this.ecritures?.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
    filteredComptes() {
      const ids = new Set(this.ecritures?.map((i) => i.compte_id));
      return this.comptes.filter((t) => ids.has(t.id));
    },
    filteredCategories() {
      const ids = new Set(this.ecritures?.map((i) => i.ecriture_categorie_id));
      return this.categories.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchEcrituresDivers').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    newEcriture() {
      this.SHOW_MODAL({ component: 'ModalEcritureDivers', data: {} });
    },
    editEcriture(ecriture) {
      if (!ecriture.decompte_id) {
        this.SHOW_MODAL({ component: 'ModalEcritureDivers', data: ecriture });
      } else {
        this.$awn.alert(
          'Impossible de modifier une écriture déjà présente dans un décompte',
        );
      }
    },
    deleteEcriture(ecritureId) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette écriture ?',
          question:
            "Attention, la suppression d'une écriture est irréversible ! Toutes les données de cette écriture seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeEcriture', ecritureId).catch((err) => {
              this.$awn.alert(
                err?.message ??
                  'Erreur, impossible de supprimer cette écriture',
              );
            });
          }
        },
      });
    },
    selected(item) {
      this.selectedItem = item;
    },
    formatType(type) {
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
    onRowClass(dataItem, isSelected) {
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
    },
  },
};
</script>

<style lang="scss" scoped></style>
