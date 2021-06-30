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
          v-model="infoGeneral"
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
          v-model="description"
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
          v-model="groupes"
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
          v-model="presences"
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
          v-model="montants"
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
          v-model="vehicules"
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
          v-model="materiel"
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
          v-model="absents"
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
          v-model="status"
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
          v-model="missions"
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
          v-model="appels"
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
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activePhase.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'ModalRapportIntervention',
  data() {
    return {
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
    };
  },
  props: {
    data: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      listePhaseType: (state) => state.phaseType.liste,
      activePhase: (state) => state.phaseType.active.data,
    }),
  },
  mounted() {},
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if (!(this.activePhase.debut === null && this.activePhase.id)) {
        this.activePhase.debut = DateTime.fromISO(
          this.activePhase.debut2
        ).toFormat(this.format);
      }
      if ((this.activePhase.id || 0) === 0) {
        this.$store
          .dispatch('addPhase', {
            ...this.activePhase,
            debut2: undefined,
          })
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editPhase', {
            ...this.activePhase,
            debut2: undefined,
          })
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      }
    },
  },
};
</script>

<style scoped></style>
