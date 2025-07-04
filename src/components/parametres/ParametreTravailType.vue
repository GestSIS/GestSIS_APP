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
        ref="table_types"
        :data="computedData"
        :fields="fields"
        no-data="Aucun travail type"
        :detail-row-column="true"
        :selectable="true"
      >
        <template #detail-row="{ rowData }">
          <generic-details-row :options="detailRowOptions" :rowData="rowData" />
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

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';
import store from '/src/store/index';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';

async function loadData(_, next) {
  const loadTravailTypes = store.dispatch('fetchTravailTypes');
  const loadUnites = store.dispatch('fetchUnites');
  const loadComptes = store.dispatch('fetchComptes');
  const loadEcritureCategories = store.dispatch('fetchEcritureCategories');

  Promise.all([
    loadComptes,
    loadUnites,
    loadTravailTypes,
    loadEcritureCategories,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTravailType',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  components: { GenericDetailsRow },
  data() {
    return {
      fields: [
        { title: 'Désignation', key: 'designation' },
        { title: 'Catégorie comptable', key: 'categorie' },
        { title: 'Actions', slot: 'actions' },
      ],
      detailRowOptions: {
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
      },
    };
  },
  computed: {
    ...mapState({
      travailTypes: (state) => state.travailType.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    computedData() {
      return this.travailTypes.map((c) => ({
        ...c,
        getData: () =>
          Promise.resolve(
            c.fonctions.map((e) => ({
              ...e,
              unite: this.unites.find((u) => u.id == c.type_unite_id)?.unite,
              compte: this.comptes.find((c) => c.id == e.compte_id)
                ?.designation,
            })),
          ),
        categorie: this.categories.find((e) => e.id == c.ecriture_categorie_id)
          ?.designation,
      }));
    },
  },
  mounted() {
    // this.$refs.table_types.showAllDetailRow();
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    ajoutTravailType() {
      this.SHOW_MODAL({
        component: 'ModalTravailType',
        size: 1,
        data: {},
      });
    },
    updateTravailType(travailType) {
      this.SHOW_MODAL({
        component: 'ModalTravailType',
        size: 1,
        data: { ...travailType },
      });
    },
    deleteTravailType(travailType) {
      this.$store
        .dispatch('removeTravailType', travailType.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression'),
        );
    },
  },
};
</script>
