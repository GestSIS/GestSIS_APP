<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeMedecin.id ? 'Modifier' : 'Ajouter' }} un médecin
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeMedecin.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="adresse">Adresse</label>
        <input
          id="adresse"
          v-model="activeMedecin.adresse"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['adresse'] }"
        />
      </div>
      <base-select
        v-model="activeMedecin.localite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="medecin-actif-modal"
            v-model="activeMedecin.actif"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
          />
          <label class="form-check-label" for="medecin-actif-modal"
            >Actif</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeMedecin.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalMedecin',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeMedecin: {
        actif: 1,
      },
    };
  },
  computed: {
    ...mapState({
      localites: (state) => state.localite.liste,
    }),
  },
  mounted() {
    this.activeMedecin = {
      ...this.activeMedecin,
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      if ((this.activeMedecin.id || 0) === 0) {
        this.$store
          .dispatch('addMedecin', this.activeMedecin)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
              }),
          );
      } else {
        this.$store
          .dispatch('updateMedecin', this.activeMedecin)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => {
            this.errors = {
              ...errors,
            };
          });
      }
    },
  },
};
</script>
