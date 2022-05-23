<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Paramètres pour le décompte</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="m-designation">Désignation</label>
        <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errorsData['designation'] }"
          id="m-designation" name="designation" v-model="params.designation"
          :disabled="this.params.exercice_id || this.params.sapeur_id" />
      </div>
      <div class="mb-3" v-if="!this.params.exercice_id">
        <label for="m-exercice-comptable-id">Exercice comptable id</label>
        <select class="form-select form-select-sm" id="m-exercice-comptable-id"
          :class="{ 'is-invalid': errorsData['exercice_comptable_id'] }" name="exercice_comptable_id"
          v-model="params.exercice_comptable_id">
          <option v-for="exercice in listeExerciceComptable" :value="exercice.id" :key="exercice.id">
            {{ exercice.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="m-date">Date</label>
        <input type="date" class="form-control form-control-sm" :class="{ 'is-invalid': errorsData['date'] }"
          id="m-date" name="date" v-model="params.date" />
      </div>
      <div class="mb-3" v-if="this.mode === 'genererDecompteAnnuel'">
        <label>Sélection des écritures</label>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ecritures-exercice"
            v-model="params.ecrituresExercice">
          <label class="form-check-label" for="ecritures-exercice">Exercices</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ecritures-intervention"
            v-model="params.ecrituresIntervention">
          <label class="form-check-label" for="ecritures-intervention">Interventions</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ecritures-divers"
            v-model="params.ecrituresDivers">
          <label class="form-check-label" for="ecritures-divers">Ecritures diverses</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ecritures-annuel"
            v-model="params.ecrituresAnnuel">
          <label class="form-check-label" for="ecritures-annuel">Indemnités et frais annuels</label>
        </div>
      </div>
      <div class="mb-3" v-if="this.params.exercice_id">
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="m-sap-cotisation_avs" v-model="params.deduction" />
          <label class="form-check-label" for="m-sap-cotisation_avs">Déduction</label>
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
  props: ['data', 'callback'],
  data() {
    return {
      errorsData: {},
      mode: 'genererDecompte',
      params: {
        date: new Date().toJSON().slice(0, 10),
        designation: '',
        exercice_comptable_id: null,
        sapeur_id: null,
        exercice_id: null,
        deduction: false,

        // Types d'écritures
        ecrituresExercice: true,
        ecrituresIntervention: true,
        ecrituresDivers: true,
        ecrituresAnnuel: true,
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
    sapeur(id) {
      return ``;
    },
    creer() {
      this.$store
        .dispatch(this.mode, this.params)
        .then(() => {
          (this.callback() ?? Promise.resolve())
            .then((close) => {
              if (close ?? true) {
                this.HIDE_MODAL();
              }
            });
        })
        .catch((errors) => {
          this.errorsData = errors;
          console.log(errors)
          this.$awn.alert(errors?.message ?? "Erreur lors de la création du décompte");
        });
    },
  },
};
</script>

<style scoped>
</style>
