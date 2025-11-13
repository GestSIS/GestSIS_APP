<script setup>
import { computed, reactive, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import ExerciceService from '../../services/ExerciceService.js';
import MultiStep from '../base/MultiStep.vue';

const phase = ref(1);
const loading = ref(false);

const form = reactive({
  exerciceComptableId: null,
  exercices: [],
  decallage: 364,
});

const store = useStore();

const categories = computed(() => store.state.exerciceCategorie.liste);
const exercicesComptables = computed(() =>
  store.state.exerciceComptable.liste.filter(
    (e) => e.id !== store.state.exerciceComptable.activeId,
  ),
);

const selectExerciceComptable = async () => {
  loading.value = true;
  form.exercices = (
    await ExerciceService.getExercices(form.exerciceComptableId)
  ).map((e) => ({
    ...e,
    categorie: categories.value.find((c) => c.id === e.exercice_categorie_id)
      ?.designation,
  }));
  form.exercices.sort((a, b) => a.date?.localeCompare(b.date ?? '') ?? 0);
  loading.value = false;
};

watchEffect(() => {
  form.exercices = form.exercices.map((e) => ({
    ...e,
    date_2: e.date
      ? new Date(
          new Date(e.date).getTime() + form.decallage * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split('T')[0]
      : null,
  }));
});

const { closeModal } = useModalStore();

const fieldsStep1 = [
  { title: 'Catégorie', key: 'categorie' },
  { title: 'Date', key: 'date', type: Date },
  { title: 'Durée', key: 'duree' },
  { title: 'Désignation', key: 'designation' },
];
const fieldsStep2 = [
  { title: 'Catégorie', key: 'categorie' },
  { title: 'Date Précédente', key: 'date', type: Date },
  { title: 'Nouvelle Date', key: 'date_2', type: Date },
  { title: 'Durée', key: 'duree' },
  { title: 'Désignation', key: 'designation' },
];
</script>

<template>
  <form @submit.prevent>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Importer des exercices depuis un autre exercice comptable
      </h5>
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
            <base-table :data="form.exercices" :fields="fieldsStep1" />
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
            <base-table :data="form.exercices" :fields="fieldsStep2" />
          </div>
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button
        v-if="phase !== 3"
        type="button"
        class="btn btn-primary"
        @click="phase += 1"
      >
        Suivant
      </button>
      <button v-else type="submit" class="btn btn-primary">Ajouter</button>
    </div>
  </form>
</template>
