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
            <label for="f-sap-civilite">Civilité</label>
            <select
              class="form-control"
              id="f-sap-civilite"
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
            <label for="f-sap-nom">Nom</label>
            <input
              type="text"
              class="form-control"
              id="f-sap-nom"
              name="nom"
              v-model="activeSapeur.nom"
            />
          </div>
          <!-- PRENOM -->
          <div class="form-group">
            <label for="f-sap-prenom">Prénom</label>
            <input
              type="text"
              class="form-control"
              id="f-sap-prenom"
              name="prenom"
              v-model="activeSapeur.prenom"
            />
          </div>
          <!-- RUE -->
          <div class="row">
            <div class="col-8">
              <div class="form-group">
                <label for="f-sap-rue">Rue</label>
                <input
                  type="text"
                  class="form-control"
                  id="f-sap-rue"
                  name="rue"
                  v-model="activeSapeur.rue"
                />
              </div>
            </div>
            <div class="col-4">
              <div class="form-group">
                <label for="f-sap-no-rue">N°</label>
                <input
                  type="text"
                  class="form-control"
                  id="f-sap-no-rue"
                  name="no_rue"
                  v-model="activeSapeur.no_rue"
                />
              </div>
            </div>
          </div>
          <!-- NPA + LOCALITE -->
          <div class="form-group">
            <label for="f-sap-localite">NPA Localité</label>
            <select
              class="form-control required"
              id="f-sap-localite"
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
            <label for="f-sap-avs">N° AVS</label>
            <input
              type="text"
              class="form-control"
              id="f-sap-avs"
              name="no_avs"
              v-model="activeSapeur.no_avs"
            />
          </div>
          <!-- Email -->
          <div class="form-group">
            <label for="f-sap-email">Email</label>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <div class="input-group-text">
                  <font-awesome-icon icon="envelope" />
                </div>
              </div>
              <input
                class="form-control"
                type="email"
                id="f-sap-email"
                name="email"
                v-model="activeSapeur.email"
              />
            </div>
          </div>
          <!-- DATE NAISSANCE + SUFFIXE -->
          <div class="row">
            <div class="col-6">
              <div class="form-group">
                <label for="f-sap-date-naissance">Date de naissance</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                  </div>
                  <input
                    class="form-control"
                    type="date"
                    id="f-sap-date-naissance"
                    name="date_naissance"
                    v-model="activeSapeur.date_naissance"
                  />
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-group">
                <label for="f-sap-suffixe">Suffixe</label>
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
                  id="f-sap-suffixe"
                  name="suffixe"
                  v-model="activeSapeur.suffixe"
                />
              </div>
            </div>
          </div>
          <p></p>
          <!-- REMARQUE -->
          <div class="form-group">
            <label for="f-sap-remarques">Remarques</label>
            <textarea
              class="form-control"
              rows="3"
              id="f-sap-remarques"
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
                <th>Priorité</th>
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
                <td class="text-center">{{ t.priorite }}</td>
                <td>
                  <input
                    class="form-control"
                    type="text"
                    v-model="t.numero"
                    placeholder="..."
                  />
                </td>
                <td>
                  <select class="form-control" v-model="t.telephone_type_id">
                    <option
                      v-for="t in listTelephoneTypes"
                      :value="t.id"
                      :key="t.id"
                      >{{ t.type }}</option
                    >
                  </select>
                </td>
                <td class="align-middle text-center">
                  <input type="checkbox" v-model="t.rta" />
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
        <div class="card-header">
          <h3 class="card-title">Références professionnelles</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="form-group">
              <label for="f-sap-profession">Profession</label>
              <input
                type="text"
                class="form-control"
                id="f-sap-profession"
                name="profession"
                v-model="activeSapeur.profession"
              />
            </div>
            <div class="form-group">
              <label for="f-sap-employeur">Employeur</label>
              <input
                type="text"
                class="form-control"
                id="f-sap-employeur"
                name="employeur"
                v-model="activeSapeur.employeur"
              />
            </div>
            <div class="form-group">
              <label for="f-sap-lieu-travail">Lieu de travail</label>
              <input
                type="text"
                class="form-control"
                id="f-sap-lieu-travail"
                name="lieu_travail"
                v-model="activeSapeur.lieu_de_travail"
              />
            </div>
            <!-- TODO Add image -->
          </div>
        </form>
      </div>
      <!-- /.card -->

      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Incorporation / Sortie</h3>
          <button class="btn btn-primary">Modifier</button>
        </div>
        <!-- /.card-header -->
        <!-- form start -->
        <form role="form">
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Incorporation</th>
                  <th>Sortie</th>
                  <th>Motif</th>
                  <th>Localité</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in activeSapeurMutations" :key="m.id">
                  <td>{{ m.incorporation }}</td>
                  <td>{{ m.sortie }}</td>
                  <td>{{ m.motif }}</td>
                  <td>{{ getLocalite(m.localite_id).designation }}</td>
                  <td>
                    <div class="d-flex justify-content-center">
                      <button
                        type="button"
                        class="btn btn-outline-primary border-0"
                      >
                        <font-awesome-icon :icon="['far', 'edit']" />
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger border-0"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>
      </div>
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="form-group">
              <label for="fonctionInput">Fonction principale</label>
              <input class="form-control" id="fonctionInput" type="text" />
            </div>
            <div class="form-group">
              <label for="gradeInput">Grade actuel</label>
              <input class="form-control" id="gradeInput" type="text" />
            </div>
            <!-- TODO Actif et Porteur checkbox -->
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'

