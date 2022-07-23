<template>
  <div class="row">
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
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
    <div class="col-12">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
        <div class="card-header d-flex justify-content-between">
          <h3>Autres</h3>
        </div>
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          :row-class="onRowClass"
          no-data="Aucune écriture à afficher"
          :data="computedData"
          :selectable="true"
          select-key="id"
          row-selected-class="table-primary"
          @selected="selected"
        >
          <template #actions="{ rowData }">
            <button
              type="button"
              class="btn btn-outline-primary border-0"
              @click="editEcriture(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              @click="deleteEcriture(rowData?.id)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import BaseTable from '@/components/table/BaseTable.vue';

import store from '@/store/index';

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
  components: {
    BaseTable,
  },
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
      filters: {},
      fields: [
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
        },
        {
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        {
          title: 'Quantité',
          key: 'quantite',
          sortKey: 'quantite',
        },
        {
          title: 'Unité',
          key: 'unite',
          sortKey: 'unite',
        },
        {
          title: 'Tarif',
          key: 'tarif',
          sortKey: 'tarif',
        },
        {
          title: 'Total',
          key: 'total',
          sortKey: 'total',
        },
        {
          title: 'Type',
          key: 'ecritureType',
          sortKey: 'ecritureType',
        },
        {
          title: 'Compte',
          key: 'compte',
          sortKey: 'compte',
        },
        {
          title: 'Catégorie',
          key: 'ecriture_categorie',
          sortKey: 'ecriture_categorie',
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
    };
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchEcrituresDivers').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      ecritures: (state) => state.imputation.ecritures.divers,
    }),
    computedData() {
      let svm = this;
      const formatCompte = (compte) =>
        compte?.numero + ' ' + compte?.designation;
      return this.ecritures.map((e) => ({
        ...e,
        sapeur: [svm.sapeurs.find((s) => s.id == e.sapeur_id)].map((s) =>
          s ? `${s.nom} ${s.prenom}` : ''
        )[0],
        unite: svm.unites.find((u) => u.id == e.type_unite_id)?.unite,
        ecriture_categorie: svm.categories.find(
          (c) => c.id == e.ecriture_categorie_id
        )?.designation,
        compte: formatCompte(svm.comptes.find((c) => c.id == e.compte_id)),
        ecritureType: svm.formatType(e.type),
      }));
    },
    ...mapGetters(['currentExerciceComptableId']),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newEcriture() {
      this.SHOW_MODAL({ component: 'ModalEcritureDivers', data: {} });
    },
    editEcriture(ecriture) {
      this.SHOW_MODAL({ component: 'ModalEcritureDivers', data: ecriture });
    },
    deleteEcriture(ecritureId) {
      this.$store.dispatch('removeEcriture', ecritureId);
      // TODO: Supprimer écriture si pas déjà liée à un décompte
    },
    selected(item) {
      this.selectedItem = item;
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
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
