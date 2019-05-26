<template>
  <!-- form start -->
  <form role="form">
    <div class="row">
      <div class="col-sm-12 col-lg-6">
        <!-- general form elements -->
        <div class="card card-primary card-outline mb-3">
          <div class="card-header">
            <h3 class="card-title">Données personnelles</h3>
          </div>
          <!-- /.card-header -->
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
          <div class="card-body">
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
            <div class="row">
              <div class="col-3">
                <div class="form-group">
                  <label for="f-sap-tel-prive">Tel priv</label>
                </div>
                <div class="form-group">
                  <label for="f-sap-tel-mobile">Smartphone</label>
                </div>
                <div class="form-group">
                  <label for="f-sap-tel-prof">Tel Prof</label>
                </div>
              </div>
              <div class="col-4">
                <div class="form-group">
                  <!--<input type="text" class="form-control" id="f-sap-tel-prive" name="tel_prive" value="{{ $sap_details['sapeur']['tel_prive'] }}">-->
                </div>
                <div class="form-group">
                  <!--<input type="text" class="form-control" id="f-sap-tel-mobile" name="tel_mobile" value="{{ $sap_details['sapeur']['tel_mobile'] }}">-->
                </div>
                <div class="form-group">
                  <!--<input type="text" class="form-control" id="f-sap-tel-prof" name="tel_prof" value="{{ $sap_details['sapeur']['tel_prof'] }}">-->
                </div>
              </div>
              <!-- TODO N° Transmis pour alarm au CET -->
            </div>
          </div>
          <!-- /.card-body -->
        </div>
        <!-- /.card -->
      </div>
      <!-- /.col -->

      <div class="col-sm-12 col-lg-6">
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
          <div class="card-header">
            <h3 class="card-title">Incorporation / Sortie</h3>
            <button class="btn btn-primary">Modifier</button>
            <!-- TODO  -->
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
        <!-- /.card -->

        <div class="card card-primary mb-3">
          <div class="card-footer text-right">
            <button @click.prevent="saveSapeur" class="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
      <!-- /.col -->
    </div>
  </form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabGeneral',
  mounted() {
    if (this.listCivilites.length <= 0) {
      this.$store.dispatch('fetchCivilites')
    }

    if (this.listLocalitesSis.length <= 0) {
      this.$store.dispatch('fetchLocalites')
    }

    this.$store.dispatch('fetchSapeur', this.activeSapeurId)
  },
  computed: {
    ...mapGetters(['activeSapeur', 'activeSapeurId', 'listCivilites', 'listLocalitesSis'])
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeur', id)
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
