<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSisParamStore } from "../../stores/params/SisParam.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import SisParamService from "../../services/SisParamService";
import permissions from "../../composables/permissions.js";

import Api from "/src/http/Request";
import useHasPermission from "../../composables/usePermission.js";

const localiteStore = useLocaliteStore();
const sisParamStore = useSisParamStore();
const sapeurStore = useSapeurStore();
const loadLocalites = localiteStore.fetchLocalites();
const loadSapeurs = sapeurStore.fetchListeSapeur();
const loadParams = sisParamStore.fetchParams();
const loadContacts = sisParamStore.fetchContacts();

await Promise.all([loadLocalites, loadSapeurs, loadParams, loadContacts]);
await localiteStore.fetchLocalitesSis();

const logo = ref(null);
const logoUrl = ref("");
const loadingLogo = ref(true);
const errors = ref({});
const fields = [
  { title: "Npa", key: "npa" },
  { title: "Localité", key: "localite" },
];
const listes = [
  { id: "news", designation: "Newsletter" },
  { id: "facturation", designation: "Facturation" },
];

const hasConfigGeneralPermission = useHasPermission(permissions.SIS.CONFIG);
const authStore = useAuthStore();
const activeSisKey = computed(() => authStore.sis.activeKey);
const params = computed(() => sisParamStore.params);
const contacts = computed(() => sisParamStore.contacts);
const localites = computed(() => localiteStore.liste);
const localitesSis = computed(() =>
  localiteStore.listeSis.map((l) => ({
    id: l,
    npa: localiteStore.liste.find((e) => e.id == l)?.npa,
    localite: localiteStore.liste.find((e) => e.id == l)?.designation,
  })),
);
const sapeurs = computed(() =>
  sapeurStore.liste.filter((s) => s.actif).sort((a, b) => a.tri - b.tri),
);

const sisParam = ref({});
sisParam.value = { ...params.value };

const { confirm, showModal } = useModalStore();
const formatLocalite = (localite) => localite?.designation;
const addContact = (liste) =>
  showModal({
    component: "ModalSisContact",
    data: liste,
  });
const removeContact = (contact) =>
  confirm(
    "Voulez-vous vraiment supprimer cet email ?",
    "Attention, cet email ne recevra plus les emails de cette liste de diffusion !",
  ).then(() => sisParamStore.removeSisContact(contact.id));

const updateLocalitesSis = () => {
  const callback = (res) => {
    if (!res) {
      return;
    }
    const { ajoute, supprime } = res;
    if (ajoute.length) {
      localiteStore.addLocalitesSis(ajoute);
    }
    if (supprime.length) {
      localiteStore.removeLocalitesSis(supprime);
    }

    return Promise.resolve();
  };

  showModal({
    component: "ModalLocaliteSelect",
    callback,
    size: 1,
    data: { ids: localitesSis.value.map((l) => l?.id ?? l) },
  });
};
const save = async () => {
  try {
    const res = await sisParamStore.updateSisParams(sisParam.value);
    errors.value = {};
    awn.success(res?.message || "Modifications enregistrées");
  } catch (err) {
    errors.value = {
      ...err,
    };
    awn.alert(err?.message || "Erreur lors de l'enregistrement");
  }
};
const loadSisLogo = () => {
  const timestamp = new Date().getTime();
  logoUrl.value = Api.API_URL + "/sis-logo/" + activeSisKey.value + "?t=" + timestamp;
  loadingLogo.value = false;
};
loadSisLogo();

const onFileChange = (event) => {
  const files = event.target.files || event.dataTransfer.files;
  if (!files.length) return;
  logo.value = files[0];
};
const awn = useNotification();
const saveLogo = async () => {
  if (!logo.value) {
    awn.warning("Veuillez sélectionner un logo");
    return;
  }
  SisParamService.updateLogo(logo.value)
    .then((res) => {
      errors.value = {};
      awn.success(res?.message || "Modifications enregistrées");
      loadSisLogo();
    })
    .catch((e) => {
      errors.value = {
        ...e,
      };
      awn.alert(e?.message || "Erreur lors de l'enregistrement");
    });
};
</script>

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
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Listes de diffusion</h3>
        </div>
        <div class="card-body">
          <div v-for="liste in listes" :key="liste.id" class="mb-2">
            <h5>{{ liste.designation }}</h5>
            <div class="input-group">
              <div
                class="form-control"
                :class="{
                  'is-invalid': contacts.filter((c) => c.liste == liste.id).length === 0,
                }"
              >
                <template v-if="contacts.filter((c) => c.liste == liste.id).length === 0"
                  >1 email minimum requis</template
                >
                <span
                  v-for="c in contacts.filter((c) => c.liste == liste.id)"
                  :key="c.id"
                  class="badge text-bg-primary me-2"
                >
                  {{ c.email }}
                  <span
                    v-if="hasConfigGeneralPermission"
                    class="badge text-bg-danger m-1"
                    @click="removeContact(c)"
                  >
                    <font-awesome-icon :icon="['fas', 'x']" />
                  </span>
                </span>
              </div>
              <button
                v-if="hasConfigGeneralPermission"
                class="btn btn-outline-primary"
                @click="addContact(liste)"
              >
                <font-awesome-icon :icon="['fas', 'plus']" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Logo</h3>
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
        <div class="card-body table-responsive p-0">
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
