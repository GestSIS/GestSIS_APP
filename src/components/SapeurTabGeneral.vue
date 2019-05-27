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
          <!-- DATE NAISSANCE + SUFFIXE -->
          <div class="row">
            <div class="col-6">
              <div class="form-group">
                <label for="f-sap-date-naissance">Date de naissance</label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <font-awesome-icon icon="calendar" />
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
          <p>
            Permet de différencier deux personnes ayant le même nom et prénom.
          </p>
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
        <!-- /.card-body -->
      </div>
      <!-- /.card -->

      <!-- Form Element sizes -->
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Contact</h3>
        </div>
        <div class="card-body table-responsive">
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
          <label>Téléphones</label>
          <table class="table">
            <thead>
              <tr>
                <th>Priorité</th>
                <th>Numéro</th>
                <th>Type</th>
                <th>RTA</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <draggable
              tag="tbody"
              v-model="activeSapeurTelephones"
              group="people"
              @start="drag = true"
              @end="drag = false"
            >
              <tr v-for="t in activeSapeurTelephones" :key="t.id">
                <td scope="row">{{ t.priorite }}</td>
                <td>{{ t.numero }}</td>
                <td>{{ getTelephone(t.telephone_type_id).type }}</td>
                <td><input type="checkbox" v-model="t.rta" disabled></td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-outline-primary border-0">
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                    <button type="button" class="btn btn-outline-danger border-0">
                      <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                  </div>
                </td>
              </tr>
            </draggable>
          </table>
        </div>
      </div>

      <!-- /.card -->
    </div>
    <!-- /.col -->

    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Références professionnelles</h3>
        </div>
        <!-- /.card-header -->
        <!-- /.card-header -->
        <!-- form start -->
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
            <table
              data-toggle="table"
              data-url="http://bootstrap-table.wenzhixin.net.cn/examples/gh/get/response.json/wenzhixin/bootstrap-table/tree/master/docs/data/data1/"
              data-search="true"
              data-show-refresh="true"
              data-show-toggle="true"
              data-show-columns="true"
            >
              <thead>
                <tr>
                  <th data-field="date">Date</th>
                  <th data-field="Abr">Abr</th>
                  <th data-field="designation">Désignation</th>
                  <th data-field="remarques">Remarques</th>
                </tr>
              </thead>
            </table>
          </div>
        </form>
      </div>
      <!-- /.card -->

      <div class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <!-- /.card-header -->
        <!-- form start -->
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

    if (this.activeSapeurTelephones.length === 0) {
      this.$store.dispatch('fetchSapeurTelephones', this.activeSapeurId)
    }
    this.$store.dispatch('fetchSapeur', this.activeSapeurId)
  },
  computed: {
    ...mapGetters([
      'activeSapeur',
      'activeSapeurId',
      'listCivilites',
      'listLocalitesSis',
      'listTelephoneTypes',
      'getTelephone'
    ]),
    activeSapeurTelephones: {
      get() {
        return this.$store.state.sapeur.currentSapeur.telephones
          .slice(0)
          .sort((t1, t2) => t1.priorite - t2.priorite)
      },
      set(value) {
        value.forEach((g, i) => (g.priorite = i + 1))
        this.$store.commit('UPDATE_CURRENT_SAPEUR_TELEPHONES', value)
      }
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeur', id)
      this.$store.dispatch('fetchSapeurTelephones', id)
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
    }
  }
}
</script>

<style scoped></style>
