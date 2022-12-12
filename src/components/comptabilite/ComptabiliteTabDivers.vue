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
          <template #foot>
            <tr>
              <th :colspan="9">Total</th>
              <th>
                {{
                  computedData
                    .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                    ?.toFixed(2)
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
</template>

<script>
import { mapState, mapMutations } from 'vuex';

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
          type: 'date',
        },
        {
          title: 'Designation',
          key: 'designation',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
        },
        {
          title: 'Type',
          key: 'ecritureType',
        },
        {
          title: 'Compte',
          key: 'compte',
        },
        {
          title: 'Catégorie',
          key: 'ecriture_categorie',
        },
        {
          title: 'Quantité',
          key: 'quantite',
        },
        {
          title: 'Unité',
          key: 'unite',
        },
        {
          title: 'Tarif',
          key: 'tarif',
        },
        {
          title: 'Total',
          key: 'total',
        },
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
    }),
    computedData() {
      let svm = this;
      const formatCompte = (compte) =>
        compte?.numero + ' ' + compte?.designation;
      return this.ecritures.map((e) => ({
        ...e,
        sapeur: svm.sapeurs.find((s) => s.id == e.sapeur_id)?.nom_prenom,
        unite: svm.unites.find((u) => u.id == e.type_unite_id)?.unite,
        ecriture_categorie: svm.categories.find(
          (c) => c.id == e.ecriture_categorie_id
        )?.designation,
        compte: formatCompte(svm.comptes.find((c) => c.id == e.compte_id)),
        ecritureType: svm.formatType(e.type),
      }));
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
    ...mapMutations(['SHOW_MODAL']),
    newEcriture() {
      this.SHOW_MODAL({ component: 'ModalEcritureDivers', data: {} });
    },
    editEcriture(ecriture) {
      if (!ecriture.decompte_id) {
        this.SHOW_MODAL({ component: 'ModalEcritureDivers', data: ecriture });
      } else {
        this.$awn.alert(
          'Impossible de modifier une écriture déjà présente dans un décompte'
        );
      }
    },
    deleteEcriture(ecritureId) {
      this.$store.dispatch('removeEcriture', ecritureId).catch((err) => {
        this.$awn.alert(
          err?.message ?? 'Erreur, impossible de supprimer cette écriture'
        );
      });
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
