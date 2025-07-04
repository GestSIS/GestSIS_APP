<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter un groupe</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="abreviation">No</label>
        <input
          id="no"
          v-model="groupe.no"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['no'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Nom</label>
        <input
          id="designation"
          v-model="groupe.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <base-select
        v-model="groupe.parent_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['parent_id'] }"
        label="Groupe parent"
        base-option="-"
        :base-value="null"
        display-key="label"
        :options="groupes"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="modal-type"
            v-model="groupe.type"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
            :false-value="0"
          />
          <label class="form-check-label" for="modal-type"
            >Groupe d'alarme</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Ajouter
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalGroupe',
  data() {
    return {
      errors: {},
      groupe: {
        parent_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      groupes: (state) =>
        state.groupe.liste.map((g) => ({
          ...g,
          label: (g.no ? g.no + ' ' : '') + g.designation,
        })),
    }),
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      this.$store
        .dispatch('createGroupe', this.groupe)
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
    },
  },
};
</script>
