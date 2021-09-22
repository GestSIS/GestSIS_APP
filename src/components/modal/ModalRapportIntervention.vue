<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        Rapport d'intervention - Configuration
      </h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="infoGeneral"
          v-model="params.infoGeneral"
        />
        <label class="custom-control-label" for="infoGeneral">
          Informations générales
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="description"
          v-model="params.description"
        />
        <label class="custom-control-label" for="description">
          Description de l'intervention
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="groupes"
          v-model="params.groupes"
        />
        <label class="custom-control-label" for="groupes">
          Groupes alarmés
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="presences"
          v-model="params.presences"
        />
        <label class="custom-control-label" for="presences">
          Détails des présences des sapeurs
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="montants"
          v-model="params.montants"
        />
        <label class="custom-control-label" for="montants">
          Informations financières (montant)
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="vehicules"
          v-model="params.vehicules"
        />
        <label class="custom-control-label" for="vehicules">
          Véhicules mobilisé
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="materiel"
          v-model="params.materiel"
        />
        <label class="custom-control-label" for="materiel">
          Matériel utilisé
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="absents"
          v-model="params.absents"
        />
        <label class="custom-control-label" for="absents">
          Sapeurs non-présent
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="status"
          v-model="params.status"
        />
        <label class="custom-control-label" for="status">
          Indication du traitement du rapport
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="missions"
          v-model="params.missions"
        />
        <label class="custom-control-label" for="missions">
          Missions de l'intervention
        </label>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="appels"
          v-model="params.appels"
        />
        <label class="custom-control-label" for="appels">
          Appels durant l'intervention
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="generer()">
        Générer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import InterventionService from '@/services/InterventionService';

export default {
  name: 'ModalRapportIntervention',
  data() {
    return {
      params: {
        infoGeneral: true,
        description: true,
        groupes: true,
        presences: true,
        montants: true,
        vehicules: true,
        materiel: true,
        absents: true,
        status: true,
        missions: true,
        appels: true,
      },
    };
  },
  props: {
    data: {
      type: Object,
    },
  },
  mounted() {},
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    generer() {
      InterventionService.downloadRapport(
        this.data.interventionId,
        this.params,
        'intervention.pdf'
      );
      this.HIDE_MODAL();
    },
  },
};
</script>

<style scoped></style>
