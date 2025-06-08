<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeMateriel.id ? 'Modifier' : 'Ajouter' }} du matériel
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeMateriel.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeMateriel.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="forfait">Forfait</label>
        <input
          id="forfait"
          v-model="activeMateriel.forfait"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['forfait'] }"
        />
      </div>
      <div class="mb-3">
        <label for="unite">Unité</label>
        <input
          id="unite"
          v-model="activeMateriel.unite"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['unite'] }"
        />
      </div>
      <base-select
        v-model="activeMateriel.type_unite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité type"
        base-option="-"
        :base-value="0"
        display-key="unite"
        :options="unites"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="materiel-status-modal"
            v-model="activeMateriel.statut"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
            :false-value="0"
          />
          <label class="form-check-label" for="materiel-status-modal"
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
        {{ activeMateriel.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalMaterielIntervention',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeMateriel: {
        statut: 1,
      },
    };
  },
  computed: {
    ...mapState({
      unites: (state) => state.unite.liste,
    }),
  },
  mounted() {
    this.activeMateriel = {
      ...this.activeMateriel,
      ...this.data,
    };
    if (this.data.type_unite_id === null) {
      this.activeMateriel.type_unite_id = 0;
    }
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    localite(localite) {
      return localite?.designation;
    },
    async save() {
      if ((this.activeMateriel.id || 0) === 0) {
        this.$store
          .dispatch('addMateriel', this.activeMateriel)
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
          .dispatch('updateMateriel', this.activeMateriel)
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

<style scoped></style>
