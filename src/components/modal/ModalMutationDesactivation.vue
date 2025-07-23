<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

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
const mutationDate = ref(null);

const store = useStore();

store.dispatch('fetchExerciceCategories', store.state.sapeur.active.id);
store.dispatch('fetchGroupes', store.state.sapeur.active.id);

const formatDate = (date) => {
  var monthNames = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
};

const categories = computed(() => store.state.exerciceCategorie.liste);
const groupes = computed(() => store.state.groupe.liste);
const fonctions = computed(() => store.state.fonction.liste);
const activeSapeurExercice = computed(
  () => store.state.sapeur.active.exercices,
);
const activeSapeurGroupe = computed(() => store.state.sapeur.active.groupes);
const activeSapeurFonction = computed(() =>
  store.state.sapeur.active.fonctions.filter((f) => !f.fin),
);
const exercicesSelectedState = computed(() => {
  return Object.values(selectedExercices.value).every((e) => e);
});
const groupesSelectedState = computed(() => {
  return Object.values(selectedGroupes.value).every((e) => e);
});
const fonctionsSelectedState = computed(() => {
  return Object.values(selectedFonctions.value).every((e) => e);
});
const exercices = computed(() => {
  return activeSapeurExercice.value
    .filter(
      (e) => e.statut <= 2 && e.statut > 0 && e.date > mutationDate.value, // Saisie ou vide et pas annulé
    )
    .map((e) => ({
      ...e,
      info: `${
        categories.value.find((c) => c.id == e.exercice_categorie_id)
          .designation
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

const { closeModal } = useModalStore();

const save = () => {
  if (
    sapFonctions.value.length > 0 &&
    (!mutationDate.value ||
      sapFonctions.value.some(
        (f) => new Date(f.debut) >= new Date(mutationDate.value),
      ))
  ) {
    errors.value.date = 'Date requise';
    return;
  }

  let mapToId = (e) => e.id;

  if (sapFonctions.value.filter((e) => selectedFonctions.value[e.id]).length) {
    store.dispatch('finFonctions', {
      fin: mutationDate.value,
      ids: sapFonctions.value
        .filter((e) => selectedFonctions.value[e.id])
        .map(mapToId),
    });
  }
  if (exercices.value.filter((e) => selectedExercices.value[e.id]).length) {
    store.dispatch(
      'supprimerConvocation',
      exercices.value.filter((e) => selectedExercices.value[e.id]).map(mapToId),
    );
  }
  if (sapGroupes.value.filter((e) => selectedGroupes.value[e.id]).length) {
    store.dispatch(
      'quitterGroupes',
      sapGroupes.value.filter((e) => selectedGroupes.value[e.id]).map(mapToId),
    );
  }

  closeModal();
};
const selectGroupe = (state, groupeId) => {
  if (groupeId) {
    selectedGroupes.value[groupeId] = state;
  } else {
    selectedGroupes.value = Object.fromEntries(
      activeSapeurGroupe.value.map((g) => [g.id, state]),
    );
  }
};
const selectExercice = (state, exerciceId) => {
  if (exerciceId) {
    selectedExercices.value[exerciceId] = state;
  } else {
    selectedExercices.value = Object.fromEntries(
      activeSapeurExercice.value.map((g) => [g.id, state]),
    );
  }
};
const selectFonction = (state, fonctionId) => {
  if (fonctionId) {
    selectedFonctions.value[fonctionId] = state;
  } else {
    selectedFonctions.value = Object.fromEntries(
      activeSapeurFonction.value.map((g) => [g.id, state]),
    );
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Suppression des groupes, exercices et fonctions
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <form v-if="fonctions.length" class="row g-3 align-items-center mb-2">
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
          <small v-if="errors.date" class="invalid-feedback">
            Date requise
          </small>
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
                :indeterminate.prop="exercicesSelectedState == undefined"
                :checked="exercicesSelectedState"
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
                :indeterminate.prop="groupesSelectedState == undefined"
                :checked="groupesSelectedState"
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
                :indeterminate.prop="fonctionsSelectedState == undefined"
                :checked="fonctionsSelectedState"
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
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Traitement
      </button>
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
