<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeIndemnite.id ? 'Modifier' : 'Ajouter' }} une indemnité annuelle
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeIndemnite.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="fonction">Indemnite</label>
        <select
          id="fonction"
          v-model="activeIndemnite.fonction_id"
          class="form-select"
          :class="{ 'is-invalid': errors['fonction_id'] }"
        >
          <option v-for="f in listeFonction" :key="f.id" :value="f.id">
            {{ f.nom }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="montant">Montant</label>
        <input
          type="text"
          v-model="activeIndemnite.montant"
          class="form-control"
          :class="{ 'is-invalid': errors['montant'] }"
          id="montant"
        />
      </div>
      <div class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          type="text"
          v-model="activeIndemnite.quantite"
          class="form-control"
          :class="{ 'is-invalid': errors['quantite'] }"
          id="quantite"
        />
      </div>
      <div class="mb-3">
        <label for="unite">Unité</label>
        <select
          id="unite"
          v-model="activeIndemnite.type_unite_id"
          class="form-select"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option v-for="u in listeUnite" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="activeIndemnite.compte_id"
          class="form-select"
          :class="{ 'is-invalid': errors['compte_id'] }"
        >
          <option v-for="c in listeCompte" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="categorie">Catégorie d'écriture</label>
        <select
          id="categorie"
          v-model="activeIndemnite.ecriture_categorie_id"
          class="form-select"
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
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalIndemniteAnnuel',
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
      //Format back dates to SQL Format
      if ((this.activeIndemnite.id || 0) === 0) {
        this.$store
          .dispatch('addIndemniteAnnuel', this.activeIndemnite)
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
          .dispatch('updateIndemniteAnnuel', this.activeIndemnite)
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
