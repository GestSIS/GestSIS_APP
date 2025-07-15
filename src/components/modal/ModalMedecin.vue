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
const localites = computed(() => store.state.localite.liste);

const { closeModal } = useModalStore();

const save = async () => {
  store
    .dispatch((form.id || 0) === 0 ? 'addMedecin' : 'updateMedecin', form)
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
        {{ form.id ? 'Modifier' : 'Ajouter' }} un médecin
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
        <label for="adresse">Adresse</label>
        <input
          id="adresse"
          v-model="form.adresse"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['adresse'] }"
        />
      </div>
      <base-select
        v-model="form.localite_id"
        placeholder="<Localité>"
        required
        class="mb-3"
        :class="{ 'is-invalid': errors['localite_id'] }"
        label="Localité"
        :options="localites"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="medecin-actif-modal"
            v-model="form.actif"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
          />
          <label class="form-check-label" for="medecin-actif-modal"
            >Actif</label
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
