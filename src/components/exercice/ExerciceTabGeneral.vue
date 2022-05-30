<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <span></span>
      <button
        class="btn btn-outline-primary"
        @click="save"
        v-if="hasEditPermission"
      >
        {{ newMode ? 'Ajouter' : 'Sauvegarder' }}
      </button>
    </div>
    <div class="card-body">
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-exe-des">Designation</label>
        <input
          type="text"
          :readonly="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          id="m-exe-des"
          name="nom"
          v-model="activeExerciceData.designation"
        />
      </div>
      <!-- CATEGORIE -->
      <div class="mb-3">
        <label for="m-sap-cat">Categorie</label>
        <select
          :disabled="!hasEditPermission"
          class="form-select form-select-sm"
          required
          :class="{ 'is-invalid': errors['exercice_categorie_id'] }"
          id="m-sap-cat"
          style="width: 100%"
          v-model="activeExerciceData.exercice_categorie_id"
        >
          <option
            v-for="categorie in listeCategories"
            :key="categorie.id"
            :value="categorie.id"
          >
            {{ categorie.designation }}
          </option>
        </select>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- DATE -->
          <div class="mb-3">
            <label for="m-exe-date">Date</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <input
                type="date"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date'] }"
                id="m-exe-date"
                name="nom"
                v-model="activeExerciceData.date"
              />
            </div>
          </div>
        </div>
        <div class="col-6">
          <!-- HEURE -->
          <div class="mb-3">
            <label for="m-exe-heure">Heure</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'clock']" />
              </div>
              <input
                type="time"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['heure'] }"
                id="m-exe-heure"
                name="nom"
                v-model="activeExerciceData.heure"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- DUREE -->
          <div class="mb-3">
            <label for="m-exe-duree">Durée</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['fas', 'hourglass-end']" />
              </div>
              <input
                type="number"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['duree'] }"
                min="1"
                max="780"
                id="m-exe-duree"
                name="nom"
                v-model="activeExerciceData.duree"
              />
              <span class="input-group-text">min</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- LOCALITE -->
          <div class="mb-3">
            <label for="m-sap-localite">Localité</label>
            <select
              :disabled="!hasEditPermission"
              class="form-select form-select-sm"
              required
              :class="{ 'is-invalid': errors['localite_id'] }"
              id="m-sap-localite"
              name="localite_id"
              style="width: 100%"
              v-model="activeExerciceData.localite_id"
            >
              <option
                v-for="localite in listeLocalitesSis"
                :key="localite.id"
                :value="localite.id"
              >
                {{ localite.npa + ' ' + localite.designation }}
              </option>
            </select>
          </div>
        </div>
        <div class="col-6">
          <!-- LIEU -->
          <div class="mb-3">
            <label for="m-exe-lieu">Lieu</label>
            <input
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['lieu'] }"
              id="m-exe-lieu"
              name="nom"
              v-model="activeExerciceData.lieu"
            />
          </div>
        </div>
      </div>
      <!-- COMMUNICATION -->
      <div class="mb-3">
        <label for="m-sap-communication">Communications</label>
        <textarea
          type="text"
          :readonly="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['communications'] }"
          id="m-sap-communication"
          name="communications"
          v-model="activeExerciceData.communications"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'ExerciceTabGeneral',
  computed: {
    ...mapState({
      categories: (state) => state.exerciceCategorie.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      listeCategories: (state) => state.exerciceCategorie.liste,
      activeExerciceId: (state) => state.exercice.active.id,
      activeExerciceData: (state) => state.exercice.active.data,
      activeExerciceSapeurs: (state) => state.exercice.active.sapeurs,
      // TODO: Check si exercice pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.EXERCICE.MODIFICATION),
    }),
    ...mapGetters(['listeLocalitesSis']),
    exerciceCategorie() {
      return this.activeExerciceData.exercice_categorie_id;
    },
    exerciceHeure() {
      return this.activeExerciceData.heure;
    },
  },
  props: {
    newMode: Boolean,
  },
  data() {
    return {
      errors: {},
      loading: true,
    };
  },
  watch: {
    exerciceCategorie(id) {
      this.activeExerciceData.duree =
        this.activeExerciceData.duree ||
        this.categories.find((e) => e.id == id)?.duree_base;
    },
    exerciceHeure(data) {
      this.activeExerciceData.heure = this.formatHeure(data);
    },
  },
  mounted() {
    this.activeExerciceData.heure = this.formatHeure(
      this.activeExerciceData.heure
    );
  },
  methods: {
    async save() {
      if (this.newMode) {
        this.$store
          .dispatch('createExercice', this.activeExerciceData)
          .then((data) => {
            this.$router.push('/exercices/' + data.id);
            this.errors = {};
            this.$awn.success(data?.message || 'Exercice créé');
          })
          .catch((err) => {
            this.errors = err;
            this.$awn.alert(err?.message || "Erreur lors de l'enregistrement");
          });
      } else {
        this.$store
          .dispatch('saveActiveExercice', this.activeExerciceData)
          .then((res) => {
            this.errors = {};
            this.$awn.success(res?.message || 'Modifications enregistrées');
          })
          .catch((err) => {
            this.errors = err;
            this.$awn.alert(err?.message || "Erreur lors de l'enregistrement");
          });
      }
    },
    formatHeure(value) {
      if (value && value.length >= 8) {
        return value.slice(0, 5);
      }
      return value;
    },
  },
};
</script>

<style scoped></style>
