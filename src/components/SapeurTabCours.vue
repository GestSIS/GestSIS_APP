<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header">
          <button
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#modal-cours"
          >
            Ajouter un cours
          </button>
        </div>
        <div class="card-body">
          <table id="sap-cours" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th data-field="date">Date</th>
                <th data-field="Abr">Abr</th>
                <th data-field="designation">Désignation</th>
                <th data-field="lieu">Lieu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in activeSapeurCours" :key="c.id">
                <td>{{ c.date }}</td>
                <td>{{ getCours(c.cours_id).abreviation }}</td>
                <td>{{ getCours(c.cours_id).designation }}</td>
                <td>{{ getLocalite(c.localite_id).designation }}</td>
              </tr>
            </tbody>
          </table>
          <!-- TODO Fetch data -->
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Paramètres pour la saisie d'un cours</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="cours-name">Cours</label>
            <select
              id="cours-name"
              v-model="selectedCours"
              class="form-control"
            >
              <option
                v-for="_cours in coursData"
                :key="_cours.id"
                :value="_cours.id"
                >{{ _cours.nom }}</option
              >
              <!-- TODO limiter le nombre de cours -->
            </select>
          </div>
          <div class="form-group">
            <label for="cours-date">Date du cours</label>
            <input type="date" class="form-control" id="cours-date" />
          </div>
          <div class="form-group">
            <label for="cours-localite">Cours</label>
            <select id="cours-localite" class="form-control">
              <option>Saulcy</option>
              <option>Glovelier</option>
              <option>Bassecourt</option>
              <option>Courfaivre</option>
              <option>Boécourt</option>
              <!-- TODO Lister les localités -->
            </select>
          </div>
          <div class="form-group">
            <label for="cours-precedent">Cours précédent</label>
            <select
              id="cours-precedent"
              v-model="cou_pre_id"
              class="form-control"
            >
              <option
                v-for="_cours in coursData"
                :key="_cours.id"
                :value="_cours.id"
                >{{ _cours.nom }}</option
              >
              <!-- Limiter le nombre de cours -->
            </select>
          </div>
          <div class="form-group">
            <label>Grade</label>
          </div>
          <div class="row">
            <div class="col-md-8">
              <div class="form-group">
                <select
                  v-model="gra_id"
                  class="form-control select"
                  data-placeholder="Select a State"
                  tabindex="-1"
                >
                  <option
                    v-for="_cours in coursData"
                    :key="_cours.id"
                    :value="_cours.id"
                    >{{ _cours.nom }}</option
                  >
                </select>
              </div>
              <!-- /.form-group -->
            </div>
            <!-- /.col -->
            <div class="col-md-4">
              <div class="form-group">
                <input type="date" class="form-control" />
              </div>
              <!-- /.form-group -->
            </div>
            <!-- /.col -->
          </div>
          <!-- /.row -->

          <div class="form-group">
            <label>Fonction</label>
          </div>
          <div class="row">
            <div class="col-md-8">
              <div class="form-group">
                <select v-model="fon_id" class="form-control select" disabled>
                  <option
                    v-for="_fonction in fonctionData"
                    :key="_fonction.id"
                    :value="_fonction.id"
                    >{{ _fonction.nom }}</option
                  >
                </select>
              </div>
              <!-- /.form-group -->
            </div>
            <!-- /.col -->
            <div class="col-md-4">
              <div class="form-group">
                <input type="date" class="form-control" />
              </div>
              <!-- /.form-group -->
            </div>
            <!-- /.col -->
          </div>
          <!-- /.row -->
          <div class="form-group">
            <label>Fonction remplacé</label>
          </div>
          <div class="row">
            <div class="col-md-8">
              <div class="form-group">
                <!-- TODO Add v-model with the current cours of the sapeur -->
                <select class="form-control" disabled>
                  <option
                    v-for="_fonction in fonctionData"
                    :key="_fonction.id"
                    :value="_fonction.id"
                    >{{ _fonction.nom }}</option
                  >
                </select>
              </div>
              <!-- /.form-group -->
            </div>
            <!-- /.col -->
          </div>
          <!-- /.row -->
        </div>
        <!-- /.card-body -->

        <div class="card-footer">
          <button type="submit" class="btn btn-primary">Sauvegarder</button>
          <button type="submit" class="btn btn-secondary">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabCours',
  computed: {
    ...mapGetters([
      'activeSapeurCours',
      'activeSapeurId',
      'listCours',
      'getCours',
      'getLocalite'
    ])
  },
  mounted() {
    if (this.listCours.length === 0) {
      this.$store.dispatch('fetchCours')
    }
    if (this.activeSapeurCours.length === 0) {
      this.$store.dispatch('fetchSapeurCours', this.activeSapeurId)
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id)
    }
  }
}
</script>

<style scoped></style>
