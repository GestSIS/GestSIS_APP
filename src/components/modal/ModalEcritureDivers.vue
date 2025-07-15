<script setup>
import { computed, inject, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  quantite: 0,
  tarif: 0,
  type_unite_id: 1,
  type: 0,
  module: 0,
  ...data,
});

const types = [
  { id: 0, designation: 'Autre' },
  { id: 1, designation: 'Solde' },
  { id: 2, designation: 'Indemnité' },
  { id: 3, designation: 'Frais forfaitaire' },
  { id: 4, designation: 'Frais effectif' },
];

const store = useStore();
const sapeurs = computed(() => store.state.sapeur.liste.filter((s) => s.actif));
const comptes = computed(() => store.state.compte.liste);
const unites = computed(() => store.state.unite.liste);
const categories = computed(() => store.state.ecritureCategorie.liste);
const activeExerciceComptableId = computed(
  () => store.state.exerciceComptable.activeId,
);

const activeUnite = computed(() =>
  unites.value.find((u) => u.id == form.type_unite_id),
);

form.exercice_comptable_id =
  form.exercice_comptable_id ?? activeExerciceComptableId.value;

const { closeModal } = useModalStore();
const awn = inject('awn');

const save = async () => {
  if (!activeUnite.value?.comptable) {
    form.quantite = 1;
  }
  form.total = form?.tarif * form?.quantite;

  store
    .dispatch((form.id || 0) === 0 ? 'addEcriture' : 'updateEcriture', form)
    .then(closeModal)
    .catch((err) => {
      errors.value = {
        ...err,
      };

      if (err.message) {
        awn.alert(errors.value?.message);
      }
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une écriture
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

      <base-select
        v-model="form.sapeur_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['sapeur_id'] }"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
      />
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="form.date"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <base-select
        v-model="form.type_unite_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité"
        display-key="unite"
        :options="unites"
      />
      <div class="row">
        <div v-if="activeUnite?.comptable" class="mb-3 col-4">
          <label for="quantite">Quantité</label>
          <div class="input-group input-group-sm">
            <input
              id="quantite"
              v-model="form.quantite"
              required
              type="string"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
            />
            <span class="input-group-text">{{ activeUnite.abreviation }}</span>
          </div>
        </div>
        <div
          class="mb-3 col-4"
          :class="activeUnite?.comptable ? 'col-4' : 'col-12'"
        >
          <label for="tarif">Tarif</label>
          <div class="input-group input-group-sm">
            <input
              id="tarif"
              v-model="form.tarif"
              required
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
            />
            <span class="input-group-text">CHF</span>
          </div>
        </div>
        <div
          v-if="activeUnite?.comptable"
          class="mb-3 col-4"
          :class="activeUnite?.comptable ? 'col-4' : 'col-12'"
        >
          <label for="tarif">Total</label>
          <div class="input-group input-group-sm">
            <input
              id="tarif"
              type="text"
              readonly
              :value="form?.quantite * form?.tarif || 0"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['tarif'] }"
            />
            <span class="input-group-text">CHF</span>
          </div>
        </div>
      </div>
      <base-select
        v-model="form.compte_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['compte_id'] }"
        label="Compte"
        display-key="label"
        :options="comptes"
      />
      <base-select
        v-model="form.type"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['type'] }"
        label="Type d'écriture"
        :options="types"
      />
      <base-select
        v-model="form.ecriture_categorie_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        label="Catégorie comptable"
        :options="categories"
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
