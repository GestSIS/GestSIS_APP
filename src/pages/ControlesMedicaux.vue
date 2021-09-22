<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Contrôles Medicaux
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des contrôles médicaux</h3>
            <router-link
              tag="button"
              to="/controles-medicaux/ajout"
              class="btn btn-outline-primary"
            >
              Ajouter
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
            ><template v-slot:checkbox="props">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="props.key"
                  :checked="props.rowData[props.key]"
                  disabled
                />
                <label class="custom-control-label" :for="props.key"></label>
              </div>
            </template>
            <template v-slot:doc="props">
              <div>
                <button
                  class="btn"
                  v-if="props.rowData.filename"
                  @click="downloadJustificatif(props.rowData)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
              </div>
            </template>
            <template v-slot:actions="props">
              <div class="d-flex">
                <router-link
                  tag="button"
                  :to="{
                    name: 'controle-medical',
                    params: { id: props.rowData.id },
                  }"
                  class="btn btn-outline-primary border-0"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </router-link>
                <button
                  class="btn btn-outline-primary border-0"
                  v-if="props.rowData.statut === 2"
                >
                  <!-- @click="aa(props.rowData.id)" -->
                  <font-awesome-icon :icon="['fas', 'check']" />
                </button>
              </div>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
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
          columnClass: 'text-center',
          slot: 'checkbox',
        },
        {
          title: 'En cours',
          key: 'en_cours',
          sortKey: 'en_cours',
          columnClass: 'text-center',
          slot: 'checkbox',
        },
        {
          title: 'Doc',
          key: 'doc',
          sortKey: 'filename',
          slot: 'doc',
          columnClass: 'text-center',
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
          columnClass: 'text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      listeControlesMedicaux: (state) => state.controleMedical.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters(['getSapeur', 'getMedecin', 'getControleMedicalType']),
    computedData() {
      const now = Date.now();
      return this.listeControlesMedicaux.map((s) => {
        const sapeur = this.getSapeur(s.sapeur_id);
        var age = Math.floor(
          (now - new Date(sapeur.date_naissance).getTime()) /
            1000 /
            (60 * 60 * 24) /
            365.25
        );
        return {
          ...s,
          sapeur: `${sapeur.nom} ${sapeur.prenom}`,
          age,
          type: this.getControleMedicalType(s.controle_medical_type_id)
            .designation,
          medecin: this.getMedecin(s.medecin_id).designation,
        };
      });
    },
  },
  methods: {
    selected(id) {
      this.selectedId = id;
    },
    downloadJustificatif({ id, filename }) {
      ControlesMedicauxService.downloadJustificatif(id, filename);
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }

      // TODO: update pour mettre en évidence les contrôles-médicaux voulus
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
