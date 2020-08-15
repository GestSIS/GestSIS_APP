<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'exercices' }">
                Controles médicaux
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-lg-4 col-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h5>Infos</h5>
            <button class="btn btn-outline-primary" @click="save">
              Contrôle médical
            </button>
          </div>
          <div class="card-body">
            <!-- NOM -->
            <div class="form-group">
              <label for="m-exe-des">Sapeur</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors['designation'] }"
                id="m-exe-des"
                name="nom"
                v-model="activeControle.sapeur"
              />
            </div>
            <!-- MEDECIN -->
            <div class="form-group">
              <label for="m-sap-cat">Médecin</label>
              <select
                class="custom-select required"
                :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
                id="m-sap-cat"
                style="width: 100%"
                v-model="activeControle.medecin"
              >
                <option
                  v-for="medecin in medecins"
                  :key="medecin.id"
                  :value="medecin.id"
                  >{{ medecin.nom }}</option
                >
              </select>
            </div>
            <!-- TYPE -->
            <div class="form-group">
              <label for="m-sap-cat">Type</label>
              <select
                class="custom-select required"
                :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
                id="m-sap-cat"
                style="width: 100%"
                v-model="activeControle.type"
              >
                <option v-for="t in types" :key="t.id" :value="t.id">{{
                  t.designation
                }}</option>
              </select>
            </div>
            <div class="row">
              <div class="col-6">
                <!-- CONSULTATION -->
                <div class="form-group">
                  <label for="m-exe-date">Consultation</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <font-awesome-icon :icon="['far', 'calendar-alt']" />
                      </div>
                    </div>
                    <input
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': errors['date'] }"
                      id="m-exe-date"
                      name="consultation"
                      v-model="activeControle.consultation"
                    />
                  </div>
                </div>
              </div>
              <div class="col-6">
                <!-- Validité -->
                <div class="form-group">
                  <label for="m-exe-date">Validité</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <font-awesome-icon :icon="['far', 'calendar-alt']" />
                      </div>
                    </div>
                    <input
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': errors['date'] }"
                      id="m-exe-date"
                      name="validite"
                      v-model="activeControle.validite"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-6">
                <!-- DUREE -->
                <div class="form-group">
                  <label for="m-exe-duree">Durée</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">
                        <font-awesome-icon :icon="['fas', 'hourglass-end']" />
                      </div>
                    </div>
                    <input
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors['duree'] }"
                      min="1"
                      max="780"
                      id="m-exe-duree"
                      name="nom"
                    />
                    <div class="input-group-append">
                      <span class="input-group-text">min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-6">
                <!-- LOCALITE -->
                <div class="form-group">
                  <label for="m-sap-localite">Localité</label>
                  <select
                    class="custom-select required"
                    :class="{ 'is-invalid': errors['localite_id'] }"
                    id="m-sap-localite"
                    name="localite_id"
                    style="width: 100%"
                  >
                    <option>TODO</option>
                  </select>
                </div>
              </div>
              <div class="col-6">
                <!-- LIEU -->
                <div class="form-group">
                  <label for="m-exe-lieu">Lieu</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors['lieu'] }"
                    id="m-exe-lieu"
                    name="nom"
                  />
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="m-sap-communication">Communications</label>
              <textarea
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors['communications'] }"
                id="m-sap-communication"
                name="communications"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8 col-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h5>Documents</h5>
            <button class="btn btn-outline-primary">
              Ajouter
            </button>
          </div>
          <div class="card-body"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex';

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

export default {
  name: 'controleMedical',
  components: {
    ExerciceComptable
  },
  data() {
    return {
      errors: {},
      loading: true,
      activeControle: {
        sapeur: 'Jacques Robuchon',
        medecin: 1,
        type: 1,
        accepte: true,
        actif: true,
        consultation: '2000-12-12',
        validite: '2005-12-12',
        designation: 'Test'
      },
      medecins: [
        { id: 1, nom: 'Jackpot' },
        { id: 2, nom: 'Test' },
        { id: 3, nom: 'Petunia' }
      ],
      types: [
        { id: 1, designation: 'Jackpot' },
        { id: 2, designation: 'Test' },
        { id: 3, designation: 'Petunia' }
      ]
    };
  },
  props: {
    id: {
      type: String
    }
  },
  computed: {
    breadcrumbFinal() {
      return this.activeControle.designation;
    }
  },
  methods: {
    save() {}
  }
};
</script>

<style lang="scss" scoped></style>
