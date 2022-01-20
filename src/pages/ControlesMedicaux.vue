<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Contrôles Medicaux
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des contrôles médicaux</h3>
            <router-link custom to="/controles-medicaux/ajout" v-slot="{ navigate }">
              <button
                @click="navigate"
                class="btn btn-outline-primary"
              >Ajouter</button>
            </router-link>
          </div>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :fields="fields"
            no-data="Aucun contrôle médical à afficher"
            :row-class="onRowClass"
            :data="computedData"
            :selectable="true"
            selectKey="id"
            row-selected-class="table-primary"
            @selected="selected"
          >
            <template v-slot:checkbox="props">
              <input
                type="checkbox"
                class="form-check-input"
                :id="props.key"
                :checked="props.rowData[props.key]"
                disabled
              />
              <label class="form-check-label" :for="props.key"></label>
            </template>
            <template v-slot:doc="props">
              <button
                class="btn"
                v-if="props.rowData.filename"
                @click="downloadJustificatif(props.rowData)"
              >
                <font-awesome-icon :icon="['far', 'file-pdf']" />
              </button>
            </template>
            <template v-slot:actions="props">
                <router-link
                  :to="{
                    name: 'controle-medical',
                    params: { id: props.rowData.id },
                  }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button
                    class="btn btn-outline-primary border-0"
                    @click="navigate"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                </router-link>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="supprimer(props.rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';
import ControlesMedicauxService from '@/services/ControlesMedicauxService';

import BaseTable from '@/components/table/BaseTable.vue';

function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadMedecins = store.dispatch('fetchMedecins');
  let loadControlesMedicauxTypes = store.dispatch(
    'fetchControlesMedicauxTypes'
  );
  let loadControlesMedicaux = store.dispatch('fetchControlesMedicaux');

  Promise.all([
    loadSapeurs,
    loadMedecins,
    loadControlesMedicauxTypes,
    loadControlesMedicaux,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'controles-medicaux',
  components: {
    BaseTable,
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  mounted() {
    this.loading = false;
  },
  data() {
    return {
      loading: true,
      selectedId: null,
      fields: [
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        {
          title: 'Age',
          key: 'age',
          sortKey: 'age',
        },
        {
          title: 'Type',
          key: 'type',
          sortKey: 'type',
        },
        {
          title: 'Medecin',
          key: 'medecin',
          sortKey: 'medecin',
        },
        {
          title: 'Consultation',
          key: 'consultation',
          sortKey: 'consultation',
        },
        {
          title: 'Validité',
          key: 'validite',
          sortKey: 'validite',
        },
        {
          title: 'Designation',
          key: 'designation',
          sortKey: 'designation',
        },
        {
          title: 'Accepter',
          key: 'accepter',
          sortKey: 'accepter',
          columnClass: 'align-middle text-center',
          slot: 'checkbox',
        },
        {
          title: 'En cours',
          key: 'en_cours',
          sortKey: 'en_cours',
          columnClass: 'align-middle text-center',
          slot: 'checkbox',
        },
        {
          title: 'Doc',
          key: 'doc',
          sortKey: 'filename',
          slot: 'doc',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
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
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      types: (state) => state.controlesMedicauxType.liste,
      medecins: (state) => state.medecin.liste,
      listeControlesMedicaux: (state) => state.controleMedical.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      const now = Date.now();
      return this.listeControlesMedicaux
        .map((s) => {
          const sapeur = this.sapeurs.find((sap) => sap.id == s.sapeur_id);
          const age = Math.floor(
            (now - new Date(sapeur?.date_naissance || 0).getTime()) /
              1000 /
              (60 * 60 * 24) /
              365.25
          );
          return {
            ...s,
            sapeur: `${sapeur?.nom} ${sapeur?.prenom}`,
            age,
            type: this.types.find((t) => t.id == s.controle_medical_type_id)
              ?.designation,
            medecin: this.medecins.find((m) => m.id == s.medecin_id)
              ?.designation,
          };
        })
        .sort((a, b) => a.sapeur.localeCompare(b.sapeur));
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(id) {
      this.selectedId = id;
    },
    downloadJustificatif({ id, filename }) {
      ControlesMedicauxService.downloadJustificatif(id, filename);
    },
    async supprimer(controle) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce contrôle médical ?',
          question:
            "Attention, la suppression d'un contrôle est irréversible ! Il vous sera cependant possible d'en ajouter un nouveau'.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeControleMedical', controle.id);
          }
        },
      });
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }

      if (dataItem.validite && Date.parse(dataItem.validite) < new Date()) {
        return 'table-danger';
      }
      // // TODO: update pour mettre en évidence les contrôles-médicaux voulus
      // const statutsClass = {
      //   0: 'text-danger', //'Annulé',
      //   1: '', //'A saisir',
      //   2: '', //'En attente de validation',
      //   3: '', //'A imputer',
      //   4: 'table-success', //'Imputée'
      // };
      // return statutsClass[dataItem.statut];
      return '';
    },
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}
.m-td-0 > td {
  padding: 0 !important;
}
</style>
