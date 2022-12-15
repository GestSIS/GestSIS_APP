<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Saisie d'un cours</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Date du cours</label>
        <input
          id="cours-date"
          v-model="activeCours.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
          @focusout="dateChange"
        />
      </div>
      <base-select
        v-model="activeCours.cours_id"
        class="mb-3"
        label="Cours"
        :class="{ 'is-invalid': errors['cours_id'] }"
        :disabled="!addMode"
        :options="filteredCours"
      />
      <div class="mb-3">
        <label for="duree">Durée</label>
        <div class="input-group">
          <input
            id="duree"
            v-model="activeCours.duree"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['duree'] }"
          />
          <span class="input-group-text">jours</span>
        </div>
      </div>
      <base-select
        v-model="activeCours.localite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <base-select
        v-if="addMode"
        v-model="activeCours.precedent_id"
        class="mb-3"
        label="Cours précédent"
        base-option="-"
        base-value="0"
        :options="cours"
      />
      <div v-if="addMode" class="mb-3">
        <label>Grade</label>
      </div>
      <div v-if="addMode" class="row">
        <div class="col-md-8">
          <base-select
            v-model="activeCours.grade_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['grade_id'] }"
            base-option="-"
            base-value="0"
            :options="grades"
          />
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <input
              v-model="activeCours.date_grade"
              type="date"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date_grade'] }"
            />
          </div>
        </div>
      </div>

      <div v-if="addMode" class="mb-3">
        <label>Fonction</label>
      </div>
      <div v-if="addMode" class="row">
        <div class="col-md-8">
          <base-select
            v-model="activeCours.fonction_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['fonction_id'] }"
            base-option="-"
            base-value="0"
            display-key="nom"
            :options="fonctions"
          />
        </div>
        <div class="col-md-4">
          <div class="mb-3">
            <input
              v-model="activeCours.date_fonction"
              type="date"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date_fonction'] }"
            />
          </div>
        </div>
      </div>
      <div v-if="addMode" class="mb-3">
        <label>Fonction remplacé</label>
      </div>
      <div v-if="addMode" class="row">
        <div class="col-md-8">
          <base-select
            v-model="activeCours.fonction_sapeur_id"
            class="mb-3"
            :class="{ 'is-invalid': errors['fonction_sapeur_id'] }"
            base-option="-"
            base-value="0"
            display-key="nom"
            :options="
              activeSapeurFonctions.map((s) =>
                fonctions.find((f) => f.id == s.fonction_id)
              )
            "
          />
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
    filteredCours() {
      if (this.activeCours.date == null) {
        return this.cours;
      } else {
        const date = new Date(this.activeCours.date);
        return this.cours.filter(
          (c) =>
            (c.validite_fin == null || new Date(c.validite_fin) >= date) &&
            (c.validite_debut == null || new Date(c.validite_debut) <= date)
        );
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
      this.activeCours.duree = cours?.duree ?? 0;

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
    async save() {
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
};
</script>

<style scoped></style>
