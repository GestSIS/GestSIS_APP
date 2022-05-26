<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données personnelles</h3>
          <button @click.prevent="saveSapeur" class="btn btn-primary" v-if="hasEditPermission">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <base-select class="mb-3" label="Civilité" valueKey="id" :disabled="!hasEditPermission"
            displayKey="designation" :options="listeCivilites" v-model="activeSapeur.civilite_id" />
          <!-- NOM -->
          <div class="mb-3">
            <label for="m-sap-nom">Nom</label>
            <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['nom'] }" id="m-sap-nom" name="nom" v-model="activeSapeur.nom" />
          </div>
          <!-- PRENOM -->
          <div class="mb-3">
            <label for="m-sap-prenom">Prénom</label>
            <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['prenom'] }" id="m-sap-prenom" name="prenom"
              v-model="activeSapeur.prenom" />
          </div>
          <!-- RUE -->
          <div class="row mb-3">
            <div class="col-8">
              <label for="m-sap-rue">Rue</label>
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['rue'] }" id="m-sap-rue" name="rue" v-model="activeSapeur.rue" />
            </div>
            <div class="col-4">
              <label for="m-sap-no-rue">N°</label>
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['no_rue'] }" id="m-sap-no-rue" name="no_rue"
                v-model="activeSapeur.no_rue" />
            </div>
          </div>
          <!-- NPA + LOCALITE -->
          <base-select class="mb-3" label="NPA Localité" valueKey="id" required :disabled="!hasEditPermission"
            :options="listeLocalitesSis" :formatter="(l) => l.npa + ' ' + l.designation"
            v-model="activeSapeur.localite_id" />
          <!-- N° AVS -->
          <div class="row">
            <div class="mb-3 col-6">
              <label for="m-sap-avs">N° AVS</label>
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['no_avs'] }" id="m-sap-avs" name="no_avs"
                v-model="activeSapeur.no_avs" />
            </div>
            <div class="mb-3 col-6">
              <label for="m-sap-cotisation_avs">Cotisation AVS</label>
              <font-awesome-icon class="ms-1" v-tooltip.bottom="
                'A cocher si le sapeur veut côtiser à l\'avs dès le premier Franc au lieu de la franchise défini dans la loi.'
              " :icon="['far', 'question-circle']" />
              <div class="form-check text-center col-6">
                <input type="checkbox" :disabled="!hasEditPermission" class="form-check-input" id="m-sap-cotisation_avs"
                  v-model="activeSapeur.cotisation_avs" />
                <label class="form-check-label" for="m-sap-cotisation_avs"></label>
              </div>
            </div>
          </div>
          <!-- Email -->
          <div class="mb-3">
            <label for="m-sap-email">Email</label>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-text">
                <font-awesome-icon icon="envelope" />
              </div>
              <input class="form-control form-control-sm" :class="{ 'is-invalid': errorsData['email'] }" type="email"
                :readonly="!hasEditPermission" id="m-sap-email" name="email" v-model="activeSapeur.email" />
            </div>
          </div>
          <!-- DATE NAISSANCE + SUFFIXE -->
          <div class="row mb-3" v-if="activeSapeur.type === 0">
            <div class="col-6">
              <label for="m-sap-date-naissance">Date de naissance</label>
              <div class="input-group input-group-sm">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
                <input class="form-control form-control-sm" :class="{ 'is-invalid': errorsData['date_naissance'] }"
                  type="date" :readonly="!hasEditPermission" id="m-sap-date-naissance" name="date_naissance"
                  v-model="activeSapeur.date_naissance" />
              </div>
            </div>
            <div class="col-6">
              <label for="m-sap-suffixe">Suffixe</label>
              <font-awesome-icon class="ms-1" v-tooltip.bottom="
                'Permet de différencier deux personnes ayant le même nom et prénom.'
              " :icon="['far', 'question-circle']" />
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['suffixe'] }" id="m-sap-suffixe" name="suffixe"
                v-model="activeSapeur.suffixe" />
            </div>
          </div>
          <!-- REMARQUE -->
          <div class="mb-3">
            <label for="m-sap-remarques">Remarques</label>
            <textarea :readonly="!hasEditPermission" class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['remarque'] }" rows="3" id="m-sap-remarques" name="remarques"
              v-model="activeSapeur.remarque"></textarea>
          </div>
        </div>
      </div>
      <div class="card card-primary card-outline mb-3" v-if="estSapeur">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Références professionnelles</h3>
          <button @click.prevent="saveSapeurRefPro" class="btn btn-primary" v-if="hasEditPermission">
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <label for="m-sap-profession">Profession</label>
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                id="m-sap-profession" name="profession" v-model="activeSapeur.profession" />
            </div>
            <div class="mb-3">
              <label for="m-sap-employeur">Employeur</label>
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                id="m-sap-employeur" name="employeur" v-model="activeSapeur.employeur" />
            </div>
            <div class="mb-3">
              <label for="m-sap-lieu-travail">Lieu de travail</label>
              <input type="text" :readonly="!hasEditPermission" class="form-control form-control-sm"
                id="m-sap-lieu-travail" name="lieu_travail" v-model="activeSapeur.lieu_de_travail" />
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3" v-if="!estSapeur">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Politique</h3>
          <button @click.prevent="saveNonSapeurStatut" class="btn btn-primary" v-if="hasEditPermission">
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="politiqueActif"
                  v-model="activeSapeur.actif" :true-value="1" :false-value="0">
                <label class="form-check-label" for="politiqueActif">Actif</label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="card card-primary card-outline mb-3" v-if="estSapeur">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Photo</h3>
          <button @click="editPhoto" class="btn btn-primary" v-if="hasEditPermission">
            Modifier
          </button>
        </div>
        <div class="card-body text-center">
          <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
          <img v-else class="img img-responsive" :src="photo" />
        </div>
      </div>

      <SapeurTelephones />

      <div class="card card-primary card-outline mb-3" v-if="estSapeur">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <label for="mainFonction">Fonction principale</label>
              <select id="mainFonction" v-model="activeSapeur.fonction_id" class="form-select form-select-sm" disabled>
                <option v-for="f in listeFonctions" :key="f.id" :value="f.id">
                  {{ f.nom }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="mainGrade">Grade actuel</label>
              <select id="mainGrade" v-model="activeSapeur.grade_id" class="form-select form-select-sm" disabled>
                <option v-for="g in listGrades" :key="g.id" :value="g.id">
                  {{ g.designation }}
                </option>
              </select>
            </div>
            <!-- TODO Actif et Porteur checkbox -->
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

import SapeurService from '../../services/SapeurService.js';
import SapeurMutations from '@/components/sapeur/SapeurMutations.vue';
import SapeurTelephones from '@/components/sapeur/SapeurTelephones.vue';

export default {
  name: 'SapeurTabGeneral',
  components: {
    SapeurMutations,
    SapeurTelephones,
  },
  data() {
    return {
      errorsData: {},
      defaultPhoto: '',
      photo: null, //'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128',
    };
  },
  mounted() {
    this.$store.dispatch('fetchCivilites');
    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchGrades');
    this.$store.dispatch('fetchFonctions');

    //TODO Only if sapeur anm not if politique
    if (this.activeSapeur.type === 0) {
      SapeurService.fetchPhoto(this.activeSapeurId).then((photo) => {
        this.photo = photo;
      });
    }
  },
  computed: {
    ...mapState({
      activeSapeur: (state) => state.sapeur.active.data,
      activeSapeurId: (state) => state.sapeur.active.id ?? 0,
      estSapeur: (state) => state.sapeur.active.data.type === 0,
      listeCivilites: (state) => state.baseData.civilites,
      listeFonctions: (state) => state.fonction.liste,
      listGrades: (state) => state.grade.liste,
      hasEditPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    ...mapGetters(['listeLocalitesSis']),
  },
  watch: {
    activeSapeurId(id) {
      this.errorsData = {};
      if (this.activeSapeur.type === 0) {
        SapeurService.fetchPhoto(this.activeSapeurId).then((photo) => {
          this.photo = photo;
        });
      }
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
    async saveSapeur() {
      let fields = [
        'civilite_id',
        'nom',
        'prenom',
        'rue',
        'no_rue',
        'localite_id',
        'no_av',
        'email',
        'date_naissance',
        'suffixe',
        'remarque',
      ];
      let saveSapeur = Object.assign({}, this.activeSapeur);
      for (let key in Object.keys(saveSapeur)) {
        if (!fields.includes(key)) {
          delete saveSapeur[key];
        }
      }
      this.$store
        .dispatch('saveActiveSapeur', saveSapeur)
        .then((res) => {
          this.errorsData = {};
          this.$awn.success(res.message || 'Modifications sauvegardées');
        })
        .catch((err) => {
          this.$awn.alert(
            err.message || "Erreur lors de l'enregistrement des données"
          );
          this.errorsData = err;
        });
    },
    async saveNonSapeurStatut() {
      let saveSapeur = { id: this.activeSapeur.id, actif: this.activeSapeur.actif };
      this.$store
        .dispatch('saveNonSapeurStatut', saveSapeur)
        .then((res) => {
          this.errorsData = {};
          this.$awn.success(res.message || 'Modifications sauvegardées');
        })
        .catch((err) => {
          this.$awn.alert(
            err.message || "Erreur lors de l'enregistrement des données"
          );
          this.errorsData = err;
        });
    },
    async saveSapeurRefPro() {
      this.$store
        .dispatch('saveActiveSapeur', {
          profession: this.activeSapeur.profession,
          employeur: this.activeSapeur.employeur,
          lieu_de_travail: this.activeSapeur.lieu_de_travail,
        })
        .then((res) => {
          this.$awn.success(res.message || 'Modifications sauvegardées');
        })
        .catch(() => {
          this.$awn.alert(
            res.message || "Erreur lors de l'enregistrement des données"
          );
        });
    },
    editPhoto() {
      this.SHOW_MODAL({
        component: 'ModalPhotoSapeur',
        size: 1,
        data: this.photo,
        callback: (data) => {
          if (!data) {
            return;
          }
          return SapeurService.updatePhoto(
            this.activeSapeurId,
            data?.blob
          ).then((res) => {
            this.photo = data?.image;
          });
        },
      });
    },
  },
};
</script>

<style scoped>
</style>
