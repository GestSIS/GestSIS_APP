<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Sélectionner une excuse
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="activeExcuse.excuse_type_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['excuse_type_id'] }"
        :options="listeExcuseTypes"
        label="Excuse type"
      />
      <div class="mb-3">
        <label for="raison">Raison <em>(optionnel)</em></label>
        <input
          id="raison"
          v-model="activeExcuse.raison"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['raison'] }"
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
        v-model="activeExcuse.statut"
        class="mb-3"
        :class="{ 'is-invalid': errors['excuse_type_id'] }"
        :options="[
          { designation: 'Refusé', id: -1 },
          { designation: 'A traiter', id: 0 },
          { designation: 'Validé', id: 1 },
        ]"
        label="Statut"
      />
      <div v-if="hasValidationPermission" class="mb-3">
        <label for="justification"
          >Justification de la décision <em>(optionnel)</em></label
        >
        <input
          id="justification"
          v-model="activeExcuse.justification"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['justification'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-primary" @click="close">Valider</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'ModalExcuse',
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeExcuse: {
        raison: '',
        excuse_type_id: null,
        statut: 0,
        justification: '',
      },
    };
  },
  computed: {
    ...mapState({
      listeExcuseTypes: (state) => state.excuseType.liste,
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    selectExcuseType(excuseTypeId) {
      (this.callback(excuseTypeId) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    close() {
      (this.callback(null) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
  },
};
</script>

<style scoped></style>
