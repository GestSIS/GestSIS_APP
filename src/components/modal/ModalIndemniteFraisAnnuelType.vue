<script setup>
import { computed, reactive, ref } from 'vue';
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
  actif: 1,
  ...data,
});

const store = useStore();
const comptes = computed(() => store.state.compte.liste);
const categories = computed(() => store.state.ecritureCategorie.liste);

const { closeModal } = useModalStore();

const save = () =>
  this.$store
    .dispatch(
      form?.id
        ? 'updateFraisIndemniteAnnuelType'
        : 'addFraisIndemniteAnnuelType',
      form,
    )
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
        type
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
        v-model="form.type"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['type'] }"
        label="Type"
        :options="[
          { id: 2, designation: 'Indemnité' },
          { id: 3, designation: 'Frais forfaitaire' },
        ]"
      />
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
        v-model="form.ecriture_categorie_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['ecriture_categorie_id'] }"
        label="Catégorie comptable"
        :options="categories"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="fonction-actif-modal"
            v-model="form.cumulable"
            required
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fonction-actif-modal"
            >Cumulable</label
          >
        </div>
      </div>
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
