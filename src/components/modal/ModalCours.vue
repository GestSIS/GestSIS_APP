<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeCours.id ? 'Modifier' : 'Ajouter' }} un cours
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeCours.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          id="abreviation"
          v-model="activeCours.abreviation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeCours.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="duree">Durée</label>
        <div class="input-group">
          <input
            id="duree"
            v-model="activeCours.duree"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['duree'] }"
          />
          <span class="input-group-text">jours</span>
        </div>
      </div>
      <base-select
        v-model="activeCours.precedent_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['precedent_id'] }"
        :options="cours"
        label="Cours précédent"
        base-option="-"
        :base-value="null"
      />
      <base-select
        v-model="activeCours.grade_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['grade_id'] }"
        :options="grades"
        label="Graden"
        base-option="-"
        :base-value="null"
      />
      <base-select
        v-model="activeCours.fonction_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['fonction_id'] }"
        :options="fonctions"
        display-key="nom"
        label="Fonction"
        base-option="-"
        :base-value="null"
      />
      <div class="mb-3">
        <label for="validite_debut">Validité début</label>
        <input
          id="validite_debut"
          v-model="activeCours.validite_debut"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite_debut'] }"
        />
      </div>
      <div class="mb-3">
        <label for="validite_fin">Validité fin</label>
        <input
          id="validite_fin"
          v-model="activeCours.validite_fin"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite_fin'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeCours.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalCours',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeCours: {
        actif: 1,
        abreviation: '',
      },
    };
  },
  computed: {
    ...mapState({
      grades: (state) => state.grade.liste,
      fonctions: (state) => state.fonction.liste.filter((f) => f.actif),
      cours: (state) => state.cours.liste,
    }),
  },
  mounted() {
    this.activeCours = {
      ...this.activeCours,
      ...this.data,
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    localite(localite) {
      return localite?.designation;
    },
    async save() {
      const action = this.activeCours?.id ? 'updateCours' : 'addCours';
      this.$store
        .dispatch(action, this.activeCours)
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
