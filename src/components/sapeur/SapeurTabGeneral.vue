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
          <div class="form-group">
            <label for="m-sap-civilite">Civilité</label>
            <select
              class="custom-select"
              id="m-sap-civilite"
              name="civilite_id"
              v-model="activeSapeur.civilite_id"
            >
              <option
                v-for="civilite in listCivilites"
                :value="civilite.id"
                :key="civilite.id"
                >{{ civilite.designation }}</option
              >
            </select>
          </div>
          <!-- NOM -->
          <div class="form-group">
            <label for="m-sap-nom">Nom</label>
            <input
              type="text"
              class="form-control"
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
              class="form-control"
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
                  class="form-control"
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
                  class="form-control"
                  :class="{ 'is-invalid': errorsData['no_rue'] }"
                  id="m-sap-no-rue"
                  name="no_rue"
                  v-model="activeSapeur.no_rue"
                />
              </div>
            </div>
          </div>
          <!-- NPA + LOCALITE -->
          <div class="form-group">
            <label for="m-sap-localite">NPA Localité</label>
            <select
              class="custom-select required"
              id="m-sap-localite"
              name="localite_id"
              style="width: 100%"
              v-model="activeSapeur.localite_id"
            >
              <option
                v-for="localite in listLocalitesSis"
                :key="localite.id"
                :value="localite.id"
                >{{ localite.npa + ' ' + localite.designation }}</option
              >
            </select>
          </div>
          <!-- N° AVS -->
          <div class="form-group">
            <label for="m-sap-avs">N° AVS</label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errorsData['no_avs'] }"
              id="m-sap-avs"
              name="no_avs"
              v-model="activeSapeur.no_avs"
            />
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
                class="form-control"
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
                    class="form-control"
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
                  class="form-control"
                  :class="{ 'is-invalid': errorsData['suffixe'] }"
                  id="m-sap-suffixe"
                  name="suffixe"
                  v-model="activeSapeur.suffixe"
                />
              </div>
            </div>
          </div>
          <p></p>
          <!-- REMARQUE -->
          <div class="form-group">
            <label for="m-sap-remarques">Remarques</label>
            <textarea
              class="form-control"
              :class="{ 'is-invalid': errorsData['remarque'] }"
              rows="3"
              id="m-sap-remarques"
              name="remarques"
              v-model="activeSapeur.remarque"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Téléphones -->
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Téléphones</h3>
          <button @click.prevent="saveTelephones" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <div class="card-body table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th :class="{ 'd-none': telephones.length <= 1 }">Priorité</th>
                <th>Numéro</th>
                <th>Type</th>
                <th>
                  RTA
                  <font-awesome-icon
                    class="ml-1"
                    v-tooltip.bottom="
                      'Cocher pour transmettre à la centrale d\'alarme RTA'
                    "
                    :icon="['far', 'question-circle']"
                  />
                </th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <draggable tag="tbody" v-model="telephones">
              <tr v-for="t in telephones" :key="t.id">
                <td
                  class="text-center"
                  :class="{ 'd-none': telephones.length <= 1 }"
                >
                  {{ t.priorite }}
                </td>
                <td>
                  <input
                    class="form-control"
                    type="text"
                    v-model="t.numero"
                    placeholder="..."
                  />
                </td>
                <td>
                  <select class="custom-select" v-model="t.telephone_type_id">
                    <option
                      v-for="t in listTelephoneTypes"
                      :value="t.id"
                      :key="t.id"
                      >{{ t.type }}</option
                    >
                  </select>
                </td>
                <td class="align-middle text-center">
                  <div class="custom-control custom-checkbox text-center">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="t.priorite"
                      v-model="t.rta"
                    />
                    <label
                      class="custom-control-label"
                      :for="t.priorite"
                    ></label>
                  </div>
                </td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button
                      type="button"
                      class="btn btn-outline-danger border-0"
                      @click="removeTelephone(t.priorite)"
                      required
                    >
                      <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                  </div>
                </td>
              </tr>
            </draggable>
          </table>
          <button
            type="button"
            class="btn btn-outline-primary"
            @click="addTelephone()"
            :disabled="this.telephonesData.length >= 3"
          >
            <font-awesome-icon class="mr-1" :icon="['fas', 'plus']" />
            Ajouter un numéro
          </button>
        </div>
      </div>
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
                class="form-control"
                id="m-sap-profession"
                name="profession"
                v-model="activeSapeur.profession"
              />
            </div>
            <div class="form-group">
              <label for="m-sap-employeur">Employeur</label>
              <input
                type="text"
                class="form-control"
                id="m-sap-employeur"
                name="employeur"
                v-model="activeSapeur.employeur"
              />
            </div>
            <div class="form-group">
              <label for="m-sap-lieu-travail">Lieu de travail</label>
              <input
                type="text"
                class="form-control"
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

      <SapeurMutations> </SapeurMutations>
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
                <option v-for="f in listFonctions" :key="f.id" :value="f.id">
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
import draggable from 'vuedraggable';

