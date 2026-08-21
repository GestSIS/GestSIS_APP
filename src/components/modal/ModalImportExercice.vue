<script setup>
import { computed, reactive, ref } from "vue";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExerciceStore } from "../../stores/exercice/Exercice.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import ExerciceService from "../../services/ExerciceService.js";
import MultiStep from "../base/MultiStep.vue";

const phase = ref(1);
const loading = ref(false);
const sending = ref(false);

const form = reactive({
  exerciceComptableId: null,
  exercices: [],
  decallage: 364,
});

const exerciceComptableStore = useExerciceComptableStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const exerciceStore = useExerciceStore();
const localiteStore = useLocaliteStore();
localiteStore.fetchLocalites();

const categories = computed(() => exerciceCategorieStore.liste);
const localites = computed(() => localiteStore.liste);
const exercicesComptables = computed(() =>
  exerciceComptableStore.liste.filter((e) => e.id !== exerciceComptableStore.activeId),
);

const selectExerciceComptable = async () => {
  loading.value = true;
  form.exercices = (await ExerciceService.getExercices(form.exerciceComptableId)).map((e) => ({
    ...e,
    categorie: categories.value.find((c) => c.id === e.exercice_categorie_id)?.designation,
  }));
  form.exercices.sort((a, b) => a.date?.localeCompare(b.date ?? "") ?? 0);
  loading.value = false;
};

// Computed (not a watchEffect writing back into form.exercices, which would
// retrigger itself and blow up with "Maximum recursive updates exceeded")
const exercicesDecales = computed(() =>
  form.exercices.map((e) => ({
    ...e,
    date_2: e.date
      ? new Date(new Date(e.date).getTime() + form.decallage * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      : null,
  })),
);

const validerDecalage = () => {
  form.exercices = exercicesDecales.value.map((e) => ({ ...e, date: e.date_2 }));
  phase.value = 3;
};

const ajouterExercice = () => {
  form.exercices.push({
    exercice_categorie_id: categories.value[0]?.id ?? null,
    date: null,
    heure: "08:00",
    lieu: "",
    localite_id: localites.value[0]?.id ?? null,
    duree: categories.value[0]?.duree_base ?? 120,
    designation: "",
  });
};
const supprimerExercice = (i) => form.exercices.splice(i, 1);

const { closeModal } = useModalStore();
const awn = useNotification();

const importer = async () => {
  sending.value = true;
  try {
    await Promise.all(
      form.exercices.map((e) =>
        ExerciceService.createExercice({
          designation: e.designation,
          date: e.date,
          heure: (e.heure ?? "").slice(0, 5),
          lieu: e.lieu ?? "",
          communications: e.communications ?? "",
          duree: e.duree,
          exercice_categorie_id: e.exercice_categorie_id,
          localite_id: e.localite_id,
          exercice_comptable_id: exerciceComptableStore.activeId,
        }),
      ),
    );
    await exerciceStore.fetchListeExercice(exerciceComptableStore.activeId);
    awn.success(`${form.exercices.length} exercice(s) importé(s) avec succès`);
    closeModal();
  } catch (err) {
    awn.alert(err?.message ?? "Erreur lors de l'importation des exercices");
  } finally {
    sending.value = false;
  }
};

const joursAbrev = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const formatDateAvecJour = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${joursAbrev[date.getDay()]} ${date.toLocaleDateString("fr-CH")}`;
};

const fieldsStep1 = [
  { title: "Catégorie", key: "categorie" },
  { title: "Date", key: "date", type: Date },
  { title: "Durée", key: "duree" },
  { title: "Désignation", key: "designation" },
];
const fieldsStep2 = [
  { title: "Catégorie", key: "categorie" },
  { title: "Date Précédente", key: "date", formatter: formatDateAvecJour },
  { title: "Nouvelle Date", key: "date_2", formatter: formatDateAvecJour },
  { title: "Durée", key: "duree" },
  { title: "Désignation", key: "designation" },
];
</script>

<template>
  <form @submit.prevent="importer">
    <div class="modal-header">
      <h5 class="modal-title">Importer des exercices depuis un autre exercice comptable</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <multi-step
        :steps="[
          'Choix de l\'exercice comptable',
          'Ajustement temporel',
          'Modifications finales',
          'Convocations des groupes',
        ]"
        :active-index="phase - 1"
      />
      <template v-if="phase === 1">
        <div class="row">
          <div class="col-6">
            <base-select
              v-model="form.exerciceComptableId"
              :options="exercicesComptables"
              display-key="annee"
              base-option="<Sélectionnez un exercice comptable>"
              :base-value="null"
              :required="true"
              class="mb-3"
              label="Exercice source"
              @change="(id) => selectExerciceComptable(id)"
            />
          </div>
          <div class="col-12">
            <base-table :loading="loading" :data="form.exercices" :fields="fieldsStep1" />
          </div>
        </div>
      </template>
      <template v-if="phase === 2">
        <div class="row">
          <div class="col-6">
            <input
              v-model.number="form.decallage"
              type="number"
              label="Décalage en jours"
              :required="true"
              class="mb-3"
            />
          </div>
          <div class="col-12">
            <base-table :data="exercicesDecales" :fields="fieldsStep2" />
          </div>
        </div>
      </template>
      <template v-if="phase === 3">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Lieu</th>
                <th>Durée</th>
                <th>Désignation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exercice, i) in form.exercices" :key="i">
                <td class="col-2">
                  <base-select
                    v-model="exercice.exercice_categorie_id"
                    :options="categories"
                    :required="true"
                  />
                </td>
                <td class="col-2">
                  <input
                    v-model="exercice.date"
                    type="date"
                    required
                    class="form-control form-control-sm"
                  />
                </td>
                <td class="col-1">
                  <input
                    v-model="exercice.heure"
                    type="time"
                    required
                    class="form-control form-control-sm"
                  />
                </td>
                <td class="col-2">
                  <base-select
                    v-model="exercice.localite_id"
                    :options="localites"
                    :required="true"
                  />
                </td>
                <td class="col-1">
                  <input
                    v-model.number="exercice.duree"
                    type="number"
                    min="1"
                    max="780"
                    required
                    class="form-control form-control-sm"
                  />
                </td>
                <td class="col-3">
                  <input
                    v-model="exercice.designation"
                    type="text"
                    required
                    class="form-control form-control-sm"
                  />
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerExercice(i)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
              <tr>
                <td colspan="7">
                  <button type="button" class="btn btn-outline-primary" @click="ajouterExercice">
                    Ajouter <font-awesome-icon :icon="['far', 'plus-square']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button v-if="phase > 1" type="button" class="btn btn-outline-primary" @click="phase -= 1">
        Précédent
      </button>
      <button
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        :disabled="!form.exerciceComptableId || form.exercices.length === 0"
        @click="phase += 1"
      >
        Suivant
      </button>
      <button
        v-else-if="phase === 2"
        type="button"
        class="btn btn-primary"
        @click="validerDecalage"
      >
        Suivant
      </button>
      <button v-else type="submit" class="btn btn-primary" :disabled="sending">Importer</button>
    </div>
  </form>
</template>
