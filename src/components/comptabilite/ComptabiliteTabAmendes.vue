<template>
  <stateful-filter
    id="amendes"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div class="col-12 col-md-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Actions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button class="btn btn-primary" @click="generer">
              Générer les amendes
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
      <div class="col-md-12">
        <div class="card card-primary card-outline table-responsive mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>Amendes</h3>
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
            no-data="Aucune amende à afficher"
            :detail-row-column="true"
            :detail-row-options="detailRowOptions"
            :detail-row-component="detailRowComponent"
            detail-row-class="m-td-0"
            :data="filteredData"
            :selectable="true"
            @selected="selected"
          >
            <template #foot="{ data }">
              <tr>
                <th :colspan="data.length ? 3 : 2">Total</th>
                <th>
                  {{
                    data
                      .reduce((acc, e) => acc + parseFloat(e.total), 0.0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2 })
                  }}
                  CHF
                </th>
              </tr>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import { mapState } from 'vuex';
import { markRaw } from 'vue';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  await store.dispatch('fetchExercicesComptables');

  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadAmendes = store.dispatch('fetchAmendesExerciceComptable');
  Promise.all([loadSapeurs, loadAmendes]).then(() => {
    next();
  });
}

export default {
  name: 'ComptabiliteTabAmendes',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      detailRowComponent: markRaw(GenericDetailsRow),
      loading: true,
      detailRowOptions: {
        fields: [
          { title: 'Date', key: 'date', type: Date },
          { title: 'Exercice', key: 'designation' },
          { title: 'Excuse', key: 'complement' },
          { title: 'Total', key: 'total', type: Number },
        ],
      },
      fields: [
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Nombre', key: 'nb' },
        { title: 'Montant', key: 'total', type: Number },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      amendes: (state) => state.imputation.ecritures.amendes,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      const sapeurs = this.amendes.reduce((rv, a) => {
        (rv[a.sapeur_id] = rv[a.sapeur_id] || {
          ...this.sapeurs.find((s) => s.id == a.sapeur_id),
          amendes: [],
        }).amendes.push(a);
        return rv;
      }, {});
      return Object.values(sapeurs).map((s) => ({
        ...s,
        nb: s.amendes.length,
        sapeur: s.nom_prenom,
        total: s.amendes.reduce((rv, a) => rv + parseFloat(a.total), 0.0),
        getData: () => Promise.resolve(s.amendes),
      }));
    },
    filteredSapeurs() {
      const ids = new Set(this.amendes.map((i) => i.sapeur_id));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchAmendesExerciceComptable').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    selected(id) {
      this.selectedId = id;
    },
    generer() {
      this.$store
        .dispatch('genererAmendesAnnuels', this.activeExerciceComptableId)
        .then((amendes) => {
          if (amendes?.length == 0) {
            this.$awn.success(
              'Aucune amende requise pour cet exercice comptable'
            );
          } else {
            this.$awn.success('Amendes générées avec succes');
          }
        })
        .catch((err) =>
          this.$awn.alert(
            err?.message ??
              'Une erreur est survenue durant le génération des indemnités/frais annuelles'
          )
        );
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }
      const statutsClass = {
        0: '', //'A saisir',
        1: '', //'En attente de validation',
        2: '', // 'Validée',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style lang="scss" scoped></style>
