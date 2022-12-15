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
          :class="{ 'is-invalid': errors['designation'] }"
          name="designation"
          :disabled="params.exercice_id || params.sapeur_id"
        />
      </div>
      <base-select
        v-if="!params.exercice_id"
        v-model="params.exercice_comptable_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['exercice_comptable_id'] }"
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
          :class="{ 'is-invalid': errors['date'] }"
          name="date"
        />
      </div>
      <div v-if="mode === 'genererDecompteAnnuel'" class="mb-3">
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
import { mapState, mapMutations } from 'vuex';

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
      errors: {},
      mode: 'genererDecompte',
      params: {
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
    this.params.exercice_comptable_id = this.activeExerciceComptableId;
    this.params.sapeur_id = this.data?.sapeurId;
    this.params.exercice_id = this.data?.exerciceId;
    this.params.designation = `Décompte ${this.data?.designation ?? ''}`;

    this.mode = this.params.sapeur_id
      ? 'genererDecompteSapeur'
      : this.params.exercice_id
      ? 'genererDecompteExercice'
      : 'genererDecompteAnnuel';
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    close() {
      this.HIDE_MODAL();
    },
    creer() {
      this.$store
        .dispatch(this.mode, this.params)
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
            errors?.message ?? 'Erreur lors de la création du décompte'
          );
        });
    },
  },
};
</script>

<style scoped></style>
