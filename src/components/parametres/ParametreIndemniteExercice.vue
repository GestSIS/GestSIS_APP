<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Imputation exercice &amp; séance</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnite
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="computedIndemnites"
        :fields="fields"
        no-data="Aucune indemnité"
        :detail-row-column="true"
      >
        <template #detail-row="{ rowData }">
          <generic-details-row :options="detailRowOptions" :rowData="rowData" />
        </template>
        <template #actions="{ rowData }">
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
            @click="removeIndemnite(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
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
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([loadIndemnites, loadFonctions, loadComptes, loadUnites]).then(
    () => {
      next();
    },
  );
}

export default {
  name: 'ParametreIndemniteExercice',
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
        { title: 'Unité', key: 'unite' },
        { title: 'Par fonction', key: 'par_fonction', type: Boolean },
        { title: 'Catégorie comptable', key: 'categorie' },
        { title: 'Actions', slot: 'actions' },
      ],
      detailRowOptions: {
        fields: [
          { title: 'Fonction', key: 'fonction' },
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
          { title: 'Compte', key: 'compte' },
        ],
        noData: 'Aucune indemnité',
      },
    };
  },
  computed: {
    ...mapState({
      indemnitesExercice: (state) =>
        state.imputation.fraisIndemnites.exercices.sort(
          (a, b) => a.tri - b.tri,
        ),
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    computedIndemnites() {
      return this.indemnitesExercice.map((e) => ({
        ...e,
        getData: () =>
          Promise.resolve(
            e.fonctions
              .map((e) => ({
                ...e,
                compte: this.comptes.find((c) => c.id == e.compte_id)
                  ?.designation,
                fonction:
                  this.fonctions.find((c) => c.id == e.fonction_id)?.nom ?? '-',
                fonction_tri:
                  this.fonctions.find((c) => c.id == e.fonction_id)?.tri ?? -10,
              }))
              .sort((e1, e2) => e1.fonction_tri < e2.fonction_tri),
          ),
        categorie: this.categories.find((c) => c.id == e.ecriture_categorie_id)
          ?.designation,
        unite: this.unites.find((u) => u.id == e.type_unite_id)?.unite,
      }));
    },
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    ajoutIndemnite() {
      this.SHOW_MODAL({
        component: 'ModalIndemniteExercice',
        data: {},
        size: 2,
      });
    },
    updateIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteExercice',
        data: { ...indemnite },
        size: 2,
      });
    },
    removeIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette indemnité ?',
          question:
            "Attention, la suppression d'une indemnité est irréversible ! Toutes les données de cette indemnité seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeIndemniteExercice', indemnite.id);
          }
        },
      });
    },
  },
};
</script>
