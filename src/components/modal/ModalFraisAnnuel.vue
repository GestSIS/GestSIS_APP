<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeFrais.id ? 'Modifier' : 'Ajouter' }} un frais annuel
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
          v-model="activeFrais.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="form-group">
        <label for="fonction">Indemnite</label>
        <select
          id="fonction"
          v-model="activeFrais.fonction_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['fonction_id'] }"
        >
          <option v-for="f in listeFonction" :key="f.id" :value="f.id">
            {{ f.nom }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="montant">Montant</label>
        <input
          type="text"
          v-model="activeFrais.montant"
          class="form-control"
          :class="{ 'is-invalid': errors['montant'] }"
          id="montant"
        />
      </div>
      <div class="form-group">
        <label for="quantite">Quantité</label>
        <input
          type="text"
          v-model="activeFrais.quantite"
          class="form-control"
          :class="{ 'is-invalid': errors['quantite'] }"
          id="quantite"
        />
      </div>
      <div class="form-group">
        <label for="unite">Unité</label>
        <select
          id="unite"
          v-model="activeFrais.type_unite_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option v-for="u in listeUnite" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeFrais.compte_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in listeCompte" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="categorie">Catégorie d'écriture</label>
        <select
          id="categorie"
          v-model="activeFrais.ecriture_categorie_id"
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
        {{ activeFrais.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalFraisAnnuel',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeFrais: {},
    };
  },
  mounted() {
    this.activeFrais = {
      ...this.activeFrais,
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
      //Format back dates to SQL Format
      if ((this.activeFrais.id || 0) === 0) {
        this.$store
          .dispatch('addFraisAnnuel', this.activeFrais)
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
          .dispatch('updateFraisAnnuel', this.activeFrais)
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
