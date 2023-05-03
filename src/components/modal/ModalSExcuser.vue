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
        :options="excuseTypes"
        label="Excuse type"
      />
      <div class="mb-3">
        <label for="remarque">Raison</label>
        <input
          id="remarque"
          v-model="activeExcuse.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
      <div class="mb-3">
        <label>Justificatif</label>
        <input
          ref="file-justificatif"
          type="file"
          class="form-control form-control-sm"
          accept="application/pdf"
          @change="onFileChange"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-primary" @click="validate">Valider</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'ModalSExcuser',
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
      activeExcuse: {
        remarque: '',
        excuse_type_id: null,
        excuse_statut: 0,
        justification: '',
        justificatif_file: null,
      },
    };
  },
  computed: {
    ...mapState({
      excuseTypes: (state) =>
        state.excuseType.liste.filter((e) => e.statut == 1),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
  },
  mounted() {
    this.activeExcuse = {
      remarque: this.data?.remarque ?? '',
      exercice_id: this.data?.exercice_id ?? 0,
      justification: this.data?.justification ?? 0,
      excuse_type_id: this.data?.excuse_type_id ?? 0,
      justificatif_file: null,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      this.activeExcuse.justificatif_file = files[0];
    },
    validate() {
      this.$store
        .dispatch('addMonExcuse', this.activeExcuse)
        .then(() => {
          this.$awn.success('Excuse enregistrée');
          this.HIDE_MODAL();
        })
        .catch((err) => {
          this.$awn.alert(
            err?.message ?? "Erreur lors de la création de l'excuse"
          );
        });
    },
    close() {
      this.HIDE_MODAL();
      this.$awn.warning('Excuse non enregistrée');
    },
  },
};
</script>

<style scoped></style>