import SapeurMutations from '@/components/sapeur/SapeurMutations';

export default {
  name: 'SapeurTabGeneral',
  components: {
    draggable,
    SapeurMutations
  },
  data() {
    return { telephonesData: [], errorsData: {}, errorsTel: {} };
  },
  mounted() {
    if (this.listCivilites.length === 0) {
      this.$store.dispatch('fetchCivilites');
    }
    if (this.listLocalitesSis.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }
    if (this.listTelephoneTypes.length === 0) {
      this.$store.dispatch('fetchTelephoneTypes');
    }
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
    if (this.listFonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }

    this.$store.dispatch('fetchSapeur', this.activeSapeurId);
    this.$store
      .dispatch('fetchSapeurTelephones', this.activeSapeurId)
      .then(() => {
        this.telephonesData = [
          ...this.activeSapeurTelephones.map(t => Object.assign({}, t))
        ];
      });
    this.$store.dispatch('fetchSapeurMutations', this.activeSapeurId);
  },
  computed: {
    ...mapState({
      listCivilites: state => state.baseData.civilites,
      listFonctions: state => state.fonction.liste,
      listGrades: state => state.grade.liste
    }),
    ...mapGetters([
      'activeSapeur',
      'activeSapeurId',
      'activeSapeurMutations',
      'activeSapeurTelephones',
      'listLocalitesSis',
      'listTelephoneTypes',
      'getLocalite',
      'getTelephone'
    ]),
    telephones: {
      get: function() {
        return this.telephonesData;
      },
      set(telephones) {
        telephones.forEach((t, i) => (t.priorite = i + 1));

        this.telephonesData = telephones.sort(
          (t1, t2) => t1.priorite - t2.priorite
        );
      }
    }
  },
  watch: {
    activeSapeurId(id) {
      this.errorsData = {};

      this.$store.dispatch('fetchSapeur', id);
      this.$store.dispatch('fetchSapeurTelephones', id).then(() => {
        this.telephonesData = [
          ...this.activeSapeurTelephones.map(t => Object.assign({}, t))
        ];
      });
      this.$store.dispatch('fetchSapeurMutations', id);
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
    saveTelephones() {
      //TODO Validation de toutes les données

      this.activeSapeurTelephones.forEach(t => {
        //Suppression des numéros supprimé
        if (this.telephones.filter(t2 => t2.id === t.id).length === 0) {
          this.$store.dispatch('removeTelephone', t.id);
        }
      });

      this.telephones.forEach(t => {
        //Numéros modifiés
        if (t.id !== null) {
          this.$store.dispatch('editTelephone', t);
        }
        //Nouveaux numéros
        else {
          this.$store.dispatch('addTelephone', t);
        }
      });
    },
    addTelephone() {
      if (this.telephonesData.length < 3) {
        this.telephones = [
          ...this.telephones,
          {
            id: null,
            telephone_type_id: 0, //this.listTelephoneTypes[0].id, //TODO Choisir si select de base
            rta: 0,
            priorite: this.telephones.length + 1
          }
        ];
      }
    },
    removeTelephone(priorite) {
      this.telephones = this.telephones.filter(t => t.priorite !== priorite);
    },
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
        'remarque'
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
        .catch(err => {
          this.errorsData = err;
        });
    },
    saveSapeurRefPro() {
      this.$store
        .dispatch('saveActiveSapeur', {
          profession: this.activeSapeur.profession,
          employeur: this.activeSapeur.employeur,
          lieu_de_travail: this.activeSapeur.lieu_de_travail
        })
        .then(() => {
          // console.log('Save sapeur Success')
        })
        .catch(() => {
          // console.log('Save sapeur Error')
        });
    }
  }
};
</script>

<style scoped></style>
