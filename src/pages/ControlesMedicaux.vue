<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
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
      <div class="col-md-4 d-flex justify-content-end">
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
              to="/exercices/new"
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
            ref="vuetable_mediaux"
            :api-mode="false"
            :fields="fields"
            :detail-row-component="detailRow"
            detail-row-class="m-td-0"
            :css="css.table"
            :data-manager="dataManager"
            :row-class="onRowClass"
          >
            <div slot="details" slot-scope="props">
              <button
                class="btn btn-link border-0"
                @click="toggleDetails(props.rowData.id)"
              >
                <font-awesome-icon
                  v-if="toggles[props.rowData.id] || false"
                  :icon="['fas', 'angle-down']"
                />
                <font-awesome-icon
                  v-if="!(toggles[props.rowData.id] || false)"
                  :icon="['fas', 'angle-right']"
                />
              </button>
            </div>
            <div slot="actions" slot-scope="props">
              <router-link
                tag="button"
                :to="'/exercices/' + props.rowData.id"
                class="btn btn-outline-primary border-0"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </router-link>
              <button
                class="btn btn-outline-primary border-0"
                @click="validerExercice(props.rowData.id)"
                v-if="props.rowData.statut === 2"
              >
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
    this.$refs.vuetable_mediaux.setData(this.computedData);
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
          sortField: 'age',
          dataClass: 'align-middle'
        },
        {
          title: 'Type',
          name: 'type'
        },
        {
          title: 'Medecin',
          name: 'medecin',
          dataClass: 'align-middle'
        },
        {
          title: 'Consultation',
          name: 'date',
          sortField: 'date',
          dataClass: 'align-middle'
        },
        {
          title: 'Validité',
          name: 'validité',
          dataClass: 'align-middle'
        },
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation',
          dataClass: 'align-middle'
        },
        {
          title: 'Accepter',
          name: 'accepter',
          sortField: 'accepter',
          dataClass: 'align-middle'
        },
        {
          title: 'En cours',
          name: 'en_cours',
          sortField: 'en_cours',
          dataClass: 'align-middle'
        },
        {
          title: 'Doc',
          name: 'doc',
          dataClass: 'align-middle',
          sortField: 'doc'
        },
        {
          title: 'Actions',
          name: 'actions',
          dataClass: 'align-middle'
        }
      ]
    };
  },
  computed: {
    ...mapState({
      listeControlesMedicaux: state => state.controlesMedicaux.liste,
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
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id]
      };
      this.$refs.vuetable_mediaux.toggleDetailRow(id);
    },
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
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
