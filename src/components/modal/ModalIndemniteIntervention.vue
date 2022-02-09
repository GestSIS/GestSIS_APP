<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }} une indemnité pour
        intervention
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeIndemnite.designation"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="solde">Solde</label>
        <input
          type="text"
          v-model="activeIndemnite.solde"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['solde'] }"
          id="solde"
        />
      </div>
      <div class="mb-3">
        <label class="d-block">Type d'imputation</label>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="solde-min"
            id="solde-min"
            value="solde-min"
            v-model="imputationType"
          />
          <label class="form-check-label" for="solde-min">Solde min</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="taux"
            id="taux"
            value="taux"
            v-model="imputationType"
          />
          <label class="form-check-label" for="taux">Taux week-end et taux nuit</label>
        </div>
      </div>
      <div class="container-fluid">
        <div class="row" v-if="imputationType != 'taux'">
          <div class="mb-3 col-3">
            <label for="solde_min">Solde min</label>
            <input
              type="text"
              v-model="activeIndemnite.solde_min"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['solde_min'] }"
              id="solde_min"
            />
          </div>
          <div class="mb-3 col-2">
            <label for="solde_min_pour">Pour</label>
            <input
              type="text"
              v-model="activeIndemnite.solde_min_pour"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['solde_min_pour'] }"
              id="solde_min_pour"
            />
          </div>
          <div class="mb-3 col-7">
            <label for="unite">Unité</label>
            <select
              id="unite"
              v-model="activeIndemnite.type_unite_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['type_unite_id'] }"
            >
              <option v-for="u in listeUnite" :key="u.id" :value="u.id">{{ u.unite }}</option>
            </select>
          </div>
          <div class="mb-3 col-12">
            <label for="phase_id">Solde min pour phase</label>
            <select
              id="phase_id"
              v-model="activeIndemnite.phase_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['phase_id'] }"
            >
              <option>toutes les phases</option>
              <option
                v-for="p in listePhase"
                :key="p.id"
                :value="p.id"
              >uniquement phase {{ p.designation }}</option>
            </select>
          </div>
        </div>
        <div class="row" v-if="imputationType == 'taux'">
          <div class="mb-3 col-6">
            <label for="taux_nuit">Taux nuit</label>
            <input
              type="text"
              v-model="activeIndemnite.taux_nuit"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_nuit'] }"
              id="taux_nuit"
            />
          </div>
          <div class="mb-3 col-6">
            <label for="taux_weekend">Taux weekend</label>
            <input
              type="text"
              v-model="activeIndemnite.taux_weekend"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_weekend'] }"
              id="taux_weekend"
            />
          </div>
          <div class="mb-3 col-6">
            <label for="debut">Début nuit</label>
            <input
              type="time"
              v-model="activeIndemnite.debut"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['debut'] }"
              id="debut"
            />
          </div>
          <div class="mb-3 col-6">
            <label for="fin">Fin nuit</label>
            <input
              type="time"
              v-model="activeIndemnite.fin"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['fin'] }"
              id="fin"
            />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeIndemnite.compte_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in listeCompte" :key="c.id" :value="c.id">{{ c.designation }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="categorie">Catégorie d'écriture</label>
        <select
          id="categorie"
          v-model="activeIndemnite.ecriture_categorie_id"
          class="form-select form-select-sm"
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
      >{{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }}</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalIndemniteIntervention',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeIndemnite: {
        phase_id: 0,
        par_fonction: 0,
      },
      imputationType: 1,
    };
  },
  mounted() {
    this.activeIndemnite = {
      ...this.activeIndemnite,
      ...this.data,
    };
    this.imputationType =
      this.activeIndemnite.taux_nuit || this.activeIndemnite.taux_weekend
        ? 'taux'
        : 'solde-min';
  },
  computed: {
    ...mapState({
      listeFonction: (state) => state.fonction.liste,
      listeCompte: (state) => state.compte.liste,
      listeUnite: (state) => state.unite.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
      listePhase: (state) => state.phaseType.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if (this.imputationType == 'taux') {
        this.activeIndemnite.solde_min = null;
        this.activeIndemnite.solde_min_pour = null;
        this.activeIndemnite.unite_type_id = 0;
        this.activeIndemnite.phase_id = null;
      } else {
        this.activeIndemnite.taux_nuit = null;
        this.activeIndemnite.taux_weekend = null;
        this.activeIndemnite.debut = null;
        this.activeIndemnite.fin = null;
      }

      if ((this.activeIndemnite.id || 0) === 0) {
        this.$store
          .dispatch('addIndemniteIntervention', this.activeIndemnite)
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
          .dispatch('updateIndemniteIntervention', this.activeIndemnite)
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
