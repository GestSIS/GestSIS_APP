<script setup>
import ControlesMedicauxService from '/src/services/ControlesMedicauxService.js';

import PdfViewer from '/src/components/pdf/PdfViewer.vue';
import { useStore } from 'vuex';
import { computed, inject, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import useConfirmation from '../hooks/useConfirmation';

const store = useStore();
const router = useRouter();
const awn = inject('awn');

const { id } = defineProps({
  id: {
    type: [String, Number],
    default: 'ajout',
  },
});

const loadSapeurs = store.dispatch('fetchListeSapeur');
const loadMedecins = store.dispatch('fetchMedecins');
const loadControlesMedicauxTypes = store.dispatch(
  'fetchControlesMedicauxTypes',
);

const loadControleMedicale =
  id > 0
    ? store.dispatch('fetchControleMedical', id)
    : store.dispatch('resetControleMedical');

await Promise.all([
  loadSapeurs,
  loadMedecins,
  loadControlesMedicauxTypes,
  loadControleMedicale,
]);

const errors = ref({});
const loading = ref(true);
const pdfData = ref(null);
const file = ref(null);

const controleMedical = computed(() => store.state.controleMedical.active.data);
const medecins = computed(() => store.state.medecin.liste);
const sapeurs = computed(() =>
  store.state.sapeur.liste
    .filter((s) => s.type === 0 && parseInt(s.actif))
    .map((s) => {
      const age = Math.floor(
        (new Date() - new Date(s?.date_naissance || 0).getTime()) /
          1000 /
          (60 * 60 * 24) /
          365.25,
      );
      return { ...s, age };
    }),
);
const controleTypes = computed(() => store.state.controlesMedicauxType.liste);
const activeExerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

const breadcrumbFinal = computed(() => controleMedical.value.designation);
const sapeurName = computed(() => {
  const sapeur = sapeurs.value.find(
    (s) => s.id == controleMedical.value.sapeur_id,
  );
  return `${sapeur?.nom_prenom} (${sapeur?.age} ans)`;
});
const modeAjout = computed(() => {
  return !parseInt(id) > 0;
});
const expirable = computed(() => {
  const types = controleTypes.value.filter(
    (t) => t.id === controleMedical.value.controle_medical_type_id,
  );
  return types.length > 0 && types[0].expirable;
});

watch(
  () => controleMedical.value,
  (next, prev) => {
    if (
      (pdfData.value === null && next.filename) ||
      (prev.filename !== next.filename && next.filename)
    ) {
      displayJustificatif();
    } else if (!next.filename) {
      pdfData.value = null;
    }
  },
);
watch(
  () => expirable.value,
  (next) => {
    if (!next) {
      controleMedical.value.validite = null;
    }
  },
);

const displayJustificatif = () => {
  ControlesMedicauxService.downloadJustificatif(controleMedical.value.id).then(
    (response) => {
      pdfData.value = response.data;
    },
  );
};

if (controleMedical.value.filename) {
  displayJustificatif();
}

const onFileChange = (event) => {
  const files = event.target.files || event.dataTransfer.files;
  if (!files.length) return;
  file.value = files[0];
};
const downloadJustificatif = () => {
  ControlesMedicauxService.downloadJustificatif(
    controleMedical.value.id,
    controleMedical.value.filename,
  );
};
const save = async () => {
  if (modeAjout.value) {
    // Ajout d'un nouveau controle-médical
    store
      .dispatch('createControleMedical')
      .then((res) => {
        router.push({ name: 'controle-medical', params: { id: res.id } });
      })
      .then((res) => awn.success(res?.message || 'Modifications enregistrées'))
      .catch((err) =>
        awn.alert(err?.message || "Erreur lors de l'enregistrement"),
      );
  } else {
    // Sauvegarder les changements
    store
      .dispatch('updateControleMedical')
      .then((res) => awn.success(res?.message || 'Modifications enregistrées'))
      .catch((err) =>
        awn.alert(err?.message || "Erreur lors de l'enregistrement"),
      );
  }
};
const fileComponent = useTemplateRef('file-justificatif');
const ajoutJustificatif = () => {
  if (fileComponent.value.files.length > 0) {
    const file = fileComponent.value.files[0];
    store.dispatch('addJustificatif', file);
  }
};
const { confirm } = useConfirmation();
const removeJustificatif = () =>
  confirm(
    'Voulez-vous vraiment supprimer ce justificatif ?',
    "Attention, la suppression d'un justificatif est irréversible ! Toutes les données de ce justificatif seront perdues !",
  ).then(() => store.dispatch('removeJustificatif'));

const validite = (duree) => {
  var d = new Date(controleMedical.value.consultation || Date.now());
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  controleMedical.value.validite = `${year + duree}-${('0' + month).slice(
    -2,
  )}-${('0' + day).slice(-2)}`;
};
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'controles-medicaux' }"
                >Controles médicaux</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-4 col-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h5>Infos</h5>
            <button class="btn btn-outline-primary" @click="save">
              {{ modeAjout ? 'Ajouter' : 'Enregistrer' }}
            </button>
          </div>
          <div class="card-body">
            <div v-if="!modeAjout" class="mb-3">
              <label for="m-exe-des">Sapeur</label>
              <input
                id="m-exe-des"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['designation'] }"
                name="nom"
                readonly
                :value="sapeurName"
              />
            </div>
            <base-select
              v-else
              v-model="controleMedical.sapeur_id"
              class="mb-3"
              :class="{ 'is-invalid': errors['sapeur_id'] }"
              label="Sapeur"
              display-key="nom_prenom"
              :formatter="(s) => `${s?.nom_prenom} (${s?.age} ans)`"
              :options="sapeurs"
            />
            <base-select
              v-model="controleMedical.medecin_id"
              class="mb-3"
              :class="{ 'is-invalid': errors['medecin_id'] }"
              label="Médecin"
              :options="medecins"
              required
            />
            <base-select
              v-model="controleMedical.controle_medical_type_id"
              class="mb-3"
              :class="{ 'is-invalid': errors['controle_medical_type_id'] }"
              label="Type"
              :options="controleTypes"
            />
            <div class="mb-3">
              <div class="form-check">
                <input
                  id="m-ctr-accepter"
                  v-model="controleMedical.accepter"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label" for="m-ctr-accepter"
                  >Accepté</label
                >
              </div>
            </div>
            <div class="row">
              <div class="col-12" :class="{ 'col-xl-6': expirable }">
                <div class="mb-3">
                  <label for="m-exe-date">Consultation</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                    <input
                      id="m-exe-date"
                      v-model="controleMedical.consultation"
                      type="date"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['date'] }"
                      name="consultation"
                    />
                  </div>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(1)">
                    +1
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(3)">
                    +3
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(5)">
                    +5
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-12 col-xl-6">
                <div class="mb-3">
                  <label for="m-exe-date">Validité</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                    <input
                      id="m-exe-date"
                      v-model="controleMedical.validite"
                      type="date"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': errors['date'] }"
                      name="validite"
                    />
                  </div>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(1)">
                    +1
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(3)">
                    +3
                  </button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(5)">
                    +5
                  </button>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="m-sap-communication">Désignation</label>
              <textarea
                id="m-sap-communication"
                v-model="controleMedical.designation"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['communications'] }"
                name="communications"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="alert alert-info mt-2" role="alert">
          <strong><em>Contrôle médical type, remarque :</em></strong>
          <template
            v-if="
              !controleTypes?.find(
                (t) => t.id == controleMedical.controle_medical_type_id,
              )?.remarque
            "
          >
            Aucune remarque
          </template>
          <template
            v-for="(elem, i) in (
              controleTypes?.find(
                (t) => t.id == controleMedical.controle_medical_type_id,
              )?.remarque ?? ''
            ).split('\n')"
            :key="i"
          >
            <br />
            {{ elem }}
          </template>
        </div>
      </div>
      <div v-if="controleMedical.id" class="col-lg-8 col-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header">
            <h5>Document</h5>
            <div v-if="controleMedical.filename">
              {{ controleMedical.filename }}
              <button
                class="btn btn-outline-primary ms-2"
                @click="downloadJustificatif()"
              >
                Download
              </button>
              <button
                class="btn btn-outline-primary ms-2"
                @click="removeJustificatif()"
              >
                Supprimer
              </button>
            </div>
          </div>
          <div v-if="!controleMedical.filename" class="card-body">
            <div class="input-group input-group-sm mb-3">
              <p class="w-100">Aucun document</p>
              <input
                ref="file-justificatif"
                type="file"
                class="form-control form-control-sm"
                accept="application/pdf"
                @change="onFileChange"
              />
              <button
                v-if="!controleMedical.filename"
                class="btn btn-outline-primary"
                :disabled="!file"
                @click="ajoutJustificatif"
              >
                Ajouter
              </button>
            </div>
          </div>
          <pdf-viewer v-if="controleMedical.filename" :pdf-data="pdfData" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
