<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
        {{
          active.type == 'frais' ? 'un frais annuel' : 'une indemnité annuelle'
        }}
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="fonction">Fonction</label>
        <select
          id="fonction"
          :value="active.fonction_id"
          disabled
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
          v-model="active.montant"
          class="form-control"
          :class="{ 'is-invalid': errors['montant'] }"
          id="montant"
        />
      </div>
      <div class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          type="text"
          v-model="active.quantite"
          class="form-control"
          :class="{ 'is-invalid': errors['quantite'] }"
          id="quantite"
        />
      </div>
      <div class="mb-3">
        <label for="unite">Unité</label>
        <select
          id="unite"
          v-model="active.type_unite_id"
          class="form-select"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option v-for="u in unites" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
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
  name: 'ModalIndemniteFraisAnnuel',
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
      unites: (state) => state.unite.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      //Format back dates to SQL Format
      if ((this.active.id || 0) === 0) {
        const action =
          this.active.type == 'frais' ? 'addFraisAnnuel' : 'addIndemniteAnnuel';
        this.$store
          .dispatch(action, this.active)
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
        const action =
          this.active.type == 'frais'
            ? 'updateFraisAnnuel'
            : 'updateIndemniteAnnuel';
        this.$store
          .dispatch(action, this.active)
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
