<script setup>
import { computed, ref } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useDecompteStore } from '../../stores/comptabilite/Decompte.js';

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const config = ref({
  errors: {},
  mode: 'genererDecompte',
});
const params = ref({
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
});

const decompteStore = useDecompteStore();
const exerciceComptableStore = useExerciceComptableStore();
const listeExerciceComptable = computed(() => exerciceComptableStore.liste);
const activeExerciceComptableId = computed(
  () => exerciceComptableStore.activeId,
);

if (data.remount) {
  config.value = data.state.config;
  params.value = data.state.params;
} else {
  params.value.exercice_comptable_id = activeExerciceComptableId;
  params.value.sapeur_id = data?.sapeurId;
  params.value.exercice_id = data?.exerciceId;
  params.value.designation = `Décompte ${data?.designation ?? ''}`;

  config.value.mode = params.value.sapeur_id
    ? 'sapeur'
    : params.value.exercice_id
      ? 'exercice'
      : 'annuel';
}

const { closeModal, showModal } = useModalStore();
const awn = useNotification();

const creer = () => {
  showModal({ component: 'ModalChargement' });
  const action =
    config.value.mode === 'sapeur'
      ? decompteStore.genererDecompteSapeur
      : config.value.mode === 'exercice'
        ? decompteStore.genererDecompteExercice
        : decompteStore.genererDecompteAnnuel;
  action(params.value)
    .then(() => {
      (callback() ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          closeModal();
        }
      });
    })
    .catch((err) => {
      closeModal();
      config.value.errors = err;
      awn.alert(err?.message ?? 'Erreur lors de la création du décompte');
    });
};

const select = () => {
  const save = {
    callback,
    data: {
      ...data,
      remount: true,
      state: { config: { ...config.value }, params: { ...params.value } },
    },
  };
  showModal({
    component: 'ModalSapeurSelect',
    size: 1,
    callback: (res) => {
      if (res) {
        save.data.state.params.sapeurIds = res.tous;
      }
      showModal({
        component: 'ModalDecompte',
        callback: save.callback,
        data: save.data,
      });
      return Promise.resolve(false);
    },
    data: {
      ids: params.value.sapeurIds.slice(0),
    },
  });
};

const resetSelection = () => {
  params.value.sapeurIds = [];
};
</script>

<template>
  <form @submit.prevent="creer">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Paramètres pour le décompte
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="m-designation">Désignation</label>
        <input
          id="m-designation"
          v-model="params.designation"
          required
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
        :required="true"
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
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': config.errors['date'] }"
          name="date"
        />
      </div>
      <div v-if="config.mode === 'annuel'" class="mb-3">
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
          <button type="button" class="btn btn-outline-primary" @click="select">
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
          <button
            type="button"
            class="btn btn-outline-danger"
            @click="resetSelection"
          >
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
      <button type="submit" class="btn btn-primary">Créer</button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="closeModal"
      >
        Annuler
      </button>
    </div>
  </form>
</template>
