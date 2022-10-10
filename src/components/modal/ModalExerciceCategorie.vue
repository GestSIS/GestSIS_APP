<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeCategorie.id ? 'Modifier' : 'Ajouter' }} une catégorie
        d'exercice
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeCategorie.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeCategorie.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="duree_base">Durée standard</label>
        <input
          id="duree_base"
          v-model="activeCategorie.duree_base"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['duree_base'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="amendable-modal"
            v-model="activeCategorie.amendable"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="amendable-modal"
            >Amendable</label
          >
        </div>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="status-modal"
            v-model="activeCategorie.statut"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
          />
          <label class="form-check-label" for="status-modal">Actif</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeCategorie.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalExerciceCategorie',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeCategorie: {
        amendable: true,
        statut: 1,
      },
    };
  },
  computed: {
    ...mapState({
      listeCategorie: (state) => state.exerciceCategorie.liste,
    }),
  },
  mounted() {
    this.activeCategorie = {
      ...this.activeCategorie,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.activeCategorie.statut = this.activeCategorie.statut ? 1 : 0;
      if ((this.activeCategorie.id || 0) === 0) {
        this.$store
          .dispatch('addExerciceCategorie', this.activeCategorie)
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
          .dispatch('updateExerciceCategorie', this.activeCategorie)
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
