<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Indemnités pour cours</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnité
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        :data="computedData"
        :fields="fields"
        no-data="Aucune indemnité de cours"
        detail-row-class="m-td-0"
        :detail-row-component="detailRowComponent"
        :detail-row-options="detailRowOptions"
      >
        <template #details="props">
          <button
            v-if="props.rowData.fonctions.length"
            class="btn btn-link border-0"
            @click="props.actions.toggleDetailRow(props.rowData.id)"
          >
            <font-awesome-icon
              v-if="props.status.detailRowVisible || false"
              :icon="['fas', 'angle-down']"
            />
            <font-awesome-icon
              v-if="!props.status.detailRowVisible || false"
              :icon="['fas', 'angle-right']"
            />
          </button>
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
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';
import { markRaw } from 'vue';
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
  data() {
    return {
      detailRowComponent: markRaw(GenericDetailsRow),
      fields: [
        { title: '', slot: 'details', columnClass: 'col-1' },
        {
          title: 'Désignation',
          key: 'designation',
          sortKey: 'designation',
        },
        { title: 'Catégorie', key: 'categorie', sortKey: 'categorie' },
        { title: 'Actions', slot: 'actions' },
      ],
      detailRowOptions: {
        fields: [
          {
            title: 'Type',
            key: 'type',
            sortKey: 'type',
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
          { title: 'Tarif', key: 'tarif', sortKey: 'tarif' },
          { title: 'Unité', key: 'unite', sortKey: 'unite' },
          { title: 'Compte', key: 'compte', sortKey: 'compte' },
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
            }))
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
    ...mapMutations(['SHOW_MODAL']),
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
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
