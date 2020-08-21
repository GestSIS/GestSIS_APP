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
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'exercices' }">
                Controles médicaux
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-lg-4 col-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h5>Infos</h5>
            <button class="btn btn-outline-primary" @click="save">
              {{ modeAjout ? 'Ajouter' : 'Enregistrer' }}
            </button>
          </div>
          <div class="card-body">
            <!-- NOM -->
            <div class="form-group" v-if="!modeAjout">
              <label for="m-exe-des">Sapeur</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors['designation'] }"
                id="m-exe-des"
                name="nom"
                readonly
                :value="sapeurName"
              />
            </div>
            <div class="form-group" v-else>
              <label for="m-exe-des">Sapeur</label>
              <select
                class="custom-select required"
                :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
                id="m-sap-cat"
                style="width: 100%;"
                v-model="controleMedical.sapeur_id"
              >
                <option
                  v-for="sapeur in listeSapeurs"
                  :key="sapeur.id"
                  :value="sapeur.id"
                  >{{ sapeur.nom }} {{ sapeur.prenom }}</option
                >
              </select>
            </div>
            <!-- MEDECIN -->
            <div class="form-group">
              <label for="m-sap-cat">Médecin</label>
              <select
                class="custom-select required"
                :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
                id="m-sap-cat"
                style="width: 100%;"
                v-model="controleMedical.medecin_id"
              >
                <option
                  v-for="medecin in listeMedecins"
                  :key="medecin.id"
                  :value="medecin.id"
                  >{{ medecin.designation }}</option
                >
              </select>
            </div>
            <!-- TYPE -->
            <div class="form-group">
              <label for="m-sap-cat">Type</label>
              <select
                class="custom-select required"
                :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
                id="m-sap-cat"
                style="width: 100%;"
                v-model="controleMedical.controle_medical_type_id"
              >
                <option
                  v-for="t in listeControlesTypes"
                  :key="t.id"
                  :value="t.id"
                  >{{ t.designation }}</option
                >
              </select>
            </div>
            <!-- ACCEPTER -->
            <div class="form-group">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="m-ctr-accepter"
                  v-model="controleMedical.accepter"
                />
                <label class="custom-control-label" for="m-ctr-accepter"
                  >Accepté</label
                >
              </div>
            </div>
            <div class="row">
              <div class="col-12 col-xl-6">
                <!-- CONSULTATION -->
                <div class="form-group">
                  <label for="m-exe-date">Consultation</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <font-awesome-icon :icon="['far', 'calendar-alt']" />
                      </div>
                    </div>
                    <input
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': errors['date'] }"
                      id="m-exe-date"
                      name="consultation"
                      v-model="controleMedical.consultation"
                    />
                  </div>
                </div>
              </div>
              <div class="col-4 d-xl-none" v-if="expirable">
                <button class="btn btn-primary btn-block" @click="validite(1)">
                  +1
                </button>
              </div>
              <div class="col-4 d-xl-none" v-if="expirable">
                <button class="btn btn-primary btn-block" @click="validite(2)">
                  +2
                </button>
              </div>
              <div class="col-4 d-xl-none" v-if="expirable">
                <button class="btn btn-primary btn-block" @click="validite(5)">
                  +5
                </button>
              </div>
              <div class="col-12 col-xl-6" v-if="expirable">
                <!-- Validité -->
                <div class="form-group">
                  <label for="m-exe-date">Validité</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <font-awesome-icon :icon="['far', 'calendar-alt']" />
                      </div>
                    </div>
                    <input
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': errors['date'] }"
                      id="m-exe-date"
                      name="validite"
                      v-model="controleMedical.validite"
                    />
                  </div>
                </div>
              </div>
              <div class="col-4 d-none d-xl-block" v-if="expirable">
                <button class="btn btn-primary btn-block" @click="validite(1)">
                  +1
                </button>
              </div>
              <div class="col-4 d-none d-xl-block" v-if="expirable">
                <button class="btn btn-primary btn-block" @click="validite(2)">
                  +2
                </button>
              </div>
              <div class="col-4 d-none d-xl-block" v-if="expirable">
                <button class="btn btn-primary btn-block" @click="validite(5)">
                  +5
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="m-sap-communication">Désignation</label>
              <textarea
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors['communications'] }"
                id="m-sap-communication"
                name="communications"
                v-model="controleMedical.designation"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8 col-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h5>Document</h5>
          </div>
          <div class="card-body">
            <div v-if="controleMedical.filename">
              {{ controleMedical.filename }}
              <button class="btn btn-outline-primary ml-2" @click="downloadJustificatif()">Download</button>
              <!-- TODO Affichage du fichier pdf -->
              <!-- <button class="btn btn-outline-primary ml-2" @click="displayJustificatif()">Display</button> -->
              <button class="btn btn-outline-primary ml-2" @click="removeJustificatif()">Supprimer</button>
            </div>
            <div class="input-group mb-3" v-else>
              <p class="w-100">Aucun document</p>
              <div class="custom-file">
                <input
                  type="file"
                  class="custom-file-input"
                  id="inputGroupFile01"
                  aria-describedby="inputGroupFileAddon01"
                  accept="application/pdf"
                  ref="file-justificatif"
                >
                <label class="custom-file-label" for="inputGroupFile01">Choisissez un fichier</label>
              </div>
              <button class="btn btn-outline-primary ml-2" @click="ajoutJustificatif" v-if="!controleMedical.filename">
                Ajouter
              </button>
            </div>
            <div v-if="pdfData3">
              <pdf-viewer :pdf-data="pdfUri"></pdf-viewer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import store from '@/store/index';

