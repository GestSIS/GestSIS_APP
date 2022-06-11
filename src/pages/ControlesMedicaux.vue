<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
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
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <router-link
              custom
              to="/controles-medicaux/ajout"
              v-slot="{ navigate }"
            >
              <button @click="navigate" class="btn btn-outline-primary">
                Ajouter un contrôle
              </button>
            </router-link>
            <router-link
              custom
              :to="'/controles-medicaux/' + selectedItem?.id"
              v-slot="{ navigate }"
            >
              <button
                :disabled="!selectedItem"
                @click="navigate"
                class="btn btn-outline-primary"
              >
                Modifier
              </button>
            </router-link>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <div class="card-body d-grid gap-2">
            <button
              :disabled="!selectedItem?.filename"
              @click="downloadJustificatif(selectedItem)"
              class="btn btn-outline-primary"
            >
              Justificatif
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <select
                  class="form-select form-select-sm"
                  @change="
                    (event) =>
                      onFilter('controle_medical_type_id', event.target.value)
                  "
                >
                  <option>&lt;Type&gt;</option>
                  <option v-for="t in filteredTypes" :key="t.id" :value="t.id">
                    {{ t.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <select
                  class="form-select form-select-sm"
                  @change="
                    (event) => onFilter('medecin_id', event.target.value)
                  "
                >
                  <option>&lt;Médecin&gt;</option>
                  <option
                    v-for="medecin in filteredMedecins"
                    :key="medecin.id"
                    :value="medecin.id"
                  >
                    {{ medecin.designation }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6">
                <select
                  class="form-select form-select-sm"
                  @change="
                    (event) => onAnneeFilter('consultation', event.target.value)
                  "
                >
                  <option>&lt;Année de consultation&gt;</option>
                  <option
                    v-for="annee in filteredAnneesConsultation"
                    :key="annee"
                    :value="annee"
                  >
                    {{ annee }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <select
                  class="form-select form-select-sm"
                  @change="
                    (event) => onAnneeFilter('validite', event.target.value)
                  "
                >
                  <option>&lt;Année de validite&gt;</option>
                  <option
                    v-for="annee in filteredAnneesExpiration"
                    :key="annee"
                    :value="annee"
                  >
                    {{ annee }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5 table-responsive">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des contrôles médicaux</h3>
          </div>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :fields="fields"
            no-data="Aucun contrôle médical à afficher"
            :row-class="onRowClass"
            :data="filteredControles"
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

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';
import ControlesMedicauxService from '@/services/ControlesMedicauxService.js';

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
      selectedItem: null,
      filters: {},
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
          title: 'Accepté',
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
      controlesMedicaux: (state) => state.controleMedical.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      const now = Date.now();
      return this.controlesMedicaux
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
    filteredControles() {
      return this.computedData.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val >= 0 || typeof val == 'function')
          .map(([key, value]) =>
            typeof value == 'function'
              ? (x) => value(x[key])
              : (x) => x[key] == value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
    filteredTypes() {
      const ids = new Set(
        this.controlesMedicaux.map((e) => e.controle_medical_type_id)
      );
      return this.types.filter((t) => ids.has(t.id));
    },
    filteredMedecins() {
      const ids = new Set(this.controlesMedicaux.map((e) => e.medecin_id));
      return this.medecins.filter((t) => ids.has(t.id));
    },
    filteredAnneesConsultation() {
      return new Set(
        this.controlesMedicaux
          .map((e) => e.consultation)
          .filter((e) => e)
          .map((d) => new Date(d).getFullYear())
          .sort()
          .reverse()
      );
    },
    filteredAnneesExpiration() {
      return new Set(
        this.controlesMedicaux
          .map((e) => e.validite)
          .filter((e) => e)
          .map((d) => new Date(d).getFullYear())
          .sort()
          .reverse()
      );
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(item) {
      this.selectedItem = item;
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

      if (
        (dataItem.validite && Date.parse(dataItem.validite) < new Date()) ||
        !dataItem.accepter
      ) {
        return 'table-danger';
      }
      // // TODO: update pour mettre en évidence les contrôles-médicaux voulus
      // const statutsClass = {
      //   0: 'text-danger', //'Annulé',
      //   1: '', //'A saisir',
      //   2: '', //'En attente de validation',
      //   3: '', //'Validé',
      //   4: 'table-success', //'Imputé'
      // };
      // return statutsClass[dataItem.statut];
      return '';
    },
    onAnneeFilter(key, value) {
      if (parseInt(value)) {
        this.filters = {
          ...this.filters,
          [key]: (e) => e && new Date(e).getFullYear() == value,
        };
      } else {
        this.filters = { ...this.filters, [key]: undefined };
      }
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
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
