<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'controles-medicaux' }"
                >Controles médicaux</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
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
            <div v-if="!modeAjout" class="mb-3">
              <label for="m-exe-des">Sapeur</label>
              <input
                id="m-exe-des"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['designation'] }"
                name="nom"
                readonly
                :value="sapeurName"
              />
            </div>
            <base-select
              v-else
              v-model="controleMedical.sapeur_id"
              class="mb-3"
              :class="{ 'is-invalid': errors['sapeur_id'] }"
              label="Sapeur"
              display-key="nom_prenom"
              :options="sapeurs"
            />
            <base-select
              v-model="controleMedical.medecin_id"
              class="mb-3"
              :class="{ 'is-invalid': errors['medecin_id'] }"
              label="Médecin"
              :options="medecins"
              required
            />
            <base-select
              v-model="controleMedical.controle_medical_type_id"
              class="mb-3"
              :class="{ 'is-invalid': errors['controle_medical_type_id'] }"
              label="Type"
              :options="controleTypes"
            />
            <div class="mb-3">
              <div class="form-check">
                <input
                  id="m-ctr-accepter"
                  v-model="controleMedical.accepter"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label" for="m-ctr-accepter"
                  >Accepté</label
                >
              </div>
            </div>
            <div class="row">
              <div class="col-12" :class="{ 'col-xl-6': expirable }">
                <div class="mb-3">
                  <label for="m-exe-date">Consultation</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                    <input
                      id="m-exe-date"
                      v-model="controleMedical.consultation"
                      type="date"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['date'] }"
                      name="consultation"
                    />
                  </div>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(1)">
                    +1
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(3)">
                    +3
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(5)">
                    +5
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-12 col-xl-6">
                <div class="mb-3">
                  <label for="m-exe-date">Validité</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                    <input
                      id="m-exe-date"
                      v-model="controleMedical.validite"
                      type="date"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['date'] }"
                      name="validite"
                    />
                  </div>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(1)">
                    +1
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(3)">
                    +3
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(5)">
                    +5
                  </button>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="m-sap-communication">Désignation</label>
              <textarea
                id="m-sap-communication"
                v-model="controleMedical.designation"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['communications'] }"
                name="communications"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div v-if="controleMedical.id" class="col-lg-8 col-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h5>Document</h5>
            <div v-if="controleMedical.filename">
              {{ controleMedical.filename }}
              <button
                class="btn btn-outline-primary ms-2"
                @click="downloadJustificatif()"
              >
                Download
              </button>
              <button
                class="btn btn-outline-primary ms-2"
                @click="removeJustificatif()"
              >
                Supprimer
              </button>
            </div>
          </div>
          <div v-if="!controleMedical.filename" class="card-body">
            <div class="input-group input-group-sm mb-3">
              <p class="w-100">Aucun document</p>
              <input
                id="inputGroupFile01"
                ref="file-justificatif"
                type="file"
                class="form-control form-control-sm"
                aria-describedby="inputGroupFileAddon01"
                accept="application/pdf"
                @change="onFileChange"
              />
              <button
                v-if="!controleMedical.filename"
                class="btn btn-outline-primary"
                :disabled="!file"
                @click="ajoutJustificatif"
              >
                Ajouter
              </button>
            </div>
          </div>
          <pdf-viewer :pdf-data="pdfData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

import ControlesMedicauxService from '@/services/ControlesMedicauxService.js';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';
import PdfViewer from '@/components/pdf/PdfViewer.vue';

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
  name: 'PageControleMedical',
  components: {
    ExerciceComptable,
    PdfViewer,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  props: {
    id: {
      type: [String, Number],
      default: '0',
    },
  },
  data() {
    return {
      errors: {},
      loading: true,
      pdfData: null,
      file: null,
    };
  },
  computed: {
    ...mapState({
      controleMedical: (state) => state.controleMedical.active.data,
      medecins: (state) => state.medecin.liste,
      sapeurs: (state) =>
        state.sapeur.liste.filter((s) => s.type === 0 && parseInt(s.actif)),
      controleTypes: (state) => state.controlesMedicauxType.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    breadcrumbFinal() {
      return this.controleMedical.designation;
    },
    sapeurName() {
      return (
        this.sapeurs.find((s) => s.id == this.controleMedical.sapeur_id)
          ?.nom_prenom ?? ''
      );
    },
    modeAjout() {
      return !parseInt(this.id) > 0;
    },
    expirable() {
      const types = this.controleTypes.filter(
        (t) => t.id === this.controleMedical.controle_medical_type_id
      );
      return types.length > 0 && types[0].expirable;
    },
  },
  watch: {
    controleMedical(next, prev) {
      if (
        (this.pdfData === null && next.filename) ||
        (prev.filename !== next.filename && next.filename)
      ) {
        this.displayJustificatif();
      } else if (!next.filename) {
        this.pdfData = null;
      }
    },
    expirable(next) {
      if (!next) {
        this.controleMedical.validite = null;
      }
    },
  },
  mounted() {
    if (this.controleMedical.filename) {
      this.displayJustificatif();
    }
  },
  methods: {
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      this.file = files[0];
    },
    downloadJustificatif() {
      ControlesMedicauxService.downloadJustificatif(
        this.controleMedical.id,
        this.controleMedical.filename
      );
    },
    displayJustificatif() {
      ControlesMedicauxService.downloadJustificatif(
        this.controleMedical.id
      ).then((response) => {
        this.pdfData = response.data;
      });
    },
    async save() {
      if (this.modeAjout) {
        // Ajout d'un nouveau controle-médical
        const router = this.$router;
        this.$store
          .dispatch('createControleMedical')
          .then((res) => {
            router.push({ name: 'controle-medical', params: { id: res.id } });
          })
          .then((res) =>
            this.$awn.success(res?.message || 'Modifications enregistrées')
          )
          .catch((err) =>
            this.$awn.alert(err?.message || "Erreur lors de l'enregistrement")
          );
      } else {
        // Sauvegarder les changements
        this.$store
          .dispatch('updateControleMedical')
          .then((res) =>
            this.$awn.success(res?.message || 'Modifications enregistrées')
          )
          .catch((err) =>
            this.$awn.alert(err?.message || "Erreur lors de l'enregistrement")
          );
      }
    },
    ajoutJustificatif() {
      if (this.$refs['file-justificatif'].files.length > 0) {
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
      this.controleMedical.validite = `${year + duree}-${('0' + month).slice(
        -2
      )}-${('0' + day).slice(-2)}`;
    },
  },
};
</script>

<style lang="scss" scoped></style>
