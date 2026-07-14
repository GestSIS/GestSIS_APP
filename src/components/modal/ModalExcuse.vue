<script setup>
import { computed, reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useExcuseTypeStore } from '../../stores/exercice/ExcuseType.js';
import permissions from '/src/composables/permissions.js';
import useHasPermission from '../../composables/usePermission.js';

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

const errors = ref({});
const form = reactive({
  remarque: '',
  excuse_type_id: null,
  excuse_statut: 0,
  justification: '',
  ...data,
});

const excuseTypeStore = useExcuseTypeStore();
const listeExcuseTypes = computed(() => excuseTypeStore.liste);
const hasValidationPermission = useHasPermission(
  permissions.EXERCICE.VALIDATION,
);

const { closeModal } = useModalStore();

const onFileChange = (event) => {
  const files = event.target.files || event.dataTransfer.files;
  if (!files.length) return;
  form.justificatif_file = files[0];
};
const close = () => {
  (callback(null) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};

const save = () => {
  (callback(form) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Sélectionner une excuse</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.excuse_type_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['excuse_type_id'] }"
        :options="listeExcuseTypes"
        label="Excuse type"
      />
      <div class="mb-3">
        <label for="remarque">Raison <em>(optionnel)</em></label>
        <input
          id="remarque"
          v-model="form.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
      <div class="mb-3">
        <label>Justificatif <em>(optionnel)</em></label>
        <input
          ref="file-justificatif"
          type="file"
          class="form-control form-control-sm"
          accept="application/pdf"
          @change="onFileChange"
        />
      </div>
      <base-select
        v-if="hasValidationPermission"
        v-model="form.excuse_statut"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['excuse_type_id'] }"
        :options="[
          { designation: 'Amendée', id: -2 },
          { designation: 'Refusée', id: -1 },
          { designation: 'A traiter', id: 0 },
          { designation: 'Validée', id: 1 },
        ]"
        label="Statut"
      />
      <div v-if="hasValidationPermission" class="mb-3">
        <label for="justification"
          >Justification de la décision <em>(optionnel)</em></label
        >
        <input
          id="justification"
          v-model="form.justification"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['justification'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn btn-outline-primary">Valider</button>
      <button type="button" class="btn btn-outline-secondary" @click="close">
        Annuler
      </button>
    </div>
  </form>
</template>
