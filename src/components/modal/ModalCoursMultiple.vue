<script setup>
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useGradeStore } from "../../stores/sapeur/Grade.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useCoursStore } from "../../stores/sapeur/Cours.js";
import { useCoursSapeurStore } from "../../stores/sapeur/CoursSapeur.js";

const errors = ref({});
const form = reactive({
  precedent_id: 0,
  sapeurs: [{ sapeur_id: null }],
});

const coursStore = useCoursStore();
const sapeurStore = useSapeurStore();
const gradeStore = useGradeStore();
const fonctionStore = useFonctionStore();
const localiteStore = useLocaliteStore();
const coursSapeurStore = useCoursSapeurStore();

const cours = computed(() => coursStore.liste);
const grades = computed(() => gradeStore.liste);
const fonctions = computed(() => fonctionStore.liste);
const localites = computed(() => localiteStore.liste);
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));
const sapeursDisponibles = (index) => {
  const selectionnesAilleurs = new Set(
    form.sapeurs
      .filter((_, i) => i !== index)
      .map((s) => s.sapeur_id)
      .filter((id) => id != null),
  );
  return sapeurs.value.filter((s) => !selectionnesAilleurs.has(s.id));
};

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

watch(
  () => form.cours_id,
  (cours_id) => {
    let c = cours.value.find((c) => c.id == cours_id);
    if (!c) return;
    form.fonction_id = c.fonction_id || 0;
    form.grade_id = c.grade_id || 0;
    form.precedent_id = c.precedent_id || 0;
    form.duree = c?.duree ?? 0;
  },
);

const { closeModal } = useModalStore();
const awn = useNotification();

const sapeurSelecteurInputs = useTemplateRef("sapeur-selecteur");
const ajoutSapeur = () => {
  form.sapeurs.push({ sapeur_id: null });

  nextTick(() => {
    sapeurSelecteurInputs.value[sapeurSelecteurInputs.value.length - 1].focus();
  });
};
const supprimerSapeur = (i) => {
  form.sapeurs.splice(i, 1);
};

const dateChange = () => {
  if (!form.date_grade) {
    form.date_grade = form.date;
  }
  if (!form.date_fonction) {
    form.date_fonction = form.date;
  }
};

const save = () => {
  errors.value = {};

  const sapeurIds = form.sapeurs.map((s) => s.sapeur_id);
  if (new Set(sapeurIds).size != sapeurIds.length) {
    awn.alert("Erreur, un sapeur a été saisi à double.");
    return;
  }

  let saveData = {
    date: form.date,
    cours_id: form.cours_id,
    duree: form.duree,
    localite_id: form.localite_id,
    precedent_id: form.precedent_id,
    grade_id: form.grade_id,
    date_grade: form.date_grade,
    fonction_id: form.fonction_id,
    date_fonction: form.date_fonction,
  };
  Object.keys(saveData).map((key) => {
    saveData[key] = saveData[key] === 0 || saveData[key] === "0" ? null : saveData[key];
  });
  saveData.sapeur_ids = sapeurIds;

  coursSapeurStore
    .addCoursMultiple(saveData)
    .then(closeModal)
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de l'enregistrement");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Ajout d'un cours à plusieurs sapeurs</h5>
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
        v-model="form.precedent_id"
        :required="true"
        class="mb-3"
        label="Cours précédent"
        base-option="-"
        base-value="0"
        :options="cours"
      />
      <div class="mb-3">
        <label>Grade</label>
      </div>
      <div class="row">
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

      <div class="mb-3">
        <label>Fonction</label>
      </div>
      <div class="row">
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

      <div class="mb-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in form.sapeurs" :key="i">
              <td>
                <base-select
                  ref="sapeur-selecteur"
                  v-model="item.sapeur_id"
                  :required="true"
                  :class="{ 'is-invalid': errors['base-sapeur' + i] }"
                  display-key="nom_prenom"
                  :options="sapeursDisponibles(i)"
                />
              </td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  :disabled="form.sapeurs.length <= 1"
                  @click="supprimerSapeur(i)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <button type="button" class="btn btn-outline-primary" @click="ajoutSapeur()">
                  Ajouter
                  <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">Ajouter</button>
    </div>
  </form>
</template>
