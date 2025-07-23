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
  remarque: '',
  ...data,
});

const store = useStore();
const grades = computed(() => store.state.grade.liste);

const { closeModal } = useModalStore();

const save = () => {
  store
    .dispatch((form.id || 0) === 0 ? 'addSapeurGrade' : 'editSapeurGrade', form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter une promotion</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Date de la promotion</label>
        <input
          id="cours-date"
          v-model="form.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <base-select
        v-model="form.grade_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['grade_id'] }"
        label="Grade"
        :options="grades"
      />
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="form.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
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
