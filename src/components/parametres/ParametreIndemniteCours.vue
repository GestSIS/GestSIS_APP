<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Imputation des cours</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnité
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        ref="table"
        :data="computedData"
        :fields="fields"
        no-data="Aucune indemnité de cours"
        :detail-row-column="true"
      >
        <template #detail-row="{ rowData }">
          <generic-details-row :options="detailRowOptions" :rowData="rowData" />
        </template>
        <template #actions="{ rowData }">
          <td class="align-middle text-center">
            <button
              type="button"
              class="btn btn-outline-primary border-0"
              @click="updateIndemnite(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              @click="deleteIndemnite(rowData)"
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
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');
  const loadHeures = store.dispatch('fetchHeuresExercice');

  Promise.all([loadComptes, loadUnites, loadHeures]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreIndemniteCours',
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
        {
          title: 'Désignation',
          key: 'designation',
        },
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
      indemnitesCours: (state) => state.imputation.fraisIndemnites.cours,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    computedData() {
      return this.indemnitesCours.map((c) => ({
        ...c,
        getData: () =>
          Promise.resolve(
            c.fonctions.map((e) => ({
              ...e,
              unite: this.unites.find((u) => u.id == e.type_unite_id)?.unite,
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
    this.$refs.table.showAllDetailRow();
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    ajoutIndemnite() {
      this.SHOW_MODAL({
        component: 'ModalIndemniteCours',
        size: 1,
        data: {},
      });
    },
    updateIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteCours',
        size: 1,
        data: { ...indemnite },
      });
    },
    deleteIndemnite(indemnite) {
      this.$store
        .dispatch('removeIndemniteCours', indemnite.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression'),
        );
    },
  },
};
</script>
