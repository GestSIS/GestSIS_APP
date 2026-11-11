<script setup>
import { useDownload } from "../composables/useDownload.js";
import { computed, ref, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";
import { useSapeurStore } from "../stores/sapeur/Sapeur.js";
import { useExerciceComptableStore } from "../stores/comptabilite/ExerciceComptable.js";
import { useMedecinStore } from "../stores/controleMedical/Medecin.js";
import { useControleMedicalTypeStore } from "../stores/controleMedical/ControleMedicalType.js";
import ControlesMedicauxService from "/src/services/ControlesMedicauxService.js";
import PdfViewer from "/src/components/pdf/PdfViewer.vue";
import { useModalStore } from "../stores/common/Modal";
import { useControleMedicalStore } from "../stores/controleMedical/ControleMedical.js";
import permissions from "../composables/permissions.js";
import { useHasPermission } from "../composables/useHasPermission.js";
import { useSubmit } from "../composables/useSubmit.js";

const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const controleMedicalStore = useControleMedicalStore();
const medecinStore = useMedecinStore();
const controleMedicalTypeStore = useControleMedicalTypeStore();
const router = useRouter();
const { download } = useDownload();
const hasEditPermission = useHasPermission(permissions.CONTROLE_MEDICAL.MODIFICATION);

const { id } = defineProps({
  id: {
    type: [String, Number],
    default: "ajout",
  },
});

const loadSapeurs = sapeurStore.fetchSapeurs();
const loadMedecins = medecinStore.fetchMedecins();
const loadControlesMedicauxTypes = controleMedicalTypeStore.fetchTypes();

const loadControleMedicale =
  id > 0
    ? controleMedicalStore.fetchControleMedical(id)
    : controleMedicalStore.resetControleMedical();

await Promise.all([loadSapeurs, loadMedecins, loadControlesMedicauxTypes, loadControleMedicale]);

const { errors, isSubmitting, submit } = useSubmit();
const pdfData = ref(null);
const file = ref(null);

const controleMedical = computed(() => controleMedicalStore.active.data);
const medecins = computed(() => medecinStore.liste);
const sapeurs = computed(() =>
  sapeurStore.liste
    .filter((s) => s.type === 0 && s.actif)
    .map((s) => {
      const age = Math.floor(
        (new Date() - new Date(s?.date_naissance || 0).getTime()) / 1000 / (60 * 60 * 24) / 365.25,
      );
      return { ...s, age };
    }),
);
const controleTypes = computed(() => controleMedicalTypeStore.liste);
const activeExerciceComptableId = computed(() => exerciceComptableStore.activeId);

const breadcrumbFinal = computed(() => controleMedical.value.designation);
const sapeurName = computed(() => {
  const sapeur = sapeurs.value.find((s) => s.id == controleMedical.value.sapeur_id);
  return `${sapeur?.nom_prenom} (${sapeur?.age} ans)`;
});
const modeAjout = computed(() => {
  return !(parseInt(id) > 0);
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
  ControlesMedicauxService.downloadJustificatif(controleMedical.value.id).then((response) => {
    pdfData.value = response.data;
  });
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
  download(
    () =>
      ControlesMedicauxService.downloadJustificatif(
        controleMedical.value.id,
        controleMedical.value.filename,
      ),
    "Erreur lors du téléchargement du justificatif.",
  );
};
const save = async () => {
  const { ok, data } = await submit(
    () =>
      // Ajout d'un nouveau controle-médical, ou sauvegarde des changements
      modeAjout.value
        ? controleMedicalStore.createControleMedical()
        : controleMedicalStore.updateControleMedical(),
    "Erreur lors de l'enregistrement",
    "Modifications enregistrées",
  );
  if (!ok) {
    return;
  }
  if (modeAjout.value) {
    router.push({ name: "controle-medical", params: { id: data.id } });
  }
};
const fileComponent = useTemplateRef("file-justificatif");
const ajoutJustificatif = async () => {
  if (fileComponent.value.files.length > 0) {
    const file = fileComponent.value.files[0];
    await submit(
      () => controleMedicalStore.addJustificatif(file),
      "Erreur lors de l'ajout du justificatif.",
    );
  }
};
const { confirm } = useModalStore();
const removeJustificatif = async () => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce justificatif ?",
      "Attention, la suppression d'un justificatif est irréversible ! Toutes les données de ce justificatif seront perdues !",
    )
  ) {
    await submit(
      () => controleMedicalStore.removeJustificatif(),
      "Erreur lors de la suppression du justificatif.",
      "Justificatif supprimé.",
    );
  }
};

const validite = (duree) => {
  var d = new Date(controleMedical.value.consultation || Date.now());
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  controleMedical.value.validite = `${year + duree}-${("0" + month).slice(
    -2,
  )}-${("0" + day).slice(-2)}`;
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
              <router-link :to="{ name: 'controles-medicaux' }">Controles médicaux</router-link>
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
            <button
              :disabled="isSubmitting"
              v-if="hasEditPermission"
              class="btn btn-outline-primary"
              @click="save"
            >
              {{ modeAjout ? "Ajouter" : "Enregistrer" }}
            </button>
          </div>
          <fieldset :disabled="!hasEditPermission" class="card-body">
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
              <base-checkbox v-model="controleMedical.accepter" label="Accepté" />
            </div>
            <div class="row">
              <div class="col-12" :class="{ 'col-xl-6': expirable }">
                <div class="mb-3">
                  <label for="m-exe-date-consultation">Consultation</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                    <input
                      id="m-exe-date-consultation"
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
                  <button class="btn btn-primary" @click="validite(1)">+1</button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(3)">+3</button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-xl-none">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(5)">+5</button>
                </div>
              </div>
              <div v-if="expirable" class="col-12 col-xl-6">
                <div class="mb-3">
                  <label for="m-exe-date-validite">Validité</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-text">
                      <font-awesome-icon :icon="['far', 'calendar-alt']" />
                    </div>
                    <input
                      id="m-exe-date-validite"
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
                  <button class="btn btn-primary" @click="validite(1)">+1</button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(3)">+3</button>
                </div>
              </div>
              <div v-if="expirable" class="col-4 d-none d-xl-block">
                <div v-if="expirable" class="d-grid">
                  <button class="btn btn-primary" @click="validite(5)">+5</button>
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
          </fieldset>
        </div>
        <div class="alert alert-info mt-2" role="alert">
          <strong><em>Contrôle médical type, remarque :</em></strong>
          <template
            v-if="
              !controleTypes?.find((t) => t.id == controleMedical.controle_medical_type_id)
                ?.remarque
            "
          >
            Aucune remarque
          </template>
          <template
            v-for="(elem, i) in (
              controleTypes?.find((t) => t.id == controleMedical.controle_medical_type_id)
                ?.remarque ?? ''
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
              <button class="btn btn-outline-primary ms-2" @click="downloadJustificatif()">
                Download
              </button>
              <button
                :disabled="isSubmitting"
                v-if="hasEditPermission"
                class="btn btn-outline-primary ms-2"
                @click="removeJustificatif()"
              >
                Supprimer
              </button>
            </div>
          </div>
          <div v-if="!controleMedical.filename && hasEditPermission" class="card-body">
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
                :disabled="isSubmitting || !file"
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
