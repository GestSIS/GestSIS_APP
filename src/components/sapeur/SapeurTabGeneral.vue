<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useGradeStore } from '../../stores/sapeur/Grade.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useBaseDataStore } from '../../stores/common/BaseData.js';
import permissions from '/src/store/permissions.js';

import SapeurService from '../../services/SapeurService.js';
import SapeurTelephones from '/src/components/sapeur/SapeurTelephones.vue';
import useHasPermission from '../../hooks/usePermission.js';

const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();
const localiteStore = useLocaliteStore();
const baseDataStore = useBaseDataStore();
const errors = ref({});
const defaultPhoto = ref('');
const photo = ref(null); //'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128',

baseDataStore.fetchCivilites();
localiteStore.fetchLocalites();
gradeStore.fetchGrades();
fonctionStore.fetchFonctions();

watchEffect(async () => {
  const sapeurId = sapeurStore.active.id ?? 0;
  if (sapeurId > 0) {
    if (sapeurStore.active.data.type === 0) {
      SapeurService.fetchPhoto(sapeurId).then((p) => {
        photo.value = p;
      });
    }
  }
});

const activeSapeur = computed(() => sapeurStore.active.data);
const activeSapeurId = computed(() => sapeurStore.active.id ?? 0);
const estSapeur = computed(() => sapeurStore.active.data.type === 0);
const civilites = computed(() => baseDataStore.civilites);
const localites = computed(() =>
  localiteStore.liste.map((l) => ({
    ...l,
    npa_localite: `${l.npa} ${l.designation}`,
  })),
);
const fonctions = computed(() => fonctionStore.liste);
const grades = computed(() => gradeStore.liste);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const { showModal, confirm } = useModalStore();
const awn = inject('awn');

const saveSapeur = async () => {
  let fields = [
    'civilite_id',
    'nom',
    'prenom',
    'rue',
    'no_rue',
    'localite_id',
    'no_av',
    'email',
    'date_naissance',
    'suffixe',
    'remarque',
  ];
  let saveSapeur = Object.assign({}, activeSapeur.value);
  for (let key in Object.keys(saveSapeur)) {
    if (!fields.includes(key)) {
      delete saveSapeur[key];
    }
  }
  sapeurStore
    .saveActiveSapeur(saveSapeur)
    .then((res) => {
      errors.value = {};
      awn.success(res.message || 'Modifications sauvegardées');
    })
    .catch((err) => {
      awn.alert(err.message || "Erreur lors de l'enregistrement des données");
      errors.value = err;
    });
};
const saveNonSapeurStatut = async () => {
  let saveSapeur = {
    id: activeSapeur.value.id,
    actif: activeSapeur.value.actif,
  };
  sapeurStore
    .saveNonSapeurStatut(saveSapeur)
    .then((res) => {
      errors.value = {};
      awn.success(res.message || 'Modifications sauvegardées');
    })
    .catch((err) => {
      awn.alert(err.message || "Erreur lors de l'enregistrement des données");
      errors.value = err;
    });
};
const saveSapeurRefPro = () =>
  sapeurStore
    .saveActiveSapeur({
      profession: activeSapeur.value.profession,
      employeur: activeSapeur.value.employeur,
      lieu_de_travail: activeSapeur.value.lieu_de_travail,
    })
    .then((res) => {
      awn.success(res.message || 'Modifications sauvegardées');
    })
    .catch((err) => {
      awn.alert(err.message || "Erreur lors de l'enregistrement des données");
    });
const supprimerPhoto = () =>
  confirm(
    `Voulez-vous vraiment supprimer cette photo ?`,
    'Attention, cette action est irréversible ! La photo sera perdue.',
  ).then(() =>
    SapeurService.deletePhoto(activeSapeurId.value).then(() => {
      photo.value = null;
    }),
  );
