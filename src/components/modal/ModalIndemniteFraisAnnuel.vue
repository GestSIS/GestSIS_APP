<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
        {{
          active.type == 'frais' ? 'un frais annuel' : 'une indemnité annuelle'
        }}
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="active.fonction_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['fonction_id'] }"
        label="Fonction"
        display-key="nom"
        :options="listeFonction"
        disabled
      />
      <div class="mb-3">
        <label for="montant">Montant</label>
        <input
          required
          id="montant"
          v-model="active.montant"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['montant'] }"
        />
      </div>
      <div class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          required
          id="quantite"
          v-model="active.quantite"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
        />
      </div>
      <base-select
        :required="true"
        v-model="active.type_unite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité"
        display-key="unite"
        :options="unites"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
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
  name: 'ModalIndemniteFraisAnnuel',
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
      unites: (state) => state.unite.liste,
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
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      const action = this.active?.id
        ? 'updateFraisIndemniteAnnuel'
        : 'addFraisIndemniteAnnuel';
      this.$store
        .dispatch(action, this.active)
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

<style scoped></style>
