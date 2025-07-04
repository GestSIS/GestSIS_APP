<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Paramètres pour le décompte
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="m-designation">Désignation</label>
        <input
          id="m-designation"
          v-model="params.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': config.errors['designation'] }"
          name="designation"
          :disabled="params.exercice_id || params.sapeur_id"
        />
      </div>
      <base-select
        v-if="!params.exercice_id"
        v-model="params.exercice_comptable_id"
        class="mb-3"
        :class="{ 'is-invalid': config.errors['exercice_comptable_id'] }"
        label="Exercice comptable id"
        :options="listeExerciceComptable"
      />
      <div class="mb-3">
        <label for="m-date">Date</label>
        <input
          id="m-date"
          v-model="params.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': config.errors['date'] }"
          name="date"
        />
      </div>
      <div v-if="config.mode === 'genererDecompteAnnuel'" class="mb-3">
        <label>Sélection des écritures</label>
        <div class="form-check form-switch">
          <input
            id="ecritures-exercice"
            v-model="params.ecrituresExercice"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-exercice"
            >Exercices &amp; séances</label
          >
        </div>
        <div class="form-check form-switch">
          <input
            id="ecritures-intervention"
            v-model="params.ecrituresIntervention"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-intervention"
            >Interventions</label
          >
        </div>
        <div class="form-check form-switch">
          <input
            id="ecritures-cours"
            v-model="params.ecrituresCours"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-cours">Cours</label>
        </div>
        <div class="form-check form-switch">
          <input
            id="ecritures-travail"
            v-model="params.ecrituresTravail"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-travail"
            >Fiches de travail</label
          >
        </div>
        <div class="form-check form-switch">
          <input
            id="ecritures-divers"
            v-model="params.ecrituresDivers"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-divers"
            >Ecritures diverses</label
          >
        </div>
        <div class="form-check form-switch">
          <input
            id="ecritures-annuel"
            v-model="params.ecrituresAnnuel"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-annuel"
            >Indemnités et frais annuels</label
          >
        </div>
        <div class="form-check form-switch">
          <input
            id="ecritures-amende"
            v-model="params.ecrituresAmende"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="ecritures-amende">Amendes</label>
        </div>
      </div>
      <hr v-if="!params.exercice_id" />
      <div v-if="!params.exercice_id" class="mb-3">
        <h5>Sélection des sapeurs</h5>
        <div class="input-group mb-3">
          <button class="btn btn-outline-primary" @click="select">
            Sélection
          </button>
          <input
            type="text"
            disabled
            class="form-control"
            :value="
              params.sapeurIds.length <= 0
                ? 'Tous les sapeurs'
                : params.sapeurIds.length + ' sapeurs sélectionnés'
            "
          />
          <button class="btn btn-outline-danger" @click="resetSelection">
            Reset
          </button>
        </div>
      </div>

      <div v-if="params.exercice_id" class="mb-3">
        <div class="form-check">
          <input
            id="m-sap-cotisation_avs"
            v-model="params.deduction"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="m-sap-cotisation_avs"
            >Déduction</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="creer()">Créer</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalDecompte',
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      config: {
        errors: {},
        mode: 'genererDecompte',
      },
      params: {
        sapeurIds: [],
        date: new Date().toJSON().slice(0, 10),
        designation: '',
        exercice_comptable_id: null,
        sapeur_id: null,
        exercice_id: null,
        deduction: false,

        // Types d'écritures
        ecrituresAmende: false,
        ecrituresAnnuel: true,
        ecrituresCours: true,
        ecrituresDivers: true,
        ecrituresTravail: true,
        ecrituresExercice: true,
        ecrituresIntervention: true,
      },
    };
  },
  computed: {
    ...mapState({
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      listeSapeur: (state) => state.sapeur.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
  },
  mounted() {
    if (this.data.remount) {
      this.config = this.data.state.config;
      this.params = this.data.state.params;
    } else {
      this.params.exercice_comptable_id = this.activeExerciceComptableId;
      this.params.sapeur_id = this.data?.sapeurId;
      this.params.exercice_id = this.data?.exerciceId;
      this.params.designation = `Décompte ${this.data?.designation ?? ''}`;

      this.config.mode = this.params.sapeur_id
        ? 'genererDecompteSapeur'
        : this.params.exercice_id
          ? 'genererDecompteExercice'
          : 'genererDecompteAnnuel';
    }
  },
  methods: {
    ...mapActions(useModalStore, {
      SHOW_MODAL: 'showModal',
      HIDE_MODAL: 'closeModal',
    }),
    close() {
      this.HIDE_MODAL();
    },
    creer() {
      this.$store
        .dispatch(this.config.mode, this.params)
        .then(() => {
          (this.callback() ?? Promise.resolve()).then((close) => {
            if (close ?? true) {
              this.HIDE_MODAL();
            }
          });
        })
        .catch((errors) => {
          this.errors = errors;
          this.$awn.alert(
            errors?.message ?? 'Erreur lors de la création du décompte',
          );
        });
    },
    select() {
      const save = {
        callback: this.callback,
        data: {
          ...this.data,
          remount: true,
          state: { config: { ...this.config }, params: { ...this.params } },
        },
      };
      const data = {
        ids: this.params.sapeurIds.slice(0),
      };
      const callback = (res) => {
        if (res) {
          save.data.state.params.sapeurIds = res.tous;
        }
        this.SHOW_MODAL({
          component: 'ModalDecompte',
          callback: save.callback,
          data: save.data,
        });
        return Promise.resolve(false);
      };
      this.SHOW_MODAL({
        component: 'ModalSapeurSelect',
        size: 1,
        callback,
        data,
      });
    },
    resetSelection() {
      this.params.sapeurIds = [];
    },
  },
};
</script>
