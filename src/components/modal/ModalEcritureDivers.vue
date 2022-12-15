<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        {{ activeEcriture.id ? 'Modifier' : 'Ajouter' }} une écriture
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeEcriture.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>

      <base-select
        v-model="activeEcriture.sapeur_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['sapeur_id'] }"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
      />
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="activeEcriture.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <base-select
        v-model="activeEcriture.type_unite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité"
        display-key="unite"
        :options="unites"
      />
      <div class="row">
        <div v-if="activeUnite?.comptable" class="mb-3 col-4">
          <label for="quantite">Quantité</label>
          <div class="input-group input-group-sm">
            <input
              id="quantite"
              v-model="activeEcriture.quantite"
              type="string"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
            />
            <span class="input-group-text">{{ activeUnite.abreviation }}</span>
          </div>
        </div>
        <div
          class="mb-3 col-4"
          :class="activeUnite?.comptable ? 'col-4' : 'col-12'"
        >
          <label for="tarif">Tarif</label>
          <div class="input-group input-group-sm">
            <input
              id="tarif"
              v-model="activeEcriture.tarif"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
            />
            <span class="input-group-text">CHF</span>
          </div>
        </div>
        <div
          v-if="activeUnite?.comptable"
          class="mb-3 col-4"
          :class="activeUnite?.comptable ? 'col-4' : 'col-12'"
        >
          <label for="tarif">Total</label>
          <div class="input-group input-group-sm">
            <input
              id="tarif"
              type="text"
              readonly
              :value="activeEcriture?.quantite * activeEcriture?.tarif || 0"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
            />
            <span class="input-group-text">CHF</span>
          </div>
        </div>
      </div>
      <base-select
        v-model="activeEcriture.compte_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['compte_id'] }"
        label="Compte"
        display-key="label"
        :options="comptes"
      />
      <base-select
        v-model="activeEcriture.ecriture_type"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_type'] }"
        label="Type d'écriture"
        :options="types"
      />
      <base-select
        v-model="activeEcriture.ecriture_categorie_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        label="Catégorie d'écriture"
        :options="categories"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeEcriture.id ? 'Modifier' : 'Ajouter' }}
      </button>
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
      default: () => {},
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
        module: 0,
      },
      types: [
        { id: 0, designation: 'Autre' },
        { id: 1, designation: 'Solde' },
        { id: 2, designation: 'Indemnité' },
        { id: 3, designation: 'Frais forfaitaire' },
        { id: 4, designation: 'Frais effectif' },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste.filter((s) => s.actif),
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    activeCompteType() {
      return this.comptes.find((c) => c.id == this.activeEcriture.compte_id);
    },
    activeUnite() {
      return this.unites.find((u) => u.id == this.activeEcriture.type_unite_id);
    },
  },
  mounted() {
    this.activeEcriture = {
      ...this.activeEcriture,
      exercice_comptable_id: this.activeExerciceComptableId,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      //TODO: validate input

      if (!this.activeUnite?.comptable) {
        this.activeEcriture.quantite = 1;
      }
      this.activeEcriture.total =
        this.activeEcriture?.tarif * this.activeEcriture?.quantite;

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
