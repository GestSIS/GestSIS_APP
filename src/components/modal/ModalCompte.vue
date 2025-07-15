<script setup>
import { reactive, ref } from 'vue';
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
  ...data,
});

const store = useStore();
const { closeModal } = useModalStore();

const save = async () => {
  store
    .dispatch(form?.id ? 'updateCompte' : 'addCompte', form)
    .then(closeModal)
    .catch(
      (err) =>
        (errors.value = {
          ...err,
        }),
    );
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un compte
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="numero">Numéro</label>
        <input
          id="numero"
          v-model="form.numero"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['numero'] }"
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
      <base-select
        v-model="form.produit"
        :required="true"
        class="mb-3"
        label="Type comptable"
        :options="[
          { id: 0, designation: 'Charge' },
          { id: 1, designation: 'Produit' },
        ]"
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
