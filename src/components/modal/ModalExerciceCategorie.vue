<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeCategorie.id ? 'Modifier' : 'Ajouter' }} une catégorie
        d'exercice
      </h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeCategorie.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="form-group">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeCategorie.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="form-group">
        <label for="duree_base">Durée standard</label>
        <input
          type="text"
          v-model="activeCategorie.duree_base"
          class="form-control"
          :class="{ 'is-invalid': errors['duree_base'] }"
          id="duree_base"
        />
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="amendable-modal"
            v-model="activeCategorie.amendable"
          />
          <label class="custom-control-label" for="amendable-modal"
            >Amendable</label
          >
        </div>
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="status-modal"
            v-model="activeCategorie.status"
          />
          <label class="custom-control-label" for="status-modal">Actif</label>
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
    },
  },
  data() {
    return {
      errors: {},
      activeCategorie: {
        status: 1,
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
    save() {
      this.activeCategorie.status = this.activeCategorie.status ? 1 : 0;
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
