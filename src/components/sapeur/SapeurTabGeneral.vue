<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données personnelles</h3>
          <button @click.prevent="saveSapeur" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <base-select
            label="Civilité"
            valueKey="id"
            displayKey="designation"
            :options="listeCivilites"
            v-model="activeSapeur.civilite_id"
          />
          <!-- NOM -->
          <div class="form-group">
            <label for="m-sap-nom">Nom</label>
            <input
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['nom'] }"
              id="m-sap-nom"
              name="nom"
              v-model="activeSapeur.nom"
            />
          </div>
          <!-- PRENOM -->
          <div class="form-group">
            <label for="m-sap-prenom">Prénom</label>
            <input
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['prenom'] }"
              id="m-sap-prenom"
              name="prenom"
              v-model="activeSapeur.prenom"
            />
          </div>
          <!-- RUE -->
          <div class="row">
            <div class="col-8">
              <div class="form-group">
                <label for="m-sap-rue">Rue</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errorsData['rue'] }"
                  id="m-sap-rue"
                  name="rue"
                  v-model="activeSapeur.rue"
                />
              </div>
            </div>
            <div class="col-4">
              <div class="form-group">
                <label for="m-sap-no-rue">N°</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errorsData['no_rue'] }"
                  id="m-sap-no-rue"
                  name="no_rue"
                  v-model="activeSapeur.no_rue"
                />
              </div>
            </div>
          </div>
          <!-- NPA + LOCALITE -->
          <base-select
            label="NPA Localité"
            valueKey="id"
            required
            :options="listeLocalitesSis"
            :formatter="(l) => l.npa + ' ' + l.designation"
            v-model="activeSapeur.localite_id"
          />
          <!-- N° AVS -->
          <div class="row">
            <div class="form-group col-6">
              <label for="m-sap-avs">N° AVS</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['no_avs'] }"
                id="m-sap-avs"
                name="no_avs"
                v-model="activeSapeur.no_avs"
              />
            </div>
            <div class="col-6">
              <label for="m-sap-cotisation_avs">Cotisation AVS</label
              ><font-awesome-icon
                class="ml-1"
                v-tooltip.bottom="
                  'A cocher si le sapeur veut côtiser à l\'avs dès le premier Franc au lieu de la franchise défini dans la loi.'
                "
                :icon="['far', 'question-circle']"
              />
              <div class="custom-control custom-checkbox text-center col-6">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="m-sap-cotisation_avs"
                  v-model="activeSapeur.cotisation_avs"
                />
                <label
                  class="custom-control-label"
                  for="m-sap-cotisation_avs"
                ></label>
              </div>
            </div>
          </div>
          <!-- Email -->
          <div class="form-group">
            <label for="m-sap-email">Email</label>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon icon="envelope" />
                </div>
              </div>
              <input
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errorsData['email'] }"
                type="email"
                id="m-sap-email"
                name="email"
                v-model="activeSapeur.email"
              />
            </div>
          </div>
          <!-- DATE NAISSANCE + SUFFIXE -->
          <div class="row">
            <div class="col-6">
              <div class="form-group">
                <label for="m-sap-date-naissance">Date de naissance</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                  </div>
                  <input
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errorsData['date_naissance'] }"
                    type="date"
                    id="m-sap-date-naissance"
                    name="date_naissance"
                    v-model="activeSapeur.date_naissance"
                  />
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-group">
                <label for="m-sap-suffixe">Suffixe</label>
                <font-awesome-icon
                  class="ml-1"
                  v-tooltip.bottom="
                    'Permet de différencier deux personnes ayant le même nom et prénom.'
                  "
                  :icon="['far', 'question-circle']"
                />
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errorsData['suffixe'] }"
                  id="m-sap-suffixe"
                  name="suffixe"
                  v-model="activeSapeur.suffixe"
                />
              </div>
            </div>
          </div>
          <!-- REMARQUE -->
          <div class="form-group">
            <label for="m-sap-remarques">Remarques</label>
            <textarea
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['remarque'] }"
              rows="3"
              id="m-sap-remarques"
              name="remarques"
              v-model="activeSapeur.remarque"
            ></textarea>
          </div>
        </div>
      </div>

      <SapeurTelephones />
    </div>
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Références professionnelles</h3>
          <button @click.prevent="saveSapeurRefPro" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="form-group">
              <label for="m-sap-profession">Profession</label>
              <input
                type="text"
                class="form-control form-control-sm"
                id="m-sap-profession"
                name="profession"
                v-model="activeSapeur.profession"
              />
            </div>
            <div class="form-group">
              <label for="m-sap-employeur">Employeur</label>
              <input
                type="text"
                class="form-control form-control-sm"
                id="m-sap-employeur"
                name="employeur"
                v-model="activeSapeur.employeur"
              />
            </div>
            <div class="form-group">
              <label for="m-sap-lieu-travail">Lieu de travail</label>
              <input
                type="text"
                class="form-control form-control-sm"
                id="m-sap-lieu-travail"
                name="lieu_travail"
                v-model="activeSapeur.lieu_de_travail"
              />
            </div>
            <!-- TODO Add image -->
          </div>
        </form>
      </div>
      <!-- /.card -->

      <SapeurMutations></SapeurMutations>
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="form-group">
              <label for="mainFonction">Fonction principale</label>
              <select
                id="mainFonction"
                v-model="activeSapeur.fonction_id"
                class="custom-select"
                disabled
              >
                <option v-for="f in listeFonctions" :key="f.id" :value="f.id">
                  {{ f.nom }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="mainGrade">Grade actuel</label>
              <select
                id="mainGrade"
                v-model="activeSapeur.grade_id"
                class="custom-select"
                disabled
              >
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
import store from '@/store/index';

import SapeurMutations from '@/components/sapeur/SapeurMutations';
import SapeurTelephones from '@/components/sapeur/SapeurTelephones';

async function loadData(routeTo, next) {
  let loadTelephones = store.dispatch('fetchTelephones');
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadTelephonesType = store.dispatch('fetchSapeurTelephones');

  Promise.all([loadTelephones, loadLocalites, loadTelephonesType]).then(() => {
    next();
  });
}

export default {
  name: 'SapeurTabGeneral',
  components: {
    SapeurMutations,
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
    };
  },
  mounted() {
    if (this.listeCivilites.length === 0) {
      this.$store.dispatch('fetchCivilites');
    }
    if (this.listeLocalitesSis.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
    if (this.listeFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }

    this.$store.dispatch('fetchSapeurMutations');
  },
  computed: {
    ...mapState({
      listeCivilites: (state) => state.baseData.civilites,
      listeFonctions: (state) => state.fonction.liste,
      listGrades: (state) => state.grade.liste,
    }),
    ...mapGetters([
      'activeSapeur',
      'activeSapeurId',
      'listeLocalitesSis',
      'getLocalite',
    ]),
  },
  watch: {
    activeSapeurId(id) {
      this.errorsData = {};
      this.$store.dispatch('fetchSapeurMutations', id);
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
    saveSapeur() {
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
        .then(() => {
          this.errorsData = {};
        })
        .catch((err) => {
          this.errorsData = err;
        });
    },
    saveSapeurRefPro() {
      this.$store
        .dispatch('saveActiveSapeur', {
          profession: this.activeSapeur.profession,
          employeur: this.activeSapeur.employeur,
          lieu_de_travail: this.activeSapeur.lieu_de_travail,
        })
        .then(() => {
          // console.log('Save sapeur Success')
        })
        .catch(() => {
          // console.log('Save sapeur Error')
        });
    },
  },
};
</script>

<style scoped></style>
