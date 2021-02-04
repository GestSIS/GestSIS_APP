<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }} une indemnité pour
        intervention
      </h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeIndemnite.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="form-group">
        <label for="solde">Solde</label>
        <input
          type="text"
          v-model="activeIndemnite.solde"
          class="form-control"
          :class="{ 'is-invalid': errors['solde'] }"
          id="solde"
        />
      </div>
      <div class="form-group">
        <label for="solde_min">Solde min</label>
        <input
          type="text"
          v-model="activeIndemnite.solde_min"
          class="form-control"
          :class="{ 'is-invalid': errors['solde_min'] }"
          id="solde_min"
        />
      </div>
      <div class="form-group">
        <label for="solde_min_pour">Pour</label>
        <input
          type="text"
          v-model="activeIndemnite.solde_min_pour"
          class="form-control"
          :class="{ 'is-invalid': errors['solde_min_pour'] }"
          id="solde_min_pour"
        />
      </div>
      <div class="form-group">
        <label for="unite">Unité</label>
        <select
          id="unite"
          v-model="activeIndemnite.type_unite_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option v-for="u in listeUnite" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="taux_nuit">Taux nuit</label>
        <input
          type="text"
          v-model="activeIndemnite.taux_nuit"
          class="form-control"
          :class="{ 'is-invalid': errors['taux_nuit'] }"
          id="taux_nuit"
        />
      </div>
      <div class="form-group">
        <label for="debut">Début nuit</label>
        <input
          type="time"
          v-model="activeIndemnite.debut"
          class="form-control"
          :class="{ 'is-invalid': errors['debut'] }"
          id="debut"
        />
      </div>
      <div class="form-group">
        <label for="fin">Fin nuit</label>
        <input
          type="time"
          v-model="activeIndemnite.fin"
          class="form-control"
          :class="{ 'is-invalid': errors['fin'] }"
          id="fin"
        />
      </div>
      <div class="form-group">
        <label for="taux_weekend">Taux weekend</label>
        <input
          type="text"
          v-model="activeIndemnite.taux_weekend"
          class="form-control"
          :class="{ 'is-invalid': errors['taux_weekend'] }"
          id="taux_weekend"
        />
      </div>
      <div class="form-group">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeIndemnite.compte_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in listeCompte" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="phase_id">Phase</label>
        <input
          type="text"
          v-model="activeIndemnite.phase_id"
          class="form-control"
          :class="{ 'is-invalid': errors['phase_id'] }"
          id="phase_id"
        />
      </div>
      <div class="form-group">
        <label for="categorie">Catégorie d'écriture</label>
        <select
          id="categorie"
          v-model="activeIndemnite.ecriture_categorie_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        >
          <option v-for="c in listeCategorie" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }}
      </button>
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
      activeIndemnite: {},
    };
  },
  mounted() {
    this.activeIndemnite = {
      ...this.activeIndemnite,
      ...this.data,
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
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
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
