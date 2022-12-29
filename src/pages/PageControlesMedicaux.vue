<template>
  <stateful-filter
    id="controles-medicaux"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
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
                v-slot="{ navigate }"
                custom
                :to="{ name: 'controle-medical', params: { id: 'ajout' } }"
              >
                <button class="btn btn-outline-primary" @click="navigate">
                  Ajouter un contrôle
                </button>
              </router-link>
              <router-link
                v-slot="{ navigate }"
                custom
                :to="'/controles-medicaux/' + selectedItem?.id"
              >
                <button
                  :disabled="!selectedItem"
                  class="btn btn-outline-primary"
                  @click="navigate"
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
                class="btn btn-outline-primary"
                @click="downloadJustificatif(selectedItem)"
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
                <div class="col-md-12 mb-2">
                  <input
                    id="only_latest"
                    v-model="latest"
                    type="checkbox"
                    class="form-check-input"
                  />
                  <label class="form-check-label ms-2" for="only_latest"
                    >Derniers contrôles de chaque sapeurs</label
                  >
                </div>
                <base-select
                  class="col-md-6"
                  base-option="<Type>"
                  :options="filteredTypes"
                  :model-value="filters.controle_medical_type_id"
                  @update:model-value="
                    (v) => setFilter('controle_medical_type_id', v)
                  "
                />
                <base-select
                  class="col-md-6"
                  base-option="<Médecin>"
                  :options="filteredMedecins"
                  :model-value="filters.medecin_id"
                  @update:model-value="(v) => setFilter('medecin_id', v)"
                />
              </div>
              <div class="row mt-2">
                <base-select
                  class="col-md-6"
                  base-option="<Année de consultation>"
                  :options="
                    [...filteredAnneesConsultation].map((annee) => ({
                      id: annee,
                      designation: annee,
                    }))
                  "
                  @change="(v) => onAnneeFilter(setFilter, 'consultation', v)"
                />
                <base-select
                  class="col-md-6"
                  base-option="<Année de validité>"
                  :options="
                    [...filteredAnneesExpiration].map((annee) => ({
                      id: annee,
                      designation: annee,
                    }))
                  "
                  @change="(v) => onAnneeFilter(setFilter, 'validite', v)"
                />
                <div v-if="canReset" class="col-md-6">
                  <button class="btn btn-sm btn-warning w-100" @click="reset">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <!-- /.card-header -->
          <div class="card card-primary card-outline table-responsive">
            <div class="card-header d-flex justify-content-between">
              <h3>Liste des contrôles médicaux</h3>
            </div>
            <div v-if="loading" class="card-body d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <base-table
              v-show="!loading"
              :fields="fields"
              no-data="Aucun contrôle médical à afficher"
              :row-class="onRowClass"
              :data="filteredData"
              :selectable="true"
              @selected="selected"
            >
              <template #doc="{ rowData }">
                <button
                  v-if="rowData.filename"
                  class="btn"
                  @click="downloadJustificatif(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
              </template>
              <template #actions="{ rowData }">
                <router-link
                  v-slot="{ navigate }"
                  :to="{
                    name: 'controle-medical',
                    params: { id: rowData.id },
                  }"
                  custom
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
                  @click="supprimer(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import ControlesMedicauxService from '/src/services/ControlesMedicauxService.js';

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
  name: 'PageControlesMedicaux',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      latest: true,
      loading: true,
      selectedItem: null,
      fields: [
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Age', key: 'age' },
        { title: 'Type', key: 'type' },
        { title: 'Medecin', key: 'medecin' },
        { title: 'Consultation', key: 'consultation', type: Date },
        { title: 'Validité', key: 'validite', type: Date },
        { title: 'Designation', key: 'designation' },
        { title: 'Accepté', key: 'accepter', type: Boolean },
        { title: 'En cours', key: 'en_cours', type: Boolean },
        {
          title: 'Doc',
          key: 'doc',
          slot: 'doc',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
        {
          title: 'Actions',
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
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      const now = Date.now();
      const data = this.controlesMedicaux
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
            sapeur: sapeur?.nom_prenom,
            age,
            type: this.types.find((t) => t.id == s.controle_medical_type_id)
              ?.designation,
            medecin: this.medecins.find((m) => m.id == s.medecin_id)
              ?.designation,
          };
        })
        .sort(
          (a, b) =>
            a.sapeur.localeCompare(b.sapeur) ||
            b.consultation.localeCompare(a.consultation)
        );

      // Additional filter check
      if (!this.latest) {
        return data;
      }

      const index = new Set();
      return data.reduce((acc, e) => {
        if (!index.has(e.sapeur + '_' + e.controle_medical_type_id)) {
          index.add(e.sapeur + '_' + e.controle_medical_type_id);
          acc.push(e);
        }
        return acc;
      }, []);
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
  mounted() {
    this.loading = false;
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
    },
    onAnneeFilter(setFilter, key, value) {
      if (parseInt(value)) {
        setFilter(key, (e) => e && new Date(e).getFullYear() == value);
      } else {
        setFilter(key, undefined);
      }
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
