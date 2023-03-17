<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">General</h3>
          <button
            v-if="hasConfigGeneralPermission"
            type="button"
            class="btn btn-primary"
            @click="save()"
          >
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
              :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
              />
            </div>
          </div>
          <base-select
            v-model="sisParam.localite_id"
            class="mb-3"
            label="Localité"
            :formatter="formatLocalite"
            :options="localites"
            :select-class="{ 'is-invalid': errors['localite_id'] }"
            :disabled="!hasConfigGeneralPermission"
          />
          <base-select
            v-model="sisParam.sapeur_id"
            class="mb-3"
            label="Commandant"
            display-key="nom_prenom"
            :options="sapeurs"
            :select-class="{ 'is-invalid': errors['sapeur_id'] }"
            :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
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
                :disabled="!hasConfigGeneralPermission"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Logo</h3>
          <button
            v-if="hasConfigGeneralPermission"
            type="button"
            class="btn btn-primary"
            @click="updateLocalitesSis()"
          >
            Modifier
          </button>
        </div>
        <div class="card-body">
          <div class="input-group">
            <input type="file" class="form-control" @change="onFileChange" />
            <button class="btn btn-primary" @click="saveLogo">save</button>
          </div>
        </div>
        <div class="card-body d-flex justify-content-center">
          <div v-if="loadingLogo" class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <img
            v-else
            class="img-thumbnail img-responsive"
            :src="loadingLogo ? '' : logoUrl"
            alt="Logo"
          />
        </div>
      </div>
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Localités du sis</h3>
          <button
            v-if="hasConfigGeneralPermission"
            type="button"
            class="btn btn-primary"
            @click="updateLocalitesSis()"
          >
            Modifier
          </button>
        </div>
        <div class="card-body">
          <base-table
            :data="localitesSis"
            :fields="fields"
            no-data="Aucune localité de configuré pour le SIS"
          />
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
import SisParamService from '../../services/SisParamService';
import permissions from '../../store/permissions';
import store from '/src/store/index';
import Api from '/src/http/Request';

async function loadData(_, next) {
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadParams = store.dispatch('fetchSisParams');

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
      logo: null,
      logoUrl: '',
      loadingLogo: true,
      errors: {},
      sisParam: {},
      fields: [
        { title: 'Npa', key: 'npa' },
        { title: 'Localité', key: 'localite' },
      ],
    };
  },
  computed: {
    ...mapState({
      hasConfigGeneralPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SIS.CONFIG),
      activeSisKey: (state) => state.auth.sis.activeKey,
      params: (state) => state.sisParam.params,
      localites: (state) => state.localite.liste,
      localitesSis: (state) =>
        state.localite.listeSis.map((l) => ({
          id: l,
          npa: state.localite.liste.find((e) => e.id == l)?.npa,
          localite: state.localite.liste.find((e) => e.id == l)?.designation,
        })),
      sapeurs: (state) =>
        state.sapeur.liste.filter((s) => s.actif).sort((a, b) => a.tri - b.tri),
    }),
  },
  mounted() {
    this.sisParam = { ...this.params };
    this.$store.dispatch('fetchLocalitesSis');
    this.loadSisLogo();
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
    loadSisLogo() {
      const timestamp = new Date().getTime();
      this.logoUrl =
        Api.API_URL + '/sis-logo/' + this.activeSisKey + '?t=' + timestamp;
      this.loadingLogo = false;
    },
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      this.logo = files[0];
    },
    async saveLogo() {
      // TODO: Save logo
      SisParamService.updateLogo(this.logo)
        .then((res) => {
          this.errors = {};
          this.$awn.success(res?.message || 'Modifications enregistrées');
          this.loadSisLogo();
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
