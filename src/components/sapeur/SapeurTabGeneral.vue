<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données personnelles</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveSapeur"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <base-select
            v-model="activeSapeur.civilite_id"
            class="mb-3"
            label="Civilité"
            value-key="id"
            :disabled="!hasEditPermission"
            display-key="designation"
            :options="civilites"
          />
          <!-- NOM -->
          <div class="mb-3">
            <label for="m-sap-nom">Nom</label>
            <input
              id="m-sap-nom"
              v-model="activeSapeur.nom"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['nom'] }"
              name="nom"
            />
          </div>
          <!-- PRENOM -->
          <div class="mb-3">
            <label for="m-sap-prenom">Prénom</label>
            <input
              id="m-sap-prenom"
              v-model="activeSapeur.prenom"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['prenom'] }"
              name="prenom"
            />
          </div>
          <!-- RUE -->
          <div class="row mb-3">
            <div class="col-8">
              <label for="m-sap-rue">Rue</label>
              <input
                id="m-sap-rue"
                v-model="activeSapeur.rue"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['rue'] }"
                name="rue"
              />
            </div>
            <div class="col-4">
              <label for="m-sap-no-rue">N°</label>
              <input
                id="m-sap-no-rue"
                v-model="activeSapeur.no_rue"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['no_rue'] }"
                name="no_rue"
              />
            </div>
          </div>
          <!-- NPA + LOCALITE -->
          <base-select
            v-model="activeSapeur.localite_id"
            class="mb-3"
            label="Localité"
            required
            :disabled="!hasEditPermission"
            :options="localites"
          />
          <!-- N° AVS -->
          <div class="row">
            <div class="mb-3 col-6">
              <label for="m-sap-avs">N° AVS</label>
              <input
                id="m-sap-avs"
                v-model="activeSapeur.no_avs"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['no_avs'] }"
                name="no_avs"
              />
            </div>
            <div class="mb-3 col-6">
              <label for="m-sap-cotisation_avs">Cotisation AVS</label>
              <font-awesome-icon
                v-tooltip.bottom="
                  'A cocher si le sapeur veut côtiser à l\'avs dès le premier Franc au lieu de la franchise défini dans la loi.'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <div class="form-check text-center col-6">
                <input
                  id="m-sap-cotisation_avs"
                  v-model="activeSapeur.cotisation_avs"
                  type="checkbox"
                  :disabled="!hasEditPermission"
                  class="form-check-input"
                />
                <label
                  class="form-check-label"
                  for="m-sap-cotisation_avs"
                ></label>
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
              <input
                id="m-sap-email"
                v-model="activeSapeur.email"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['email'] }"
                type="email"
                :readonly="!hasEditPermission"
                name="email"
              />
            </div>
          </div>
          <!-- DATE NAISSANCE + SUFFIXE -->
          <div v-if="activeSapeur.type === 0" class="row mb-3">
            <div class="col-6">
              <label for="m-sap-date-naissance">Date de naissance</label>
              <div class="input-group input-group-sm">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
                <input
                  id="m-sap-date-naissance"
                  v-model="activeSapeur.date_naissance"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errorsData['date_naissance'] }"
                  type="date"
                  :readonly="!hasEditPermission"
                  name="date_naissance"
                />
              </div>
            </div>
            <div class="col-6">
              <label for="m-sap-suffixe">Suffixe</label>
              <font-awesome-icon
                v-tooltip.bottom="
                  'Permet de différencier deux personnes ayant le même nom et prénom.'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <input
                id="m-sap-suffixe"
                v-model="activeSapeur.suffixe"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['suffixe'] }"
                name="suffixe"
              />
            </div>
          </div>
          <!-- REMARQUE -->
          <div class="mb-3">
            <label for="m-sap-remarques">Remarques</label>
            <textarea
              id="m-sap-remarques"
              v-model="activeSapeur.remarque"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['remarque'] }"
              rows="3"
              name="remarques"
            ></textarea>
          </div>
        </div>
      </div>
      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Références professionnelles</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveSapeurRefPro"
          >
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <label for="m-sap-profession">Profession</label>
              <input
                id="m-sap-profession"
                v-model="activeSapeur.profession"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                name="profession"
              />
            </div>
            <div class="mb-3">
              <label for="m-sap-employeur">Employeur</label>
              <input
                id="m-sap-employeur"
                v-model="activeSapeur.employeur"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                name="employeur"
              />
            </div>
            <div class="mb-3">
              <label for="m-sap-lieu-travail">Lieu de travail</label>
              <input
                id="m-sap-lieu-travail"
                v-model="activeSapeur.lieu_de_travail"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                name="lieu_travail"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div v-if="!estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Politique</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveNonSapeurStatut"
          >
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <div class="form-check form-switch">
                <input
                  id="politiqueActif"
                  v-model="activeSapeur.actif"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="politiqueActif"
                  >Actif</label
                >
              </div>
            </div>
          </div>
        </form>
      </div>

      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Photo</h3>
          <button
            v-if="hasEditPermission"
            class="ms-auto me-2 btn btn-outline-danger"
            @click="supprimerPhoto"
          >
            Supprimer
          </button>
          <button
            v-if="hasEditPermission"
            class="btn btn-outline-primary"
            @click="editPhoto"
          >
            Modifier
          </button>
        </div>
        <div class="card-body text-center">
          <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
          <img v-else class="img img-responsive" :src="photo" />
        </div>
      </div>

      <SapeurTelephones />

      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <label for="mainFonction">Fonction principale</label>
              <select
                id="mainFonction"
                v-model="activeSapeur.fonction_id"
                class="form-select form-select-sm"
                disabled
              >
                <option v-for="f in fonctions" :key="f.id" :value="f.id">
                  {{ f.nom }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="mainGrade">Grade actuel</label>
              <select
                id="mainGrade"
                v-model="activeSapeur.grade_id"
                class="form-select form-select-sm"
                disabled
              >
                <option v-for="g in grades" :key="g.id" :value="g.id">
                  {{ g.designation }}
                </option>
              </select>
            </div>
            <div class="mb-3 form-check">
              <input
                id="actif"
                v-model="activeSapeur.actif"
                type="checkbox"
                name="actif"
                class="form-check-input"
                disabled
                :true-value="1"
                :false-value="0"
              />
              <label for="actif">Actif</label>
              <font-awesome-icon
                v-tooltip.bottom="
                  'Pour désactiver un sapeur, utiliser l\'onglet Mutations !'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </div>
            <!-- TODO Porteur checkbox -->
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

import SapeurService from '../../services/SapeurService.js';
import SapeurTelephones from '@/components/sapeur/SapeurTelephones.vue';

import store from '@/store/index';
async function loadData(routeTo, next) {
  if (routeTo.params.id == 'ajout') {
    next();
  } else {
    const sapeurId = parseInt(routeTo.params.id);
    await store.dispatch('selectSapeur', sapeurId);

    const loadTelephones = store.dispatch('fetchTelephoneTypes');
    const loadTelephonesType = store.dispatch('fetchSapeurTelephones');
    const loadSapeur = store.dispatch('fetchSapeur', sapeurId);

    Promise.all([loadSapeur, loadTelephones, loadTelephonesType]).then(() => {
      next();
    });
  }
}

export default {
  name: 'SapeurTabGeneral',
  components: {
    SapeurTelephones,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      errorsData: {},
      defaultPhoto: '',
      photo: null, //'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128',
    };
  },
  computed: {
    ...mapState({
      activeSapeur: (state) => state.sapeur.active.data,
      activeSapeurId: (state) => state.sapeur.active.id ?? 0,
      estSapeur: (state) => state.sapeur.active.data.type === 0,
      civilites: (state) => state.baseData.civilites,
      localites: (state) => state.localite.liste,
      fonctions: (state) => state.fonction.liste,
      grades: (state) => state.grade.liste,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
  },
  watch: {
    activeSapeurId() {
      this.errorsData = {};
      if (this.activeSapeur.type === 0) {
        SapeurService.fetchPhoto(this.activeSapeurId).then((photo) => {
          this.photo = photo;
        });
      }
    },
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
      let saveSapeur = {
        id: this.activeSapeur.id,
        actif: this.activeSapeur.actif,
      };
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
        .catch((err) => {
          this.$awn.alert(
            err.message || "Erreur lors de l'enregistrement des données"
          );
        });
    },
    supprimerPhoto() {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: `Voulez-vous vraiment supprimer cette photo ?`,
          question:
            'Attention, cette action est irréversible ! La photo sera perdue.',
        },
        callback: (confirmed) => {
          if (confirmed) {
            SapeurService.deletePhoto(this.activeSapeurId).then(() => {
              this.photo = null;
            });
          }
        },
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
          ).then(() => {
            this.photo = data?.image;
          });
        },
      });
    },
  },
};
</script>

<style scoped></style>
