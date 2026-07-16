<script setup>
import { reactive, ref } from "vue";
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useModalStore } from "../../stores/common/Modal.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  statut: 1,
  amende: false,
  ...data,
});

const excuseTypeStore = useExcuseTypeStore();
const { closeModal } = useModalStore();

const save = async () => {
  const action =
    (form.id || 0) === 0 ? excuseTypeStore.addExcuseType : excuseTypeStore.updateExcuseType;
  action(form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} une excuse type</h5>
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
        <label for="abreviation">Abréviation</label>
        <input
          id="abreviation"
          v-model="form.abreviation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
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
        <div class="form-check">
          <input
            id="amendable-modal"
            v-model="form.amende"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="amendable-modal">Amende</label>
        </div>
      </div>
      <base-select
        v-model="form.statut"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['compte_id'] }"
        label="Disponibilité"
        :options="[
          { id: 0, designation: 'Désactivé' },
          { id: 1, designation: 'Exercice + S\'excuser' },
          { id: 2, designation: 'Exercice' },
        ]"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
