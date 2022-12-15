<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeHeure.id ? 'Modifier' : 'Ajouter' }} une heure additionelle
        pour exercice
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeHeure.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="montant">Montant</label>
        <input
          id="montant"
          v-model="activeHeure.montant"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['montant'] }"
        />
      </div>
      <base-select
        v-model="activeHeure.type_unite_id"
        class="mb-3"
        label="Unité"
        display-key="unite"
        base-option="&lt;Unité&gt;"
        :options="unites"
        :select-class="{ 'is-invalid': errors['type_unite_id'] }"
      />
      <base-select
        v-model="activeHeure.compte_id"
        class="mb-3"
        label="Compte"
        base-option="&lt;Compte&gt;"
        :options="comptes"
        :select-class="{ 'is-invalid': errors['compte_id'] }"
      />
      <base-select
        v-model="activeHeure.ecriture_categorie_id"
        class="mb-3"
        label="Ecriture catégorie"
        base-option="&lt;Catégorie&gt;"
        :options="categories"
        :select-class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
      />
      <base-select
        v-model="activeHeure.type"
        class="mb-3"
        label="Type"
        :options="[
          // { id: 0, designation: 'Autre' },
          { id: 1, designation: 'Solde' },
          { id: 2, designation: 'Indemnité' },
          // { id: 3, designation: 'Frais forfaitaire' },
          // { id: 4, designation: 'Frais effectif' },
          // { id: 5, designation: 'Charges AVS/AC' },
        ]"
        :select-class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeHeure.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalExerciceHeure',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeHeure: {},
    };
  },
  computed: {
    ...mapState({
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
  },
  mounted() {
    this.activeHeure = {
      ...this.activeHeure,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.activeHeure.id || 0) === 0) {
        this.$store
          .dispatch('addExerciceHeure', this.activeHeure)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
              })
          );
      } else {
        this.$store
          .dispatch('updateExerciceHeure', this.activeHeure)
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
