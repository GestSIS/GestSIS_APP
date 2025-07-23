<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
        {{
          active.type == 'frais' ? 'un frais annuel' : 'une indemnité annuelle'
        }}
        type
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="active.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <base-select
        v-model="active.type"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['type'] }"
        label="Type"
        :options="[
          { id: 2, designation: 'Indemnité' },
          { id: 3, designation: 'Frais forfaitaire' },
        ]"
      />
      <base-select
        v-model="active.compte_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['compte_id'] }"
        label="Compte"
        display-key="label"
        :options="listeCompte"
      />
      <base-select
        v-model="active.ecriture_categorie_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        label="Catégorie comptable"
        :options="listeCategorie"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-actif-modal"
            v-model="active.cumulable"
            required
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-actif-modal"
            >Cumulable</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalIndemniteFraisAnnuelType',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      active: {},
    };
  },
  computed: {
    ...mapState({
      listeFonction: (state) => state.fonction.liste,
      listeCompte: (state) => state.compte.liste,
      listeUnite: (state) => state.unite.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
    }),
  },
  mounted() {
    this.active = {
      ...this.active,
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, { closeModal: 'closeModal' }),
    async save() {
      const action = this.active?.id
        ? 'updateFraisIndemniteAnnuelType'
        : 'addFraisIndemniteAnnuelType';
      this.$store
        .dispatch(action, this.active)
        .then(() => {
          this.errors = {};
          this.closeModal();
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
