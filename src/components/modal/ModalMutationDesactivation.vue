<script setup>
import { computed, ref, watch } from "vue";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useGroupeStore } from "../../stores/groupe/Groupe.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import useNotification from "../../composables/useNotification.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const selectedExercices = ref({});
const selectedGroupes = ref({});
const selectedFonctions = ref({});
const mutationDate = ref(data?.sortie ?? null);

const exerciceCategorieStore = useExerciceCategorieStore();
const groupeStore = useGroupeStore();
const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();

exerciceCategorieStore.fetchExerciceCategories();
groupeStore.fetchGroupes();
fonctionStore.fetchFonctions();

const formatDate = (date) => {
  var monthNames = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + " " + monthNames[monthIndex] + " " + year;
};

const categories = computed(() => exerciceCategorieStore.liste);
const groupes = computed(() => groupeStore.liste);
const fonctions = computed(() => fonctionStore.liste);
const activeSapeurExercice = computed(() => sapeurStore.active.exercices);
const activeSapeurGroupe = computed(() => sapeurStore.active.groupes);
const activeSapeurFonction = computed(() => sapeurStore.active.fonctions.filter((f) => !f.fin));
const exercices = computed(() => {
  return activeSapeurExercice.value
    .filter(
      (e) => e.statut <= 2 && e.statut > 0 && e.date > mutationDate.value, // Saisie ou vide et pas annulé
    )
    .map((e) => ({
      ...e,
      info: `${
        categories.value.find((c) => c.id == e.exercice_categorie_id)?.designation
      } : ${e.communications}`,
    }));
});
const sapGroupes = computed(() => {
  return activeSapeurGroupe.value.map((g) => ({
    ...groupes.value.find((f) => f.id == g.groupe_id),
    id: g.id,
  }));
});
const sapFonctions = computed(() => {
  return activeSapeurFonction.value.map((f) => ({
    ...fonctions.value.find((e) => e.id == f.fonction_id),
    debut: f.debut,
    id: f.id,
    info: `Début ${formatDate(new Date(f.debut))}`,
  }));
});

// État de la case « tout sélectionner » : cochée si tous les éléments affichés
// sont sélectionnés, indéterminée si une partie seulement l'est.
const etatSelection = (items, selection) => {
  if (!items.length) return { checked: false, indeterminate: false };
  const nb = items.filter((i) => selection[i.id]).length;
  return {
    checked: nb === items.length,
    indeterminate: nb > 0 && nb < items.length,
  };
};
const exercicesSelectedState = computed(() =>
  etatSelection(exercices.value, selectedExercices.value),
);
const groupesSelectedState = computed(() => etatSelection(sapGroupes.value, selectedGroupes.value));
const fonctionsSelectedState = computed(() =>
  etatSelection(sapFonctions.value, selectedFonctions.value),
);

// Par défaut tout est sélectionné : chaque nouvel élément affiché est coché,
// sans réécraser un choix déjà fait par l'utilisateur.
const selectionnerParDefaut = (items, selection) => {
  items.forEach((i) => {
    if (selection.value[i.id] === undefined) {
      selection.value[i.id] = true;
    }
  });
};
watch(exercices, (l) => selectionnerParDefaut(l, selectedExercices), {
  immediate: true,
});
watch(sapGroupes, (l) => selectionnerParDefaut(l, selectedGroupes), {
  immediate: true,
});
watch(sapFonctions, (l) => selectionnerParDefaut(l, selectedFonctions), {
  immediate: true,
});

const { closeModal } = useModalStore();
const awn = useNotification();

