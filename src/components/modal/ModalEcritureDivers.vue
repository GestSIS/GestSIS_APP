<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ activeEcriture.id ? 'Modifier' : 'Ajouter' }} une écriture</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeEcriture.designation"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="sapeur">Sapeur</label>
        <select
          id="sapeur"
          v-model="activeEcriture.sapeur_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['sapeur_id'] }"
        >
          <option v-for="s in sapeurs" :key="s.id" :value="s.id">{{ s.nom }} {{ s.prenom }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          type="date"
          v-model="activeEcriture.date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
          id="date"
        />
      </div>
      <div class="mb-3 col-12">
        <label for="unite">Unité</label>
        <select
          id="unite"
          v-model="activeEcriture.type_unite_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option v-for="u in unites" :key="u.id" :value="u.id">{{ u.unite }}</option>
        </select>
      </div>
      <div class="row">
        <div class="mb-3 col-4" v-if="activeUnite?.comptable">
          <label for="quantite">Quantité</label>
          <div class="input-group input-group-sm">
            <input
              type="string"
              v-model="activeEcriture.quantite"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
              id="quantite"
            />
            <span class="input-group-text">{{ activeUnite.abreviation }}</span>
          </div>
        </div>
        <div class="mb-3 col-4" :class="activeUnite?.comptable ? 'col-4' : 'col-12'">
          <label for="tarif">Tarif</label>
          <div class="input-group input-group-sm">
            <input
              type="text"
              v-model="activeEcriture.tarif"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
              id="tarif"
            />
            <span class="input-group-text">CHF</span>
          </div>
        </div>
        <div
          class="mb-3 col-4"
          :class="activeUnite?.comptable ? 'col-4' : 'col-12'"
          v-if="activeUnite?.comptable"
        >
          <label for="tarif">Total</label>
          <div class="input-group input-group-sm">
            <input
              type="text"
              readonly
              :value="(activeEcriture?.quantite * activeEcriture?.tarif) || 0"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
              id="tarif"
            />
            <span class="input-group-text">CHF</span>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeEcriture.compte_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in comptes" :key="c.id" :value="c.id">{{ c.numero }} {{ c.designation }}</option>
        </select>
      </div>
      <div class="mb-3" v-if="!activeCompteType?.actif">
        <label for="ecriture_type">Type d'écriture</label>
        <select
          id="ecriture_type"
          v-model="activeEcriture.ecriture_type"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['ecriture_type'] }"
        >
          <option v-for="s in types" :key="s.id" :value="s.id">{{ s.designation }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="categorie">Catégorie d'écriture</label>
        <select
          id="categorie"
          v-model="activeEcriture.ecriture_categorie_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        >
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.designation }}</option>
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
        quantite: 0,
        tarif: 0,
        type_unite_id: 1,
        type: 0,
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
      ...this.activeEcriture,
      exercice_comptable_id: this.activeExerciceComptableId,
      ...this.data,
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste.filter(s => s.actif),
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    activeCompteType() {
      return this.comptes.find(c => c.id == this.activeEcriture.compte_id);
    },
    activeUnite() {
      return this.unites.find(u => u.id == this.activeEcriture.type_unite_id);
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      //TODO: validate input

      if (!this.activeUnite?.comptable) {
        this.activeEcriture.quantite = 1;
      }
      this.activeEcriture.total = this.activeEcriture?.tarif * this.activeEcriture?.quantite;

      // { id: 1, designation: 'Indemnité' },
      // { id: 2, designation: 'Solde' },
      // { id: 3, designation: 'Frais' },
      if (!this.activeCompteType.actif) {
        this.activeEcriture.indemnite = this.activeEcriture.ecriture_type == 1 ? this.activeEcriture?.total : 0;
        this.activeEcriture.solde = this.activeEcriture.ecriture_type == 2 ? this.activeEcriture?.total : 0;
        this.activeEcriture.frais = this.activeEcriture.ecriture_type == 3 ? this.activeEcriture?.total : 0;
      } else {
        this.activeEcriture.indemnite = 0;
        this.activeEcriture.solde = 0;
        this.activeEcriture.frais = 0;
      }

      if ((this.activeEcriture.id || 0) === 0) {
        this.$store
          .dispatch('addEcriture', this.activeEcriture)
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
          .dispatch('updateEcriture', this.activeEcriture)
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
