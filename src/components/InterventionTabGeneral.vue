<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Informations</h3>
          <button @click.prevent="save" class="btn btn-primary">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-sm-12 col-xl-6">
              <div class="row">
                <div class="col-sm-6 col-xl-6">
                  <div class="form-group">
                    <label for="m-int-date-debut">Date de début</label>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <div class="input-group-text">
                          <font-awesome-icon :icon="['far', 'calendar-alt']" />
                        </div>
                      </div>
                      <input
                        class="form-control"
                        :class="{ 'is-invalid': errors['date_debut'] }"
                        type="date"
                        :min="dateDebutMin"
                        :max="dateDebutMax"
                        id="m-int-date-debut"
                        name="date_debut"
                        v-model="activeInterventionData.date_debut"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-xl-6">
                  <div class="form-group">
                    <label for="m-int-heure_debut">Heure</label>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <div class="input-group-text">
                          <font-awesome-icon :icon="['far', 'clock']" />
                        </div>
                      </div>
                      <input
                        type="time"
                        class="form-control"
                        :class="{ 'is-invalid': errors['heure_debut'] }"
                        id="m-int-heure_debut"
                        name="heure_debut"
                        v-model="activeInterventionData.heure_debut"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-6 col-xl-6">
                  <div class="form-group">
                    <label for="m-int-date-fin">Date de fin</label>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <div class="input-group-text">
                          <font-awesome-icon :icon="['far', 'calendar-alt']" />
                        </div>
                      </div>
                      <input
                        class="form-control"
                        :class="{ 'is-invalid': errors['date_fin'] }"
                        :min="dateFinMin"
                        :max="dateFinMax"
                        type="date"
                        id="m-int-date-fin"
                        name="date_fin"
                        v-model="activeInterventionData.date_fin"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 col-xl-6">
                  <div class="form-group">
                    <label for="m-int-heure_fin">Heure</label>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <div class="input-group-text">
                          <font-awesome-icon :icon="['far', 'clock']" />
                        </div>
                      </div>
                      <input
                        type="time"
                        class="form-control"
                        :class="{
                          'is-invalid': errors['heure_fin']
                        }"
                        id="m-int-heure_fin"
                        name="heure_fin"
                        v-model="activeInterventionData.heure_fin"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <!-- OBJET -->
              <div class="form-group">
                <label for="m-int-objet">Objet</label>
                <textarea
                  class="form-control"
                  :class="{ 'is-invalid': errors['objet'] }"
                  id="m-int-objet"
                  name="objet"
                  v-model="activeInterventionData.objet"
                ></textarea>
              </div>
              <!-- TYPE D'INTERVENTION -->
              <div class="form-group">
                <label for="m-int-type">Type d'intervention</label>
                <select
                  class="custom-select"
                  :class="{ 'is-invalid': errors['type_intervention_id'] }"
                  id="m-int-type"
                  name="type_intervention_id"
                  v-model="activeInterventionData.type_intervention_id"
                >
                  <option
                    v-for="type in listTypeIntervention"
                    :value="type.id"
                    :key="type.id"
                    >{{ type.designation }}</option
                  >
                </select>
              </div>
              <!-- STAT FEDERAL -->
              <div class="form-group">
                <label for="m-int-stat">Statistique fédérale</label>
                <select
                  class="custom-select required"
                  :class="{ 'is-invalid': errors['stat_federal_id'] }"
                  id="m-int-stat"
                  name="stat"
                  style="width: 100%"
                  v-model="activeInterventionData.stat_federal_id"
                >
                  <option
                    v-for="stat in listStatFederal"
                    :key="stat.id"
                    :value="stat.id"
                    >{{ stat.designation }}</option
                  >
                </select>
              </div>
            </div>
            <div class="col-sm-12 col-xl-6">
              <!-- LIEU -->
              <div class="form-group">
                <label for="m-int-lieu">Lieu (Rue, N°)</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors['lieu'] }"
                  id="m-int-lieu"
                  name="lieu"
                  v-model="activeInterventionData.lieu"
                />
              </div>
              <!-- NPA + LOCALITE -->
              <div class="form-group">
                <label for="m-int-localite">Localité</label>
                <select
                  class="custom-select required"
                  :class="{ 'is-invalid': errors['localite_id'] }"
                  id="m-int-localite"
                  name="localite_id"
                  style="width: 100%"
                  v-model="activeInterventionData.localite_id"
                >
                  <option
                    v-for="localite in listLocalitesSis"
                    :key="localite.id"
                    :value="localite.id"
                    >{{ localite.npa + ' ' + localite.designation }}</option
                  >
                </select>
              </div>
              <!-- Chef d'intervention -->
              <div class="form-group">
                <label for="m-int-sapeur">Chef d'intervention</label>
                <select
                  class="custom-select required"
                  :class="{ 'is-invalid': errors['sapeur_id'] }"
                  id="m-int-sapeur"
                  name="localite_id"
                  style="width: 100%"
                  v-model="activeInterventionData.sapeur_id"
                >
                  <option
                    v-for="sapeur in listSapeur"
                    :key="sapeur.id"
                    :value="sapeur.id"
                    >{{ sapeur.nom + ' ' + sapeur.prenom }}</option
                  >
                </select>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12 col-xl-12">
              <!-- Sauve personnes -->
              <div class="form-group">
                <label for="m-int-save-pers">Nb de personnes sauvées</label>
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors['sauve_personne'] }"
                  id="m-int-save-pers"
                  name="sauve_personne"
                  min="0"
                  v-model="activeInterventionData.sauve_personne"
                />
              </div>
              <!-- Sauve animaux -->
              <div class="form-group">
                <label for="m-int-save-ani">Nb d'animaux sauvés</label>
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors['sauve_animaux'] }"
                  id="m-int-save-ani"
                  name="sauve_animaux"
                  min="0"
                  v-model="activeInterventionData.sauve_animaux"
                />
              </div>
              <!-- Proprio -->
              <div class="form-group">
                <label for="m-int-save-ani">Propriétaire</label>
                <textarea
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors['proprietaire'] }"
                  id="m-int-proprietaire"
                  name="proprietaire"
                  v-model="activeInterventionData.proprietaire"
                ></textarea>
              </div>
              <!-- Responsable -->
              <div class="form-group">
                <label for="m-int-save-ani">Responsable</label>
                <textarea
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors['responsable'] }"
                  id="m-int-responsable"
                  name="responsable"
                  v-model="activeInterventionData.responsable"
                ></textarea>
              </div>
              <!-- INTERVENTION TRAITEMENT -->
              <div class="form-group">
                <label for="m-int-traitement">Traitement</label>
                <select
                  class="custom-select required"
                  :class="{
                    'is-invalid': errors['intervention_traitement_id']
                  }"
                  id="m-int-traitement"
                  name="localite_id"
                  style="width: 100%"
                  v-model="activeInterventionData.intervention_traitement_id"
                >
                  <option
                    v-for="traitement in listInterventionTraitement"
                    :key="traitement.id"
                    :value="traitement.id"
                    >{{ traitement.designation }}</option
                  >
                </select>
              </div>

              <!-- DEGRE -->
              <div class="form-group">
                <label for="m-int-degre">Degre</label>
                <select
                  class="custom-select required"
                  :class="{
                    'is-invalid': errors['degre']
                  }"
                  id="m-int-degre"
                  name="degre"
                  style="width: 100%"
                  v-model="activeInterventionData.degre"
                >
                  <option v-for="deg in degre" :key="deg.id" :value="deg.id">{{
                    deg.type
                  }}</option>
                </select>
              </div>
            </div>
            <div class="col-xs-12 col-xl-6">
              <label for="m-int-traitement">Description</label>
              <textarea
                class="form-control"
                v-model="activeInterventionData.description"
                rows="30"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <!--      &lt;!&ndash; Téléphones &ndash;&gt;-->
      <!--      <div class="card card-primary card-outline mb-3">-->
      <!--        <div class="card-header d-flex justify-content-between">-->
      <!--          <h3 class="card-title">Téléphones</h3>-->
      <!--          <button @click.prevent="saveTelephones" class="btn btn-primary">-->
      <!--            Enregistrer-->
      <!--          </button>-->
      <!--        </div>-->
      <!--        <div class="card-body table-responsive">-->
      <!--          <table class="table">-->
      <!--            <thead>-->
      <!--              <tr>-->
      <!--                <th>Priorité</th>-->
      <!--                <th>Numéro</th>-->
      <!--                <th>Type</th>-->
      <!--                <th>-->
      <!--                  RTA-->
      <!--                  <font-awesome-icon-->
      <!--                    class="ml-1"-->
      <!--                    v-tooltip.bottom="-->
      <!--                      'Cocher pour transmettre à la centrale d\'alarme RTA'-->
      <!--                    "-->
      <!--                    :icon="['far', 'question-circle']"-->
      <!--                  />-->
      <!--                </th>-->
      <!--                <th class="text-center">Actions</th>-->
      <!--              </tr>-->
      <!--            </thead>-->
      <!--            <draggable tag="tbody" v-model="telephones">-->
      <!--              <tr v-for="t in telephones" :key="t.id">-->
      <!--                <td class="text-center">{{ t.priorite }}</td>-->
      <!--                <td>-->
      <!--                  <input-->
      <!--                    class="form-control"-->
      <!--                    type="text"-->
      <!--                    v-model="t.numero"-->
      <!--                    placeholder="..."-->
      <!--                  />-->
      <!--                </td>-->
      <!--                <td>-->
      <!--                  <select class="custom-select" v-model="t.telephone_type_id">-->
      <!--                    <option-->
      <!--                      v-for="t in listTelephoneTypes"-->
      <!--                      :value="t.id"-->
      <!--                      :key="t.id"-->
      <!--                      >{{ t.type }}</option-->
      <!--                    >-->
      <!--                  </select>-->
      <!--                </td>-->
      <!--                <td class="align-middle text-center">-->
      <!--                  <div class="custom-control custom-checkbox text-center">-->
      <!--                    <input-->
      <!--                      type="checkbox"-->
      <!--                      class="custom-control-input"-->
      <!--                      :id="t.priorite"-->
      <!--                      v-model="t.rta"-->
      <!--                    />-->
      <!--                    <label-->
      <!--                      class="custom-control-label"-->
      <!--                      :for="t.priorite"-->
      <!--                    ></label>-->
      <!--                  </div>-->
      <!--                </td>-->
      <!--                <td>-->
      <!--                  <div class="d-flex justify-content-center">-->
      <!--                    <button-->
      <!--                      type="button"-->
      <!--                      class="btn btn-outline-danger border-0"-->
      <!--                      @click="removeTelephone(t.priorite)"-->
      <!--                      required-->
      <!--                    >-->
      <!--                      <font-awesome-icon :icon="['far', 'trash-alt']" />-->
      <!--                    </button>-->
      <!--                  </div>-->
      <!--                </td>-->
      <!--              </tr>-->
      <!--            </draggable>-->
      <!--          </table>-->
      <!--          <button-->
      <!--            type="button"-->
      <!--            class="btn btn-outline-primary"-->
      <!--            @click="addTelephone()"-->
      <!--            :disabled="this.telephonesData.length >= 3"-->
      <!--          >-->
      <!--            <font-awesome-icon class="mr-1" :icon="['fas', 'plus']" />-->
      <!--            Ajouter un numéro-->
      <!--          </button>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--    </div>-->
      <!--    <div class="col-sm-12 col-xl-6">-->
      <!--      <div class="card card-primary card-outline mb-3">-->
      <!--        <div class="card-header d-flex justify-content-between">-->
      <!--          <h3 class="card-title">Références professionnelles</h3>-->
      <!--          <button @click.prevent="saveSapeurRefPro" class="btn btn-primary">-->
      <!--            Enregistrer-->
      <!--          </button>-->
      <!--        </div>-->
      <!--        <form role="form">-->
      <!--          <div class="card-body">-->
      <!--            <div class="form-group">-->
      <!--              <label for="m-int-profession">Profession</label>-->
      <!--              <input-->
      <!--                type="text"-->
      <!--                class="form-control"-->
      <!--                id="m-int-profession"-->
      <!--                name="profession"-->
      <!--                v-model="activeInterventionData.profession"-->
      <!--              />-->
      <!--            </div>-->
      <!--            <div class="form-group">-->
      <!--              <label for="m-int-employeur">Employeur</label>-->
      <!--              <input-->
      <!--                type="text"-->
      <!--                class="form-control"-->
      <!--                id="m-int-employeur"-->
      <!--                name="employeur"-->
      <!--                v-model="activeInterventionData.employeur"-->
      <!--              />-->
      <!--            </div>-->
      <!--            <div class="form-group">-->
      <!--              <label for="m-int-lieu-travail">Lieu de travail</label>-->
      <!--              <input-->
      <!--                type="text"-->
      <!--                class="form-control"-->
      <!--                id="m-int-lieu-travail"-->
      <!--                name="lieu_travail"-->
      <!--                v-model="activeInterventionData.lieu_de_travail"-->
      <!--              />-->
      <!--            </div>-->
      <!--            &lt;!&ndash; TODO Add image &ndash;&gt;-->
      <!--          </div>-->
      <!--        </form>-->
      <!--      </div>-->
      <!--      &lt;!&ndash; /.card &ndash;&gt;-->

      <!--      <div class="card card-primary card-outline mb-3">-->
      <!--        <div class="card-header d-flex justify-content-between">-->
      <!--          <h3 class="card-title">Incorporation / Sortie</h3>-->
      <!--        </div>-->
      <!--        &lt;!&ndash; /.card-header &ndash;&gt;-->
      <!--        &lt;!&ndash; form start &ndash;&gt;-->
      <!--        <form role="form">-->
      <!--          <div class="card-body">-->
      <!--            <table class="table">-->
      <!--              <thead>-->
      <!--                <tr>-->
      <!--                  <th>Incorporation</th>-->
      <!--                  <th>Sortie</th>-->
      <!--                  <th>Motif</th>-->
      <!--                  <th>Localité</th>-->
      <!--                  <th class="text-center">Actions</th>-->
      <!--                </tr>-->
      <!--              </thead>-->
      <!--              <tbody>-->
      <!--                <tr v-for="m in activeSapeurMutations" :key="m.id">-->
      <!--                  <td>{{ m.incorporation }}</td>-->
      <!--                  <td>{{ m.sortie }}</td>-->
      <!--                  <td>{{ m.motif }}</td>-->
      <!--                  <td>{{ getLocalite(m.localite_id).designation }}</td>-->
      <!--                  <td>-->
      <!--                    <div class="d-flex justify-content-center">-->
      <!--                      <button-->
      <!--                        type="button"-->
      <!--                        class="btn btn-outline-primary border-0"-->
      <!--                        @click="editMutation(m.id)"-->
      <!--                      >-->
      <!--                        <font-awesome-icon :icon="['far', 'edit']" />-->
      <!--                      </button>-->
      <!--                      <button-->
      <!--                        type="button"-->
      <!--                        class="btn btn-outline-danger border-0"-->
      <!--                        @click="removeMutation(m.id)"-->
      <!--                        v-if="activeSapeurMutations.length > 1"-->
      <!--                      >-->
      <!--                        <font-awesome-icon :icon="['far', 'trash-alt']" />-->
      <!--                      </button>-->
      <!--                    </div>-->
      <!--                  </td>-->
      <!--                </tr>-->
      <!--              </tbody>-->
      <!--            </table>-->
      <!--            <button-->
      <!--              type="button"-->
      <!--              class="btn btn-outline-primary"-->
      <!--              @click="finService"-->
      <!--              v-if="finServiceBoutton"-->
      <!--            >-->
      <!--              <font-awesome-icon class="mr-1" :icon="['fas', 'door-closed']" />-->
      <!--              Fin de service-->
      <!--            </button>-->
      <!--          </div>-->
      <!--        </form>-->
      <!--      </div>-->
      <!--      <div class="card card-primary card-outline mb-3">-->
      <!--        <div class="card-header">-->
      <!--          <h3 class="card-title">Informations</h3>-->
      <!--        </div>-->
      <!--        <form role="form">-->
      <!--          <div class="card-body">-->
      <!--            <div class="form-group">-->
      <!--              <label for="mainFonction">Fonction principale</label>-->
      <!--              <select-->
      <!--                id="mainFonction"-->
      <!--                v-model="activeInterventionData.fonction_id"-->
      <!--                class="custom-select"-->
      <!--                disabled-->
      <!--              >-->
      <!--                <option v-for="f in listFonctions" :key="f.id" :value="f.id">-->
      <!--                  {{ f.nom }}-->
      <!--                </option>-->
      <!--              </select>-->
      <!--            </div>-->
      <!--            <div class="form-group">-->
      <!--              <label for="mainGrade">Grade actuel</label>-->
      <!--              <select-->
      <!--                id="mainGrade"-->
      <!--                v-model="activeInterventionData.grade_id"-->
      <!--                class="custom-select"-->
      <!--                disabled-->
      <!--              >-->
      <!--                <option v-for="g in listGrades" :key="g.id" :value="g.id">-->
      <!--                  {{ g.designation }}-->
      <!--                </option>-->
      <!--              </select>-->
      <!--            </div>-->
      <!--            &lt;!&ndash; TODO Actif et Porteur checkbox &ndash;&gt;-->
      <!--          </div>-->
      <!--        </form>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const degre = [
  { id: 1, type: 'Fausse-alarme' },
  { id: 3, type: 'Petite' },
  { id: 2, type: 'Moyenne' },
  { id: 0, type: 'Grande' }
]

