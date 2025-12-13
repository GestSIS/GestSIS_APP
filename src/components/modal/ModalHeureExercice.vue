<script setup>
import { computed, reactive, ref } from 'vue';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { useHeureExerciceStore } from '../../stores/exercice/HeureExercice.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useUniteStore } from '../../stores/common/Unite.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const heureExerciceStore = useHeureExerciceStore();
const uniteStore = useUniteStore();

const errors = ref({});
const form = reactive({
  ...data,
});

const comptes = computed(() => compteStore.liste);
const unites = computed(() => uniteStore.liste);
const categories = computed(() => ecritureCategorieStore.liste);

const { closeModal } = useModalStore();

const save = () => {
  const action =
    (form.id || 0) === 0
      ? heureExerciceStore.addExerciceHeure
      : heureExerciceStore.updateExerciceHeure;
  return action(form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une heure additionelle pour
        exercice
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="montant">Montant</label>
        <input
          id="montant"
          v-model="form.montant"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['montant'] }"
        />
      </div>
      <base-select
        v-model="form.type_unite_id"
        :required="true"
        class="mb-3"
        label="Unité"
        display-key="unite"
        base-option="&lt;Unité&gt;"
        :options="unites"
        :select-class="{ 'is-invalid': errors['type_unite_id'] }"
      />
      <base-select
        v-model="form.compte_id"
        :required="true"
        class="mb-3"
        label="Compte"
        base-option="&lt;Compte&gt;"
        :options="comptes"
        :select-class="{ 'is-invalid': errors['compte_id'] }"
      />
      <base-select
        v-model="form.ecriture_categorie_id"
        :required="true"
        class="mb-3"
        label="Catégorie comptable"
        base-option="&lt;Catégorie comptable&gt;"
        :options="categories"
        :select-class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
      />
      <base-select
        v-model="form.type"
        :required="true"
        class="mb-3"
        label="Type"
        :options="[
          // { id: 0, designation: 'Autre' },
          { id: 1, designation: 'Solde' },
          { id: 2, designation: 'Indemnité' },
          // { id: 3, designation: 'Frais forfaitaire' },
          // { id: 4, designation: 'Frais effectif' },
          // { id: 5, designation: 'Charges AVS/AC' },
        ]"
        :select-class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>