import ControlesMedicauxService from '@/services/ControlesMedicauxService';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';
import PdfViewer from '@/components/pdf/PdfViewer';

function loadData(routeTo, next) {
  const idControle = parseInt(routeTo.params.id);
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadMedecins = store.dispatch('fetchMedecins');
  const loadControlesMedicauxTypes = store.dispatch(
    'fetchControlesMedicauxTypes'
  );

  let loadControleMedicale =
    idControle > 0
      ? store.dispatch('fetchControleMedical', idControle)
      : store.dispatch('resetControleMedical');

  Promise.all([
    loadSapeurs,
    loadMedecins,
    loadControlesMedicauxTypes,
    loadControleMedicale,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'controleMedical',
  components: {
    ExerciceComptable,
    PdfViewer
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      errors: {},
      loading: true,
      pdfData1: null,
      pdfData2: null,
      pdfData3: null,
      pdfUri: null
    };
  },
  props: {
    id: {
      type: [String, Number],
    },
  },
  computed: {
    ...mapGetters(['getSapeur']),
    ...mapState({
      controleMedical: (state) => state.controleMedical.active.data,
      listeMedecins: (state) => state.medecin.liste,
      listeSapeurs: (state) => state.sapeur.liste,
      listeControlesTypes: (state) => state.controlesMedicauxType.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    breadcrumbFinal() {
      return this.controleMedical.designation;
    },
    sapeurName() {
      const sapeur = this.getSapeur(this.controleMedical.sapeur_id);
      return sapeur ? `${sapeur.nom} ${sapeur.prenom}` : '';
    },
    modeAjout() {
      return !parseInt(this.id) > 0;
    },
    expirable() {
      const types = this.listeControlesTypes.filter(
        (t) => t.id === this.controleMedical.controle_medical_type_id
      );
      return types.length > 0 && types[0].expirable;
    },
  },
  methods: {
    downloadJustificatif() {
      ControlesMedicauxService.getJustificatif(this.controleMedical.id)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // link.target = '_blank' // If we want to open it in another tab
        console.log(response);
        link.setAttribute('download', 'file.pdf')
        // link.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
        link.click();
        window.URL.revokeObjectURL(url);
      });
    },
    displayJustificatif() {
      ControlesMedicauxService.getJustificatif(this.controleMedical.id)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // this.pdfUri = url;
          this.pdfUri = URL.createObjectURL(new Blob([response.data]));
          this.pdfData1 = new Blob([response.data]);
          this.pdfData2 = new Blob([response.data], {type: 'application/pdf'});
          this.pdfData3 = response.data;
          window.URL.revokeObjectURL(url);
        });
    },
    save() {
      if (this.modeAjout) {
        // Ajout d'un nouveau controle-médical
        const router = this.$router;
        this.$store.dispatch('createControleMedical').then((res) => {
          router.push({ name: 'controle-medical', params: { id: res.id } });
        });
      } else {
        // Sauvegarder les changements
        this.$store.dispatch('updateControleMedical');
      }
    },
    ajoutJustificatif() {
      if(this.$refs['file-justificatif'].files.length > 0) {
        const file = this.$refs['file-justificatif'].files[0];
        this.$store.dispatch('addJustificatif', file);
      }
    },
    removeJustificatif() {
      this.$store.dispatch('removeJustificatif');
    },
    validite(duree) {
      var d = new Date(this.controleMedical.consultation || Date.now());
      var year = d.getFullYear();
      var month = d.getMonth() + 1;
      var day = d.getDate();
      this.controleMedical.validite = `${year + duree}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`;
    },
  },
};
</script>

<style lang="scss" scoped></style>
