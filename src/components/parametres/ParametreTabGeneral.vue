<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">General</h3>
          <button type="button" class="btn btn-primary" @click="save()">
            Enregister
          </button>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="nom">Nom du SIS</label>
            <input
              type="text"
              v-model="sisParam.nom"
              class="form-control"
              :class="{ 'is-invalid': errors['nom'] }"
              id="nom"
            />
          </div>
          <div class="row">
            <div class="col-8 form-group">
              <label for="district">District</label>
              <input
                type="text"
                v-model="sisParam.district"
                class="form-control"
                :class="{ 'is-invalid': errors['district'] }"
                id="district"
              />
            </div>
            <div class="col-4 form-group">
              <label for="no_arrondissement">No arrondissement</label>
              <input
                type="text"
                v-model="sisParam.no_arrondissement"
                class="form-control"
                :class="{ 'is-invalid': errors['no_arrondissement'] }"
                id="no_arrondissement"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-8 form-group">
              <label for="rue">Rue</label>
              <input
                type="text"
                v-model="sisParam.rue"
                class="form-control"
                :class="{ 'is-invalid': errors['rue'] }"
                id="rue"
              />
            </div>
            <div class="col-4 form-group">
              <label for="numero">Numéro</label>
              <input
                type="text"
                v-model="sisParam.numero"
                class="form-control"
                :class="{ 'is-invalid': errors['numero'] }"
                id="numero"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="localite">Localité</label>
            <select
              id="localite"
              v-model="sisParam.localite_id"
              class="custom-select"
              :class="{ 'is-invalid': errors['localite_id'] }"
            >
              <option v-for="l in listeLocalite" :key="l.id" :value="l.id">
                {{ localite(l) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="localite">Commandant</label>
            <select
              id="sapeur_id"
              v-model="sisParam.sapeur_id"
              class="custom-select"
              :class="{ 'is-invalid': errors['sapeur_id'] }"
            >
              <option v-for="s in listeSapeur" :key="s.id" :value="s.id">
                {{ sapeur(s) }}
              </option>
            </select>
          </div>
          <div class="row">
            <div class="col-6 form-group">
              <label for="telephone">Téléphone</label>
              <input
                type="text"
                v-model="sisParam.telephone"
                class="form-control"
                :class="{ 'is-invalid': errors['telephone'] }"
                id="telephone"
              />
            </div>
            <div class="col-6 form-group">
              <label for="email">Email</label>
              <input
                type="text"
                v-model="sisParam.email"
                class="form-control"
                :class="{ 'is-invalid': errors['email'] }"
                id="email"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-6 form-group">
              <label for="iban">Iban</label>
              <input
                type="text"
                v-model="sisParam.iban"
                class="form-control"
                :class="{ 'is-invalid': errors['iban'] }"
                id="iban"
              />
            </div>
            <div class="col-6 form-group">
              <label for="bic">BIC</label>
              <input
                type="text"
                v-model="sisParam.bic"
                class="form-control"
                :class="{ 'is-invalid': errors['bic'] }"
                id="bic"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">TODO:</h3>
        </div>
        <div class="card-body">
          <div>
            <h5>Paramètres Statique pour admin du système</h5>
            <ul>
              <li>Type de téléphone</li>
              <li>Civilites</li>
              <li>Localites et communes</li>
              <li>Stat fédéral</li>
              <li>Permis</li>
              <li>Unites</li>
            </ul>
          </div>
          <div>
            <h5>Sapeur</h5>
            <ul>
              <li>Nombre de numéro max par sapeur</li>
            </ul>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadParams = store.dispatch('fetchSisParams');

  Promise.all([loadLocalites, loadSapeurs, loadParams]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabGeneral',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      errors: {},
      sisParam: {},
    };
  },
  mounted() {
    this.sisParam = { ...this.params };
  },
  computed: {
    ...mapState({
      params: (state) => state.sisParam.params,
      listeLocalite: (state) => state.localite.liste,
      listeSapeur: (state) => state.sapeur.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    localite(localite) {
      return localite?.designation;
    },
    sapeur(sapeur) {
      return `${sapeur?.nom} ${sapeur?.prenom}`;
    },
    save() {
      this.$store
        .dispatch('updateSisParams', this.sisParam)
        .then(() => {
          this.errors = {};
        })
        .catch((errors) => {
          this.errors = {
            ...errors,
          };
        });
    },
  },
};
</script>

<style scoped></style>
