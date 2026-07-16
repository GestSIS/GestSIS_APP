<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useGradeStore } from "../../stores/sapeur/Grade.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useCoursStore } from "../../stores/sapeur/Cours.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  precedent_id: 0,
  ...data,
});

const coursStore = useCoursStore();
const sapeurStore = useSapeurStore();
const gradeStore = useGradeStore();
const fonctionStore = useFonctionStore();
const localiteStore = useLocaliteStore();

const cours = computed(() => coursStore.liste);
const grades = computed(() => gradeStore.liste);
const fonctions = computed(() => fonctionStore.liste);
const localites = computed(() => localiteStore.liste);
const sapeurFonctions = computed(() => sapeurStore.active.fonctions);

const addMode = computed(() => (form.id || 0) === 0);

const filteredCours = computed(() => {
  if (form.date == null) {
    return cours.value;
  } else {
    const date = new Date(form.date);
    return cours.value.filter(
      (c) =>
        (c.validite_fin == null || new Date(c.validite_fin) >= date) &&
        (c.validite_debut == null || new Date(c.validite_debut) <= date),
    );
  }
});

if ((data.id || 0) === 0) {
  sapeurStore.fetchSapeurFonctions(sapeurStore.active.id);
  watch(
    () => form.cours_id,
    (cours_id) => {
      let c = cours.value.find((c) => c.id == cours_id);
      if (!c) return;
      form.fonction_id = c.fonction_id || 0;
      form.grade_id = c.grade_id || 0;
      form.precedent_id = c.precedent_id || 0;
      form.fonction_sapeur_id = 0;
      form.duree = c?.duree ?? 0;

      if (form.fonction_id !== 0) {
        let fonction = fonctions.value.find((f) => f.id == form.fonction_id);
        if (fonction?.cumulable === 0) {
          let funcs = sapeurFonctions.value
            .filter((f) => f.fin === null)
            .filter((f) => fonctions.value.find((e) => e.id == f.fonction_id)?.cumulable === 0);
          if (funcs.length > 0) {
            form.fonction_sapeur_id = funcs[0].id || 0;
          }
        }
      }
    },
  );
}

const { closeModal } = useModalStore();

const save = () => {
  let saveData = Object.assign({}, form);
  Object.keys(saveData).map((key) => {
    saveData[key] = saveData[key] === 0 || saveData[key] === "0" ? null : saveData[key];
  });

  (addMode.value ? sapeurStore.addSapeurCours : sapeurStore.editSapeurCours)(saveData)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
const dateChange = () => {
  if (!form.date_grade) {
    form.date_grade = form.date;
  }
  if (!form.date_fonction) {
    form.date_fonction = form.date;
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Saisie d'un cours</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Date du cours</label>
        <input
          id="cours-date"
          v-model="form.date"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
          @focusout="dateChange"
        />
      </div>
      <base-select
        v-model="form.cours_id"
        :required="true"
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
            v-model="form.duree"
            required
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['duree'] }"
          />
          <span class="input-group-text">jours</span>
        </div>
      </div>
      <base-select
        v-model="form.localite_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <base-select
        v-if="addMode"
        v-model="form.precedent_id"
        :required="true"
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
            v-model="form.grade_id"
            :required="true"
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
              v-model="form.date_grade"
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
            v-model="form.fonction_id"
            :required="true"
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
              v-model="form.date_fonction"
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
            v-model="form.fonction_sapeur_id"
            :required="true"
            class="mb-3"
            :class="{ 'is-invalid': errors['fonction_sapeur_id'] }"
            base-option="-"
            base-value="0"
            display-key="nom"
            :options="
              sapeurFonctions
                .map((s) => fonctions.find((f) => f.id == s.fonction_id))
                .filter((f) => f)
            "
          />
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ addMode ? "Ajouter" : "Modifier" }}
      </button>
    </div>
  </form>
</template>