const save = async () => {
  const mapToId = (e) => e.id;
  const fonctionsASupprimer = sapFonctions.value.filter((f) => selectedFonctions.value[f.id]);

  // La date n'est requise que si l'on termine des fonctions, et elle doit être
  // postérieure au début de chacune des fonctions concernées.
  if (
    fonctionsASupprimer.length > 0 &&
    (!mutationDate.value ||
      fonctionsASupprimer.some((f) => new Date(f.debut) >= new Date(mutationDate.value)))
  ) {
    errors.value.date = "Date requise";
    return;
  }
  errors.value = {};

  const exercicesASupprimer = exercices.value.filter((e) => selectedExercices.value[e.id]);
  const groupesAQuitter = sapGroupes.value.filter((g) => selectedGroupes.value[g.id]);

  const actions = [];
  if (fonctionsASupprimer.length) {
    actions.push(
      sapeurStore.finFonctions({
        fin: mutationDate.value,
        ids: fonctionsASupprimer.map(mapToId),
      }),
    );
  }
  if (exercicesASupprimer.length) {
    actions.push(sapeurStore.supprimerConvocation(exercicesASupprimer.map(mapToId)));
  }
  if (groupesAQuitter.length) {
    actions.push(sapeurStore.quitterGroupes(groupesAQuitter.map(mapToId)));
  }

  try {
    await Promise.all(actions);
    if (actions.length) {
      awn.success("Traitement effectué");
    }
    closeModal();
  } catch (err) {
    awn.alert(err?.message ?? "Une erreur est survenue lors du traitement");
  }
};
const selectGroupe = (state, groupeId) => {
  if (groupeId) {
    selectedGroupes.value[groupeId] = state;
  } else {
    selectedGroupes.value = Object.fromEntries(sapGroupes.value.map((g) => [g.id, state]));
  }
};
const selectExercice = (state, exerciceId) => {
  if (exerciceId) {
    selectedExercices.value[exerciceId] = state;
  } else {
    selectedExercices.value = Object.fromEntries(exercices.value.map((e) => [e.id, state]));
  }
};
const selectFonction = (state, fonctionId) => {
  if (fonctionId) {
    selectedFonctions.value[fonctionId] = state;
  } else {
    selectedFonctions.value = Object.fromEntries(sapFonctions.value.map((f) => [f.id, state]));
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Suppression des groupes, exercices et fonctions</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <form
        v-if="sapFonctions.length || activeSapeurExercice.length"
        class="row g-3 align-items-center mb-2"
      >
        <div class="col-auto">
          <label for="fin">Date</label>
        </div>
        <div class="col-auto">
          <input
            id="fin"
            v-model="mutationDate"
            type="date"
            class="form-control mx-sm-3"
            :class="{ 'is-invalid': errors.date }"
          />
        </div>
        <div class="col-auto">
          <small v-if="errors.date" class="invalid-feedback"> Date requise </small>
        </div>
      </form>
      <table id="mutation-desactivation-table" class="table table-sm">
        <thead>
          <tr>
            <th>Sel</th>
            <th>Objet</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody v-if="exercices && exercices.length">
          <tr>
            <td>
              <input
                id="sel-exercices-mut"
                type="checkbox"
                name="exercices"
                :indeterminate.prop="exercicesSelectedState.indeterminate"
                :checked="exercicesSelectedState.checked"
                @click="selectExercice($event.target.checked)"
              />
            </td>
            <td>Exercices</td>
            <td></td>
          </tr>
          <tr v-for="exercice in exercices" :key="exercice.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedExercices[exercice.id]"
                @click="selectExercice($event.target.checked, exercice.id)"
              />
            </td>
            <td>{{ exercice.date }}</td>
            <td>{{ exercice.info }}</td>
          </tr>
        </tbody>
        <tbody v-if="sapGroupes && sapGroupes.length">
          <tr>
            <td>
              <input
                id="sel-groupes-mut"
                type="checkbox"
                name="groupes"
                :indeterminate.prop="groupesSelectedState.indeterminate"
                :checked="groupesSelectedState.checked"
                @click="selectGroupe($event.target.checked)"
              />
            </td>
            <td>Groupes</td>
            <td></td>
          </tr>
          <tr v-for="groupe in sapGroupes" :key="groupe.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedGroupes[groupe.id]"
                @click="selectGroupe($event.target.checked, groupe.id)"
              />
            </td>
            <td>{{ groupe.designation }}</td>
            <td>{{ groupe.no }}</td>
          </tr>
        </tbody>
        <tbody v-if="sapFonctions && sapFonctions.length">
          <tr>
            <td>
              <input
                id="sel-fonctions-mut"
                type="checkbox"
                name="fonctions"
                :indeterminate.prop="fonctionsSelectedState.indeterminate"
                :checked="fonctionsSelectedState.checked"
                @click="selectFonction($event.target.checked)"
              />
            </td>
            <td>Fonctions</td>
            <td></td>
          </tr>
          <tr v-for="fonction in sapFonctions" :key="fonction.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedFonctions[fonction.id]"
                @click="selectFonction($event.target.checked, fonction.id)"
              />
            </td>
            <td>{{ fonction.nom }}</td>
            <td>{{ fonction.info }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save()">Traitement</button>
    </div>
  </div>
</template>

<style scoped>
#mutation-desactivation-table tbody tr td:first-child,
#mutation-desactivation-table thead tr th:first-child {
  width: 8px;
}

#mutation-desactivation-table tbody tr:nth-child(n + 2) td:nth-child(2) {
  padding-left: 2rem;
}

#mutation-desactivation-table tbody tr td {
  padding: 0.4rem 0.75rem;
}
</style>
