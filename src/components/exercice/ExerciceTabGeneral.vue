<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <span></span>
      <button
        v-if="hasEditPermission"
        class="btn btn-outline-primary"
        @click="save"
      >
        {{ newMode ? 'Ajouter' : 'Sauvegarder' }}
      </button>
    </div>
    <div class="card-body">
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-exe-des">Designation</label>
        <input
          id="m-exe-des"
          v-model="activeExerciceData.designation"
          type="text"
          :readonly="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          name="nom"
        />
      </div>
      <!-- CATEGORIE -->
      <base-select
        v-model="activeExerciceData.exercice_categorie_id"
        label="Catégorie"
        :options="categories"
        :disabled="!hasEditPermission"
        required
        class="mb-3"
        :select-class="{ 'is-invalid': errors['exercice_categorie_id'] }"
      />
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
                id="m-exe-date"
                v-model="activeExerciceData.date"
                type="date"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date'] }"
                name="nom"
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
                id="m-exe-heure"
                v-model="activeExerciceData.heure"
                type="time"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['heure'] }"
                name="nom"
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
                id="m-exe-duree"
                v-model="activeExerciceData.duree"
                type="number"
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['duree'] }"
                min="1"
                max="780"
                name="nom"
              />
              <span class="input-group-text">min</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <!-- LOCALITE -->
          <base-select
            v-model="activeExerciceData.localite_id"
            label="Localité"
            :options="localites"
            :disabled="!hasEditPermission"
            required
            :select-class="{ 'is-invalid': errors['localite_id'] }"
            class="mb-3"
          />
        </div>
        <div class="col-6">
          <!-- LIEU -->
          <div class="mb-3">
            <label for="m-exe-lieu">Lieu</label>
            <input
              id="m-exe-lieu"
              v-model="activeExerciceData.lieu"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['lieu'] }"
              name="nom"
            />
          </div>
        </div>
      </div>
      <!-- COMMUNICATION -->
      <div class="mb-3">
        <label for="m-sap-communication">Communications</label>
        <textarea
          id="m-sap-communication"
          v-model="activeExerciceData.communications"
          type="text"
          :readonly="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['communications'] }"
          name="communications"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'ExerciceTabGeneral',
  props: {
    newMode: Boolean,
  },
  data() {
    return {
      errors: {},
      loading: true,
    };
  },
  computed: {
    ...mapState({
      categories: (state) => state.exerciceCategorie.liste,
      localites: (state) => state.localite.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeExerciceId: (state) => state.exercice.active.id,
      activeExerciceData: (state) => state.exercice.active.data,
      activeExerciceSapeurs: (state) => state.exercice.active.sapeurs,
      // TODO: Check si exercice pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.MODIFICATION),
    }),
    exerciceCategorie() {
      return this.activeExerciceData.exercice_categorie_id;
    },
    exerciceHeure() {
      return this.activeExerciceData.heure;
    },
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
