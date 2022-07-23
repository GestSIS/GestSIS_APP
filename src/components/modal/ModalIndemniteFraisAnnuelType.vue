<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
        {{
          active.type == 'frais' ? 'un frais annuel' : 'une indemnité annuelle'
        }}
        type
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="active.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="compte">Type</label>
        <select
          id="type"
          v-model="active.type"
          class="form-select form-select-sm"
        >
          <option :value="2">Indemnité</option>
          <option :value="3">Frais forfaitaire</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="compte">Compte</label>
        <select
          id="compte"
          v-model="active.compte_id"
          class="form-select form-select-sm"
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
          v-model="active.ecriture_categorie_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        >
          <option v-for="c in listeCategorie" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-actif-modal"
            v-model="active.cumulable"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-actif-modal"
            >Cumulable</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalIndemniteFraisAnnuelType',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      active: {},
    };
  },
  mounted() {
    this.active = {
      ...this.active,
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
    async save() {
      //Format back dates to SQL Format
      if ((this.active.id || 0) === 0) {
        this.$store
          .dispatch('addFraisIndemniteAnnuelType', this.active)
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
          .dispatch('updateFraisIndemniteAnnuelType', this.active)
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
