<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useGradeStore } from "../../stores/sapeur/Grade.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useBaseDataStore } from "../../stores/common/BaseData.js";
import permissions from "/src/composables/permissions.js";

import SapeurService from "../../services/SapeurService.js";
import SapeurTelephones from "/src/components/sapeur/SapeurTelephones.vue";
import { useHasPermission } from "../../composables/useHasPermission.js";
import { useSubmit } from "../../composables/useSubmit.js";
import { STATUT } from "../../tools/sapeur.js";

const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();
const localiteStore = useLocaliteStore();
const baseDataStore = useBaseDataStore();
const { errors, isSubmitting, submit } = useSubmit();
const defaultPhoto = ref("");
const photo = ref(null); //'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128',

baseDataStore.fetchCivilites();
localiteStore.fetchLocalites();
gradeStore.fetchGrades();
fonctionStore.fetchFonctions();

watchEffect(async () => {
  const sapeurId = sapeurStore.active.id ?? 0;
  if (sapeurId > 0) {
    if (sapeurStore.active.data.statut_sapeur !== STATUT.JAMAIS) {
      SapeurService.fetchPhoto(sapeurId).then((p) => {
        photo.value = p;
      });
    }
  }
});

const activeSapeur = computed(() => sapeurStore.active.data);
const activeSapeurId = computed(() => sapeurStore.active.id ?? 0);
// Est ou a été sapeur
const estSapeur = computed(() => sapeurStore.active.data.statut_sapeur !== STATUT.JAMAIS);
const sapeurActif = computed(() => sapeurStore.active.data.statut_sapeur === STATUT.ACTIF);
const estRecrue = computed(
  () =>
    sapeurStore.active.data.statut_sapeur === STATUT.JAMAIS &&
    sapeurStore.active.data.statut_civil === STATUT.JAMAIS,
);
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
const fonctionPrincipale = computed(
  () => fonctions.value.find((f) => f.id === activeSapeur.value.fonction_id)?.nom,
);
const gradeActuel = computed(
  () => grades.value.find((g) => g.id === activeSapeur.value.grade_id)?.designation,
);

const { showModal, confirm } = useModalStore();

const saveSapeur = async () => {
  let fields = [
    "civilite_id",
    "nom",
    "prenom",
    "rue",
    "no_rue",
    "localite_id",
    "no_avs",
    "cotisation_avs",
    "email",
    "date_naissance",
    "suffixe",
    "remarque",
  ];
  let saveSapeur = Object.assign({}, activeSapeur.value);
  for (const key of Object.keys(saveSapeur)) {
    if (!fields.includes(key)) {
      delete saveSapeur[key];
    }
  }
  await submit(
    () => sapeurStore.saveActiveSapeur(saveSapeur),
    "Erreur lors de l'enregistrement des données",
    "Modifications sauvegardées",
  );
};
const saveSapeurRefPro = () =>
  submit(
    () =>
      sapeurStore.saveActiveSapeur({
        profession: activeSapeur.value.profession,
        employeur: activeSapeur.value.employeur,
        lieu_de_travail: activeSapeur.value.lieu_de_travail,
      }),
    "Erreur lors de l'enregistrement des données",
    "Modifications sauvegardées",
  );
const supprimerPhoto = async () => {
  if (
    !(await confirm(
      `Voulez-vous vraiment supprimer cette photo ?`,
      "Attention, cette action est irréversible ! La photo sera perdue.",
    ))
  ) {
    return;
  }
  const { ok } = await submit(
    () => SapeurService.deletePhoto(activeSapeurId.value),
    "Erreur lors de la suppression de la photo.",
    "Photo supprimée.",
  );
  if (ok) {
    photo.value = null;
  }
};
const editPhoto = () =>
  showModal({
    component: "ModalPhotoSapeur",
    size: 1,
    data: photo.value,
    callback: (data) => {
      if (!data) {
        return;
      }
      return SapeurService.updatePhoto(activeSapeurId.value, data?.blob).then(() => {
        photo.value = data?.image;
      });
    },
  });
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <base-card title="Données personnelles">
        <template #header>
          <button
            :disabled="isSubmitting"
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveSapeur"
          >
            Enregistrer
          </button>
        </template>
        <template #body>
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
                <label class="form-check-label" for="m-sap-cotisation_avs"></label>
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
          <div v-if="estSapeur || estRecrue" class="row mb-3">
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
        </template>
      </base-card>
      <base-card title="Références professionnelles" v-if="estSapeur || estRecrue">
        <template #header>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            :disabled="isSubmitting"
            @click.prevent="saveSapeurRefPro"
          >
            Enregistrer
          </button>
        </template>
        <template #body>
          <form role="form">
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
          </form>
        </template>
      </base-card>
    </div>
    <div class="col-sm-12 col-xl-6">
      <base-card title="Photo" v-if="estSapeur" body-class="text-center">
        <template #header>
          <button
            :disabled="isSubmitting"
            v-if="photo && hasEditPermission"
            class="ms-auto me-2 btn btn-outline-danger"
            @click="supprimerPhoto"
          >
            Supprimer
          </button>
          <button v-if="hasEditPermission" class="btn btn-outline-primary" @click="editPhoto">
            Modifier
          </button>
        </template>
        <template #body>
          <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
          <img v-else class="img img-responsive" :src="photo" />
        </template>
      </base-card>

      <SapeurTelephones />

      <base-card title="Informations" v-if="estSapeur">
        <template #body>
          <div class="mb-3 d-flex align-items-center justify-content-between">
            <span>
              <strong>Fonction principale: </strong>
              <span v-if="fonctionPrincipale" class="badge rounded-pill text-bg-primary">{{
                fonctionPrincipale
              }}</span>
              <span v-else>-</span>
            </span>
            <router-link
              :to="{ name: 'sapeur-fonctions', params: { id: activeSapeurId } }"
              class="btn btn-sm btn-outline-primary"
            >
              Historique
              <font-awesome-icon :icon="['fas', 'angle-right']" class="ms-1" />
            </router-link>
          </div>
          <div class="mb-3 d-flex align-items-center justify-content-between">
            <span>
              <strong>Grade actuel: </strong>
              <span v-if="gradeActuel" class="badge rounded-pill text-bg-primary">{{
                gradeActuel
              }}</span>
              <span v-else>-</span>
            </span>
            <router-link
              :to="{ name: 'sapeur-promotions', params: { id: activeSapeurId } }"
              class="btn btn-sm btn-outline-primary"
            >
              Historique
              <font-awesome-icon :icon="['fas', 'angle-right']" class="ms-1" />
            </router-link>
          </div>
          <div class="d-flex align-items-center justify-content-between">
            <span>
              <strong>Statut: </strong>
              <span
                class="badge rounded-pill"
                :class="sapeurActif ? 'text-bg-success' : 'text-bg-secondary'"
                >{{ sapeurActif ? "Actif" : "Inactif" }}</span
              >
            </span>
            <router-link
              :to="{ name: 'sapeur-mutations', params: { id: activeSapeurId } }"
              class="btn btn-sm btn-outline-primary"
            >
              Mutations
              <font-awesome-icon :icon="['fas', 'angle-right']" class="ms-1" />
            </router-link>
          </div>
        </template>
      </base-card>
    </div>
  </div>
</template>
