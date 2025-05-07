<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeAbsence?.id ? 'Modifier' : 'Ajouter' }} une absence
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Départ</label>
        <input
          id="debut"
          v-model="activeAbsence.debut"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
        <div v-if="errors['debut']" class="invalid-feedback">Date invalide</div>
      </div>
      <div class="mb-3">
        <label for="cours-date">Retour</label>
        <input
          id="cours-date"
          v-model="activeAbsence.fin"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
        <div v-if="errors['fin']" class="invalid-feedback">Date invalide</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeAbsence?.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModAbsence',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeAbsence: {},
    };
  },
  mounted() {
    this.activeAbsence = {
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, {
      SHOW_MODAL: 'showModal',
      HIDE_MODAL: 'closeModal',
    }),
    async save() {
      const action = this.activeAbsence?.id
        ? 'editMonAbsence'
        : 'addMonAbsence';
      this.$store
        .dispatch(action, this.activeAbsence)
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = errors;
          this.$awn.alert(
            errors?.message ?? "Impossible d'ajouter cette absence",
          );
        });
    },
  },
};
</script>

<style scoped></style>
