<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeCours.id ? 'Modifier' : 'Ajouter' }} un cours
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
          v-model="activeCours.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="form-group">
        <label for="abreviation">Abréviation</label>
        <input
          type="text"
          v-model="activeCours.abreviation"
          class="form-control"
          :class="{ 'is-invalid': errors['abreviation'] }"
          id="abreviation"
        />
      </div>
      <div class="form-group">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeCours.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>

      <div class="form-group">
        <label for="cours-precedent">Cours précédent</label>
        <select
          id="cours-precedent"
          v-model="activeCours.precedent_id"
          class="custom-select"
        >
          <option value="0">-</option>
          <option v-for="c in listeCours" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="grade">Grade</label>
        <select
          id="grade"
          v-model="activeCours.grade_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['grade_id'] }"
        >
          <option value="0">-</option>
          <option v-for="g in listeGrade" :key="g.id" :value="g.id">
            {{ g.designation }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="fonction">Fonction</label>
        <select
          id="fonction"
          v-model="activeCours.fonction_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['fonction_id'] }"
        >
          <option value="0">-</option>
          <option v-for="f in listeFonction" :key="f.id" :value="f.id">
            {{ f.nom }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="cours-actif-modal"
            v-model="activeCours.actif"
          />
          <label class="custom-control-label" for="cours-actif-modal"
            >Actif</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeCours.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalCours',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeCours: {
        actif: 1,
      },
    };
  },
  computed: {
    ...mapState({
      listeGrade: (state) => state.grade.liste,
      listeFonction: (state) => state.fonction.liste,
      listeCours: (state) => state.cours.liste,
    }),
  },
  mounted() {
    this.activeCours = {
      ...this.activeCours,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    cours(id) {
      return id ? liste.find((c) => c.id === id)?.designation : '';
    },
    localite(localite) {
      return localite?.designation;
    },
    save() {
      //Format back dates to SQL Format
      if ((this.activeCours.id || 0) === 0) {
        this.$store
          .dispatch('addCours', this.activeCours)
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
          .dispatch('updateCours', this.activeCours)
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