export default {
  name: 'InterventionTabGeneral',
  props: {
    newMode: {
      type: Boolean
    }
  },
  data() {
    return {
      errors: {},
      degre
    }
  },
  computed: {
    ...mapGetters([
      'activeInterventionId',
      'activeInterventionData',
      'listLocalitesSis',
      'listTypeIntervention',
      'listInterventionTraitement',
      'listSapeur',
      'listStatFederal',
      'currentExerciceComptableId',
      'exerciceComptableDebut',
      'exerciceComptableFin'
    ]),
    description() {
      return this.activeInterventionData.description
    },
    proprietaire() {
      return this.activeInterventionData.proprietaire
    },
    responsable() {
      return this.activeInterventionData.responsable
    },
    heureDebut() {
      return this.activeInterventionData.heure_debut
    },
    heureFin() {
      return this.activeInterventionData.heure_fin
    },
    dateDebutMin() {
      console.log(this.currentExerciceComptableId)
      if (!this.currentExerciceComptableId) return
      return this.exerciceComptableDebut(
        this.activeInterventionData.exercice_comptable_id
      )
    },
    dateDebutMax() {
      if (!this.currentExerciceComptableId) return
      return this.exerciceComptableFin(
        this.activeInterventionData.exercice_comptable_id
      )
    },
    dateFinMin() {
      if (!this.currentExerciceComptableId) return
      return (
        this.activeInterventionData.date_debut ||
        this.exerciceComptableDebut(
          this.activeInterventionData.exercice_comptable_id
        )
      )
    },
    dateFinMax() {
      if (!this.currentExerciceComptableId) return
      return this.exerciceComptableFin(
        this.activeInterventionData.exercice_comptable_id
      )
    }
  },
  watch: {
    responsable(value) {
      if (value !== undefined) {
        this.activeInterventionData.responsable = value.replace('<br />', '\n')
      }
    },
    description(value) {
      if (value !== undefined) {
        this.activeInterventionData.description = value.replace('<br />', '\n')
      }
    },
    proprietaire(value) {
      if (value !== undefined) {
        this.activeInterventionData.proprietaire = value.replace('<br />', '\n')
      }
    },
    heureDebut(value) {
      if (value && value.length === 8) {
        this.activeInterventionData.heure_debut = value.slice(0, 5)
      }
    },
    heureFin(value) {
      if (value && value.length === 8) {
        this.activeInterventionData.heure_fin = value.slice(0, 5)
      }
    }
  },
  methods: {
    save() {
      if (this.newMode) {
        this.$store
          .dispatch('createIntervention', this.activeInterventionData)
          .then(data => {
            this.$router.push('/interventions/' + data.id)
            this.errors = {}
          })
          .catch(errors => (this.errors = errors))
      } else {
        this.$store
          .dispatch('saveActiveIntervention', this.activeInterventionData)
          .then(() => (this.errors = {}))
          .catch(errors => (this.errors = errors))
      }
    }
  }
}
</script>

<style scoped></style>