export default {
  name: 'SapeurTabGeneral',
  components: {
    draggable
  },
  data() {
    return { telephonesData: [] }
  },
  mounted() {
    if (this.listCivilites.length === 0) {
      this.$store.dispatch('fetchCivilites')
    }
    if (this.listLocalitesSis.length === 0) {
      this.$store.dispatch('fetchLocalites')
    }
    if (this.listTelephoneTypes.length === 0) {
      this.$store.dispatch('fetchTelephones')
    }

    this.$store.dispatch('fetchSapeur', this.activeSapeurId)
    this.$store
      .dispatch('fetchSapeurTelephones', this.activeSapeurId)
      .then(() => {
        this.telephonesData = [
          ...this.activeSapeurTelephones.map(t => Object.assign({}, t))
        ]
      })
    this.$store.dispatch('fetchSapeurMutations', this.activeSapeurId)
  },
  computed: {
    ...mapGetters([
      'activeSapeur',
      'activeSapeurId',
      'activeSapeurMutations',
      'activeSapeurTelephones',
      'listCivilites',
      'listLocalitesSis',
      'listTelephoneTypes',
      'getLocalite',
      'getTelephone'
    ]),
    telephones: {
      get: function() {
        return this.telephonesData
      },
      set(telephones) {
        telephones.forEach((t, i) => (t.priorite = i + 1))

        this.telephonesData = telephones.sort(
          (t1, t2) => t1.priorite - t2.priorite
        )
      }
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeur', id)
      this.$store.dispatch('fetchSapeurTelephones', id).then(() => {
        this.telephonesData = [
          ...this.activeSapeurTelephones.map(t => Object.assign({}, t))
        ]
      })
      this.$store.dispatch('fetchSapeurMutations', id)
    }
  },
  methods: {
    saveSapeur() {
      this.$store
        .dispatch('saveActiveSapeur')
        .then(() => {
          console.log('Save sapeur Success')
        })
        .catch(err => {
          console.log('Save sapeur Error')
          console.log(err)
        })
    },
    saveTelephones() {
      //TODO Validation de toutes les données

      this.activeSapeurTelephones.forEach(t => {
        //Suppression des numéros supprimé
        if (this.telephones.filter(t2 => t2.id === t.id).length === 0) {
          this.$store.dispatch('removeTelephone', t.id)
        }
      })

      this.telephones.forEach(t => {
        //numéros modifiés
        if (t.id !== null) {
          this.$store.dispatch('editTelephone', t)
        }
        //Nouveaux numéros
        else {
          this.$store.dispatch('addTelephone', t)
        }
      })
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
        ]
      }
    },
    removeTelephone(priorite) {
      this.telephones = this.telephones.filter(t => t.priorite !== priorite)
    }
  }
}
</script>

<style scoped></style>
