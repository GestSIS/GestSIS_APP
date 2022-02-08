<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ activeEcriture.id ? 'Modifier' : 'Ajouter' }} une écriture</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      'designation',
      'total',
      'tarif',
      'type_unite_id',
      'quantite',
      <!-- 'solde_min',
      'solde_min_pour',
      'taux',-->
      'solde',
      'indemnite',
      'frais',
      'date',
      'sapeur_id',
      'compte_id',
      'exercice_comptable_id',
      'decompte_id',
      'ecriture_categorie_id',
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeEcriture.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          type="text"
          v-model="activeEcriture.date"
          class="form-control"
          :class="{ 'is-invalid': errors['date'] }"
          id="date"
        />
      </div>
      <div class="row">
        <div class="mb-3 col-4">
          <label for="tarif">Tarif</label>
          <input
            type="text"
            v-model="activeEcriture.tarif"
            class="form-control"
            :class="{ 'is-invalid': errors['tarif'] }"
            id="tarif"
          />
        </div>
        <div class="mb-3 col-4">
          <label for="quantite">Quantité</label>
          <input
            type="text"
            v-model="activeEcriture.quantite"
            class="form-control"
            :class="{ 'is-invalid': errors['tarif'] }"
            id="quantite"
          />
        </div>
        <div class="mb-3 col-6">
          <label for="unite">Unité</label>
          <select
            id="unite"
            v-model="activeEcriture.type_unite_id"
            class="form-select"
            :class="{ 'is-invalid': errors['type_unite_id'] }"
          >
            <option v-for="u in unites" :key="u.id" :value="u.id">{{ u.unite }}</option>
          </select>
        </div>
      </div>
      <div class="mb-3">
        <label for="ecriture_type">Type d'écriture</label>
        <select
          id="ecriture_type"
          v-model="activeEcriture.ecriture_type"
          class="form-select"
          :class="{ 'is-invalid': errors['ecriture_type'] }"
        >
          <option v-for="s in types" :key="s.id" :value="s.id">{{ s.designation }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="sapeur">Sapeur</label>
        <select
          id="sapeur"
          v-model="activeEcriture.sapeur_id"
          class="form-select"
          :class="{ 'is-invalid': errors['sapeur_id'] }"
        >
          <option v-for="s in sapeurs" :key="s.id" :value="s.id">{{ s.nom }} {{ s.prenom }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeEcriture.compte_id"
          class="form-select"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in comptes" :key="c.id" :value="c.id">{{ c.designation }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="categorie">Catégorie d'écriture</label>
        <select
          id="categorie"
          v-model="activeEcriture.ecriture_categorie_id"
          class="form-select"
          :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        >
          <option v-for="c in listeCategorie" :key="c.id" :value="c.id">{{ c.designation }}</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="save()"
      >{{ activeEcriture.id ? 'Modifier' : 'Ajouter' }}</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalEcritureDivers',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeEcriture: {
        ecriture_type: 1,
      },
      types: [
        { id: 1, designation: 'Indemnité' },
        { id: 2, designation: 'Solde' },
        { id: 3, designation: 'Frais' },
      ]
    };
  },
  mounted() {
    this.activeEcriture = {
      ...this.data,
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.activeEcriture.id || 0) === 0) {
        this.$store
          .dispatch('addEcritureDivers', this.activeEcriture)
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
          .dispatch('updateEcritureDivers', this.activeEcriture)
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
