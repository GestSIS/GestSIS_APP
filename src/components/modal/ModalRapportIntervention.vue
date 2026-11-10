<script setup>
import { reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import permissions from "/src/composables/permissions.js";
import InterventionService from "/src/services/InterventionService.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import { exportFileName } from "../../tools/index.js";
import { useDownload } from "../../composables/useDownload.js";
import { INTERVENTION_STATUT } from "../../tools/intervention.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  infoGeneral: true,
  description: true,
  groupes: true,
  presences: true,
  presencesResume: true,
  vehicules: true,
  materiel: true,
  absents: true,
  statut: true,
  missions: true,
  appels: true,
  jalons: true,
  montants: false,
});

const hasComptabilitePermission = useHasPermission(permissions.COMPTABILITE.LECTURE);

const { closeModal } = useModalStore();
const { download } = useDownload();

const generer = () => {
  download(
    () =>
      InterventionService.downloadRapport(
        data.interventionId,
        form,
        exportFileName(["rapport-intervention", data.date?.slice(0, 10)], "pdf"),
      ),
    "Erreur lors de la génération du rapport d'intervention",
  );
};
</script>

<template>
  <form @submit.prevent="generer">
    <div class="modal-header">
      <h5 class="modal-title">Rapport d'intervention - Configuration</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="form-check">
        <input
          id="infoGeneral"
          v-model="form.infoGeneral"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="infoGeneral">Informations générales</label>
      </div>
      <div class="form-check">
        <input
          id="description"
          v-model="form.description"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="description">Description de l'intervention</label>
      </div>
      <div class="form-check">
        <input id="groupes" v-model="form.groupes" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="groupes">Groupes alarmés</label>
      </div>
      <div class="form-check">
        <input id="presences" v-model="form.presences" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="presences">Détails des présences des sapeurs</label>
      </div>
      <div class="form-check">
        <input
          id="presencesResume"
          v-model="form.presencesResume"
          :disabled="form.presences"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="presencesResume"
          >Résumé simplifié des présences des sapeurs</label
        >
      </div>
      <div class="form-check">
        <input id="vehicules" v-model="form.vehicules" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="vehicules">Véhicules mobilisé</label>
      </div>
      <div class="form-check">
        <input id="materiel" v-model="form.materiel" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="materiel">Matériel utilisé</label>
      </div>
      <div class="form-check">
        <input id="absents" v-model="form.absents" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="absents">Sapeurs non-présent</label>
      </div>
      <div class="form-check">
        <input id="statut" v-model="form.statut" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="statut">Indication du traitement du rapport</label>
      </div>
      <div class="form-check">
        <input id="missions" v-model="form.missions" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="missions">Missions de l'intervention</label>
      </div>
      <div class="form-check">
        <input id="appels" v-model="form.appels" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="appels">Appels durant l'intervention</label>
      </div>
      <div class="form-check">
        <input id="jalons" v-model="form.jalons" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="jalons">Jalons de l'intervention</label>
      </div>
      <div
        v-if="hasComptabilitePermission && data.statut >= INTERVENTION_STATUT.IMPUTEE"
        class="form-check"
      >
        <input id="montants" v-model="form.montants" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="montants">Informations financières (montant)</label>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">Générer</button>
    </div>
  </form>
</template>
