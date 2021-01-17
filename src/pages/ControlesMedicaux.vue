<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
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
          <vuetable
            v-show="!loading"
            ref="vuetable_medicaux"
            :api-mode="false"
            :fields="fields"
            detail-row-class="m-td-0"
            :css="css.table"
            :data-manager="dataManager"
            no-data-template="Aucun contrôle médical à afficher"
            :row-class="onRowClass"
          >
            <div slot="accepter" slot-scope="props" class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="accepter" :checked="props.rowData.accepter" disabled>
              <label class="custom-control-label" for="accepter"></label>
            </div>
            <div slot="en_cours" slot-scope="props" class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="en_cours" :checked="props.rowData.en_cours" disabled>
              <label class="custom-control-label" for="en_cours"></label>
            </div>
            <div slot="doc" slot-scope="props">
              <button class="btn" v-if="props.rowData.filename" @click="downloadJustificatif(props.rowData)">
                <font-awesome-icon :icon="['far', 'file-pdf']"/>
              </button>
            </div>
            <div slot="actions" slot-scope="props">
              <router-link
                tag="button"
                :to="{name:'controle-medical', params:{'id':props.rowData.id}}"
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
          </vuetable>
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

import Vuetable from 'vuetable-2';
// import VuetableRowHeader from 'vuetable-2/src/components/VuetableRowHeader.vue'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadMedecins = store.dispatch('fetchMedecins');
  let loadControlesMedicauxTypes = store.dispatch('fetchControlesMedicauxTypes');
  let loadControlesMedicaux = store.dispatch('fetchControlesMedicaux');

  Promise.all([loadSapeurs, loadMedecins, loadControlesMedicauxTypes, loadControlesMedicaux]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'controles-medicaux',
  components: {
    Vuetable,
    ExerciceComptable
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  mounted() {
    this.$refs.vuetable_medicaux.setData(this.computedData);
    this.loading = false;
  },
  data() {
    return {
      css: CssForBootstrap4,
      toggles: {},
      loading: true,
      fields: [
        {
          title: 'Sapeur',
          name: 'sapeur',
          sortField: 'sapeur'
        },
        {
          title: 'Age',
          name: 'age',
          sortField: 'age'
        },
        {
          title: 'Type',
          name: 'type',
          sortField: 'type'
        },
        {
          title: 'Medecin',
          name: 'medecin',
          sortField: 'medecin',
        },
        {
          title: 'Consultation',
          name: 'consultation',
          sortField: 'consultation'
        },
        {
          title: 'Validité',
          name: 'validite',
          sortField: 'validite',
        },
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation'
        },
        {
          title: 'Accepter',
          name: 'accepter',
          sortField: 'accepter',
          dataClass: 'text-center'
        },
        {
          title: 'En cours',
          name: 'en_cours',
          sortField: 'en_cours',
          dataClass: 'text-center'
        },
        {
          title: 'Doc',
          name: 'doc',
          sortField: 'doc',
          dataClass: 'text-center'
        },
        {
          title: 'Actions',
          name: 'actions',
          dataClass: 'text-center'
        }
      ]
    };
  },
  computed: {
    ...mapState({
      listeControlesMedicaux: state => state.controleMedical.liste,
      currentExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    ...mapGetters(['getSapeur', 'getMedecin', 'getControleMedicalType']),
    computedData() {
      const now = Date.now();
      return this.listeControlesMedicaux.map(s => {
        const sapeur = this.getSapeur(s.sapeur_id);
        var age = Math.floor(((now - new Date(sapeur.date_naissance).getTime()) / 1000 / (60 * 60 * 24))/365.25);
        return {
          ...s,
          sapeur: `${sapeur.nom} ${sapeur.prenom}`,
          age,
          type: this.getControleMedicalType(s.controle_medical_type_id).designation,
          medecin: this.getMedecin(s.medecin_id).designation
        };
      });
    }
  },
  methods: {
    downloadJustificatif({id, filename}) {
      ControlesMedicauxService.getJustificatif(id).then(
        (response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          // link.target = '_blank' // If we want to open it in another tab
          link.setAttribute('download', filename);
          // link.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
          link.click();
          window.URL.revokeObjectURL(url);
        }
      );
    },
    dataManager(sortOrder) {
      if (this.computedData.length < 1) return;

      let local = this.computedData;

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        local = _.orderBy(
          local,
          sortOrder[0].sortField,
          sortOrder[0].direction
        );
      }

      return {
        data: local
      };
    },
    onRowClass(dataItem) {
      // TODO: update pour mettre en évidence les contrôles-médicaux voulus
      const statutsClass = {
        0: 'text-danger', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: '', //'A imputer',
        4: 'table-success' //'Imputée'
      };
      return statutsClass[dataItem.statut];
    }
  }
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
