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
          <div class="mb-3">
            <label for="nom">Nom du SIS</label>
            <input
              id="nom"
              v-model="sisParam.nom"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['nom'] }"
            />
          </div>
          <div class="row mb-3">
            <div class="col-8">
              <label for="district">District</label>
              <input
                id="district"
                v-model="sisParam.district"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['district'] }"
              />
            </div>
            <div class="col-4">
              <label for="no_arrondissement">No arrondissement</label>
              <input
                id="no_arrondissement"
                v-model="sisParam.no_arrondissement"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['no_arrondissement'] }"
              />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-8">
              <label for="rue">Rue</label>
              <input
                id="rue"
                v-model="sisParam.rue"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['rue'] }"
              />
            </div>
            <div class="col-4">
              <label for="numero">Numéro</label>
              <input
                id="numero"
                v-model="sisParam.numero"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['numero'] }"
              />
            </div>
          </div>
          <base-select
            v-model="sisParam.localite_id"
            class="mb-3"
            value-key="id"
            label="Localité"
            :formatter="formatLocalite"
            :options="localites"
            :select-class="{ 'is-invalid': errors['localite_id'] }"
          />
          <base-select
            v-model="sisParam.sapeur_id"
            class="mb-3"
            value-key="id"
            label="Commandant"
            display-key="nom_prenom"
            :options="sapeurs"
            :select-class="{ 'is-invalid': errors['sapeur_id'] }"
          />
          <div class="row mb-3">
            <div class="col-6">
              <label for="telephone">Téléphone</label>
              <input
                id="telephone"
                v-model="sisParam.telephone"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['telephone'] }"
              />
            </div>
            <div class="col-6">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="sisParam.email"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['email'] }"
              />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="iban">Iban</label>
              <input
                id="iban"
                v-model="sisParam.iban"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['iban'] }"
              />
            </div>
            <div class="col-6">
              <label for="bic">BIC</label>
              <input
                id="bic"
                v-model="sisParam.bic"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['bic'] }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline mb-3">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Localités du sis</h3>
          <button
            type="button"
            class="btn btn-primary"
            @click="updateLocalitesSis()"
          >
            Modifier
          </button>
        </div>
        <div class="card-body">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Npa</th>
                <th>Localité</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="id in localitesSis" :key="id">
                <td>{{ indexedLocalites[id].npa }}</td>
                <td>{{ indexedLocalites[id].designation }}</td>
              </tr>
              <tr v-if="!localitesSis.length">
                <td colspan="2">Aucune localité</td>
              </tr>
            </tbody>
          </table>
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
import { mapMutations, mapState } from 'vuex';
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
  computed: {
    ...mapState({
      params: (state) => state.sisParam.params,
      localites: (state) => state.localite.liste,
      localitesSis: (state) => state.localite.listeSis,
      sapeurs: (state) =>
        state.sapeur.liste.filter((s) => s.actif).sort((a, b) => a.tri - b.tri),
    }),
    indexedLocalites() {
      return this.localites.reduce((acc, l) => {
        acc[l.id] = l;
        return acc;
      }, {});
    },
  },
  mounted() {
    this.sisParam = { ...this.params };
    this.$store.dispatch('fetchLocalitesSis');
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatLocalite(localite) {
      return localite?.designation;
    },
    updateLocalitesSis() {
      const callback = (res) => {
        if (!res) {
          return;
        }
        const { ajoute, supprime } = res;
        if (ajoute.length) {
          this.$store.dispatch('addLocalitesSis', ajoute);
        }
        if (supprime.length) {
          this.$store.dispatch('removeLocalitesSis', supprime);
        }

        return Promise.resolve();
      };

      this.SHOW_MODAL({
        component: 'ModalLocaliteSelect',
        callback,
        size: 1,
        data: { ids: this.localitesSis },
      });
    },
    async save() {
      this.$store
        .dispatch('updateSisParams', this.sisParam)
        .then((res) => {
          this.errors = {};
          this.$awn.success(res?.message || 'Modifications enregistrées');
        })
        .catch((errors) => {
          this.errors = {
            ...errors,
          };
          this.$awn.alert(errors?.message || "Erreur lors de l'enregistrement");
        });
    },
  },
};
</script>

<style scoped></style>
