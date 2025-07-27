<script setup>
import { computed, reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useStore } from 'vuex';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  amendable: true,
  statut: 1,
  ...data,
});

const store = useStore();
const { closeModal } = useModalStore();

const save = async () => {
  form.statut = form.statut ? 1 : 0;
  store
    .dispatch(
      (form.id || 0) === 0 ? 'addExerciceCategorie' : 'updateExerciceCategorie',
      form,
    )
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} une catégorie d'exercice
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="form.tri"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
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
        <label for="duree_base">Durée standard</label>
        <input
          id="duree_base"
          v-model="form.duree_base"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['duree_base'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="amendable-modal"
            v-model="form.amendable"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="amendable-modal"
            >Amendable</label
          >
        </div>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="status-modal"
            v-model="form.statut"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
          />
          <label class="form-check-label" for="status-modal">Actif</label>
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
