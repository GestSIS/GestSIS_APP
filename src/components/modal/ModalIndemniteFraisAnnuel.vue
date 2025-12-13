<script setup>
import { computed, reactive, ref } from 'vue';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  ...data,
});
import { useUniteStore } from '../../stores/common/Unite.js';

const fonctionStore = useFonctionStore();
const imputationStore = useImputationStore();
const uniteStore = useUniteStore();

const fonctions = computed(() => fonctionStore.liste);
const unites = computed(() => uniteStore.liste);

const { closeModal } = useModalStore();

const save = () =>
  (form?.id
    ? imputationStore.updateFraisIndemniteAnnuel
    : imputationStore.addFraisIndemniteAnnuel)(form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
        {{
          form.type == 'frais' ? 'un frais annuel' : 'une indemnité annuelle'
        }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.fonction_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['fonction_id'] }"
        label="Fonction"
        display-key="nom"
        :options="fonctions"
        :required="true"
        disabled
      />
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
      <div class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          id="quantite"
          v-model="form.quantite"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
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
