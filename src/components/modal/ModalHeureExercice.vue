<template>
  <div>
    <div class="modal-header">
      <h5
        class="modal-title"
        id="exampleModalLabel"
      >{{ activeHeure.id ? 'Modifier' : 'Ajouter' }} une catégorie d'exercice</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeHeure.designation"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="montant">Montant</label>
        <input
          type="text"
          v-model="activeHeure.montant"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['montant'] }"
          id="montant"
        />
      </div>
      <base-select
        class="mb-3"
        valueKey="id"
        label="Unité"
        displayKey="unite"
        baseOption="&lt;Unité&gt;"
        :options="unites"
        v-model="activeHeure.type_unite_id"
        :select-class="{ 'is-invalid': errors['type_unite_id'] }"
      />
      <base-select
        class="mb-3"
        valueKey="id"
        label="Compte"
        displayKey="designation"
        baseOption="&lt;Compte&gt;"
        :options="comptes"
        v-model="activeHeure.compte_id"
        :select-class="{ 'is-invalid': errors['compte_id'] }"
      />
      <base-select
        class="mb-3"
        valueKey="id"
        label="Ecriture catégorie"
        displayKey="designation"
        baseOption="&lt;Catégorie&gt;"
        :options="categories"
        v-model="activeHeure.ecriture_categorie_id"
        :select-class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
      />
      <base-select
        class="mb-3"
        valueKey="id"
        label="Type"
        displayKey="label"
        :options="[
          // { id: 0, label: 'Autre' },
          { id: 1, label: 'Solde' },
          { id: 2, label: 'Indemnité' },
          // { id: 3, label: 'Frais forfaitaire' },
          // { id: 4, label: 'Frais effectif' },
          // { id: 5, label: 'Charges AVS/AC' },
        ]"
        v-model="activeHeure.type"
        :select-class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="save()"
      >{{ activeHeure.id ? 'Modifier' : 'Ajouter' }}</button>
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