const editPhoto = () =>
  showModal({
    component: 'ModalPhotoSapeur',
    size: 1,
    data: photo.value,
    callback: (data) => {
      if (!data) {
        return;
      }
      return SapeurService.updatePhoto(activeSapeurId.value, data?.blob).then(
        () => {
          photo.value = data?.image;
        },
      );
    },
  });
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données personnelles</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveSapeur"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <base-select
            v-model="activeSapeur.civilite_id"
            class="mb-3"
            label="Civilité"
            :disabled="!hasEditPermission"
            :options="civilites"
          />
          <div class="mb-3">
            <label for="m-sap-nom">Nom</label>
            <input
              id="m-sap-nom"
              v-model="activeSapeur.nom"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['nom'] }"
              name="nom"
            />
          </div>
          <div class="mb-3">
            <label for="m-sap-prenom">Prénom</label>
            <input
              id="m-sap-prenom"
              v-model="activeSapeur.prenom"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['prenom'] }"
              name="prenom"
            />
          </div>
          <div class="row mb-3">
            <div class="col-8">
              <label for="m-sap-rue">Rue</label>
              <input
                id="m-sap-rue"
                v-model="activeSapeur.rue"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['rue'] }"
                name="rue"
              />
            </div>
            <div class="col-4">
              <label for="m-sap-no-rue">N°</label>
              <input
                id="m-sap-no-rue"
                v-model="activeSapeur.no_rue"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['no_rue'] }"
                name="no_rue"
              />
            </div>
          </div>
          <base-select
            v-model="activeSapeur.localite_id"
            class="mb-3"
            label="Localité"
            required
            :disabled="!hasEditPermission"
            :options="localites"
            display-key="npa_localite"
          />
          <div class="row">
            <div class="mb-3 col-6">
              <label for="m-sap-avs">N° AVS</label>
              <input
                id="m-sap-avs"
                v-model="activeSapeur.no_avs"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['no_avs'] }"
                name="no_avs"
              />
            </div>
            <div class="mb-3 col-6">
              <label for="m-sap-cotisation_avs">Cotisation AVS</label>
              <font-awesome-icon
                v-tooltip.bottom="
                  'A cocher si le sapeur veut côtiser à l\'avs dès le premier Franc au lieu de la franchise défini dans la loi.'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <div class="form-check text-center col-6">
                <input
                  id="m-sap-cotisation_avs"
                  v-model="activeSapeur.cotisation_avs"
                  type="checkbox"
                  :disabled="!hasEditPermission"
                  class="form-check-input"
                />
                <label
                  class="form-check-label"
                  for="m-sap-cotisation_avs"
                ></label>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="m-sap-email">Email</label>
            <div class="input-group input-group-sm mb-3">
              <div class="input-group-text">
                <font-awesome-icon icon="envelope" />
              </div>
              <input
                id="m-sap-email"
                v-model="activeSapeur.email"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['email'] }"
                type="email"
                :readonly="!hasEditPermission"
                name="email"
              />
            </div>
          </div>
          <div v-if="activeSapeur.type === 0" class="row mb-3">
            <div class="col-6">
              <label for="m-sap-date-naissance">Date de naissance</label>
              <div class="input-group input-group-sm">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
                <input
                  id="m-sap-date-naissance"
                  v-model="activeSapeur.date_naissance"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['date_naissance'] }"
                  type="date"
                  :readonly="!hasEditPermission"
                  name="date_naissance"
                />
              </div>
            </div>
            <div class="col-6">
              <label for="m-sap-suffixe">Suffixe</label>
              <font-awesome-icon
                v-tooltip.bottom="
                  'Permet de différencier deux personnes ayant le même nom et prénom.'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <input
                id="m-sap-suffixe"
                v-model="activeSapeur.suffixe"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['suffixe'] }"
                name="suffixe"
              />
            </div>
          </div>
          <div class="mb-3">
            <label for="m-sap-remarques">Remarques</label>
            <textarea
              id="m-sap-remarques"
              v-model="activeSapeur.remarque"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['remarque'] }"
              rows="3"
              name="remarques"
            ></textarea>
          </div>
        </div>
      </div>
      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Références professionnelles</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveSapeurRefPro"
          >
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <label for="m-sap-profession">Profession</label>
              <input
                id="m-sap-profession"
                v-model="activeSapeur.profession"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                name="profession"
              />
            </div>
            <div class="mb-3">
              <label for="m-sap-employeur">Employeur</label>
              <input
                id="m-sap-employeur"
                v-model="activeSapeur.employeur"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                name="employeur"
              />
            </div>
            <div class="mb-3">
              <label for="m-sap-lieu-travail">Lieu de travail</label>
              <input
                id="m-sap-lieu-travail"
                v-model="activeSapeur.lieu_de_travail"
                type="text"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                name="lieu_travail"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-sm-12 col-xl-6">
      <div v-if="!estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Civil</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveNonSapeurStatut"
          >
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <div class="form-check form-switch">
                <input
                  id="civilActif"
                  v-model="activeSapeur.actif"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="civilActif">Actif</label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Photo</h3>
          <button
            v-if="photo && hasEditPermission"
            class="ms-auto me-2 btn btn-outline-danger"
            @click="supprimerPhoto"
          >
            Supprimer
          </button>
          <button
            v-if="hasEditPermission"
            class="btn btn-outline-primary"
            @click="editPhoto"
          >
            Modifier
          </button>
        </div>
        <div class="card-body text-center">
          <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
          <img v-else class="img img-responsive" :src="photo" />
        </div>
      </div>

      <SapeurTelephones />

      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <base-select
              v-model="activeSapeur.fonction_id"
              class="mb-3"
              label="Fonction principale"
              display-key="nom"
              :options="fonctions"
              disabled
            />
            <base-select
              v-model="activeSapeur.grade_id"
              class="mb-3"
              label="Grade actuel"
              :options="grades"
              disabled
            />
            <div class="mb-3 form-check">
              <input
                id="actif"
                v-model="activeSapeur.actif"
                type="checkbox"
                name="actif"
                class="form-check-input"
                disabled
                :true-value="1"
                :false-value="0"
              />
              <label for="actif">Actif</label>
              <font-awesome-icon
                v-tooltip.bottom="
                  'Pour désactiver un sapeur, utiliser l\'onglet Mutations !'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
