<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        Rapport d'intervention - Configuration
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="infoGeneral"
          v-model="params.infoGeneral"
        />
        <label class="form-check-label" for="infoGeneral">
          Informations générales
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="description"
          v-model="params.description"
        />
        <label class="form-check-label" for="description">
          Description de l'intervention
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="groupes"
          v-model="params.groupes"
        />
        <label class="form-check-label" for="groupes"> Groupes alarmés </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="presences"
          v-model="params.presences"
        />
        <label class="form-check-label" for="presences">
          Détails des présences des sapeurs
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="montants"
          v-model="params.montants"
        />
        <label class="form-check-label" for="montants">
          Informations financières (montant)
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="vehicules"
          v-model="params.vehicules"
        />
        <label class="form-check-label" for="vehicules">
          Véhicules mobilisé
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="materiel"
          v-model="params.materiel"
        />
        <label class="form-check-label" for="materiel">
          Matériel utilisé
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="absents"
          v-model="params.absents"
        />
        <label class="form-check-label" for="absents">
          Sapeurs non-présent
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="statut"
          v-model="params.statut"
        />
        <label class="form-check-label" for="statut">
          Indication du traitement du rapport
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="missions"
          v-model="params.missions"
        />
        <label class="form-check-label" for="missions">
          Missions de l'intervention
        </label>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="appels"
          v-model="params.appels"
        />
        <label class="form-check-label" for="appels">
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
        statut: true,
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
