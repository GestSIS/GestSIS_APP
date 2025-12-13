<script setup>
import { computed, reactive, ref } from 'vue';
import { useMaterielStore } from '../../stores/intervention/Materiel.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  statut: 1,
  ...data,
  type_unite_id: data?.type_unite_id ?? 0,
});

const materielStore = useMaterielStore();
const uniteStore = useUniteStore();
const unites = computed(() => uniteStore.liste);

const { closeModal } = useModalStore();

const save = async () => {
  try {
    if (form.id) {
      await materielStore.updateMateriel(form);
    } else {
      await materielStore.addMateriel(form);
    }
    closeModal();
  } catch (err) {
    errors.value = err;
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} du matériel
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
        <label for="forfait">Forfait</label>
        <input
          id="forfait"
          v-model="form.forfait"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['forfait'] }"
        />
      </div>
      <div class="mb-3">
        <label for="unite">Unité</label>
        <input
          id="unite"
          v-model="form.unite"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['unite'] }"
        />
      </div>
      <base-select
        v-model="form.type_unite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['type_unite_id'] }"
        label="Unité type"
        base-option="-"
        :required="true"
        :base-value="0"
        display-key="unite"
        :options="unites"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="materiel-status-modal"
            v-model="form.statut"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
            :false-value="0"
          />
          <label class="form-check-label" for="materiel-status-modal"
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
