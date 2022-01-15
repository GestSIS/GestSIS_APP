<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Saisie d'un cours</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Date du cours</label>
        <input
          type="date"
          v-model="activeCours.date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
          id="cours-date"
          @focusout="dateChange"
        />
      </div>
      <div class="mb-3">
        <label for="cours-name">Cours</label>
        <select
          id="cours-name"
          v-model="activeCours.cours_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['cours_id'] }"
          :disabled="!addMode"
        >
          <option v-for="c in cours" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
          <!-- TODO limiter le nombre de cours -->
        </select>
      </div>
      <div class="mb-3">
        <label for="cours-localite">Localité</label>
        <select
          id="cours-localite"
          v-model="activeCours.localite_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['localite_id'] }"
        >
          <option v-for="l in localites" :key="l.id" :value="l.id">
            {{ l.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3" v-if="addMode">
        <label for="cours-precedent">Cours précédent</label>
        <select
          id="cours-precedent"
          v-model="activeCours.precedent_id"
          class="form-select form-select-sm"
          disabled
        >
          <option value="0">-</option>
          <option v-for="c in cours" :key="c.id" :value="c.id">
            {{ c.designation }}
          </option>
          <!-- TODO Limiter le nombre de cours -->
        </select>
      </div>
      <div class="mb-3" v-if="addMode">
        <label>Grade</label>
      </div>
      <div class="row" v-if="addMode">
        <div class="col-md-8">
          <div class="mb-3">
            <select
              v-model="activeCours.grade_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['grade_id'] }"
            >
              <option value="0">-</option>
              <option v-for="g in grades" :key="g.id" :value="g.id">
                {{ g.designation }}
              </option>
            </select>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <input
              type="date"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date_grade'] }"
              v-model="activeCours.date_grade"
            />
          </div>
        </div>
      </div>

      <div class="mb-3" v-if="addMode">
        <label>Fonction</label>
      </div>
      <div class="row" v-if="addMode">
        <div class="col-md-8">
          <div class="mb-3">
            <select
              v-model="activeCours.fonction_id"
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['fonction_id'] }"
            >
              <option value="0">-</option>
              <option v-for="f in fonctions" :key="f.id" :value="f.id">
                {{ f.nom }}
              </option>
            </select>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <input
              type="date"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date_fonction'] }"
              v-model="activeCours.date_fonction"
            />
          </div>
        </div>
      </div>
      <div class="mb-3" v-if="addMode">
        <label>Fonction remplacé</label>
      </div>
      <div class="row" v-if="addMode">
        <div class="col-md-8">
          <div class="mb-3">
            <select
              class="form-select form-select-sm"
              :class="{ 'is-invalid': errors['fonction_sapeur_id'] }"
              v-model="activeCours.fonction_sapeur_id"
            >
              <option value="0">-</option>
              <option
                v-for="f in activeSapeurFonctions"
                :key="f.id"
                :value="f.id"
              >
                {{ fonctions.find((e) => e.id == f.fonction_id).nom }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ addMode ? 'Ajouter' : 'Modifier' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalSapeurCours',
  data() {
    return {
      errors: {},
    };
  },
  computed: {
    ...mapState({
      cours: (state) => state.cours.liste,
      grades: (state) => state.grade.liste,
      fonctions: (state) => state.fonction.liste,
      localites: (state) => state.localite.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurFonctions: (state) => state.sapeur.active.fonctions,
      activeCours: (state) => state.cours.active,
    }),
    addMode() {
      return (this.activeCours.id || 0) === 0;
    },
    activeCoursId() {
      return this.activeCours.cours_id;
    },
    activesFonctions() {
      return this.activeSapeurFonctions.filter((f) => f.fin === null);
    },
  },
  mounted() {
    if (this.activeSapeurFonctions.length === 0) {
      this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
    }

    if (this.cours.length === 0) {
      this.$store.dispatch('fetchCours');
    }
    if (this.fonctions.length === 0) {
      this.$store.dispatch('fetchFonctions');
    }
    if (this.grades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      let saveData = Object.assign({}, this.activeCours);
      Object.keys(saveData).map((key) => {
        saveData[key] =
          saveData[key] === 0 || saveData[key] === '0' ? null : saveData[key];
      });

      if (this.addMode) {
        this.$store
          .dispatch('addSapeurCours', saveData)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
            this.$store.dispatch('fetchSapeurFonctions', this.activeSapeurId);
            this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editSapeurCours', saveData)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
            this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
          })
          .catch((errors) => (this.errors = errors));
      }
    },
    dateChange() {
      if (!this.activeCours.date_grade) {
        this.activeCours.date_grade = this.activeCours.date;
      }
      if (!this.activeCours.date_fonction) {
        this.activeCours.date_fonction = this.activeCours.date;
      }
    },
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurCours', id);
    },
    activeCoursId: function (cours_id) {
      let cours = this.cours.find((c) => c.id == cours_id);
      this.activeCours.fonction_id = cours.fonction_id || 0;
      this.activeCours.grade_id = cours.grade_id || 0;
      this.activeCours.precedent_id = cours.precedent_id || 0;
      this.activeCours.fonction_sapeur_id = 0;

      if (this.activeCours.fonction_id !== 0) {
        let fonction = this.fonctions.find(
          (f) => f.id == this.activeCours.fonction_id
        );
        if (fonction.cumulable === 0) {
          let fonctions = this.activesFonctions.filter(
            (f) =>
              this.fonctions.find((e) => e.id == f.fonction_id).cumulable === 0
          );
          if (fonctions.length > 0) {
            this.activeCours.fonction_sapeur_id = fonctions[0].id || 0;
          }
        }
      }
    },
  },
};
</script>

<style scoped></style>
