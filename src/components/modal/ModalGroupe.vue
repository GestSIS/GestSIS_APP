<script setup>
import { computed, reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useGroupeStore } from "../../stores/groupe/Groupe.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  parent_id: null,
  ...data,
});

const groupeStore = useGroupeStore();
const groupes = computed(() =>
  groupeStore.liste.map((g) => ({
    ...g,
    label: (g.no ? g.no + " " : "") + g.designation,
  })),
);

const { closeModal } = useModalStore();
const save = async () => {
  groupeStore
    .createGroupe(form)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Ajouter un groupe</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="abreviation">No</label>
        <input
          id="no"
          v-model="form.no"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['no'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Nom</label>
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
        v-model="form.parent_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['parent_id'] }"
        label="Groupe parent"
        base-option="-"
        :base-value="null"
        display-key="label"
        :options="groupes"
      />
      <div class="mb-3">
        <div class="form-check">
          <input
            id="modal-type"
            v-model="form.type"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
            :false-value="0"
          />
          <label class="form-check-label" for="modal-type">Groupe d'alarme</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">Ajouter</button>
    </div>
  </form>
</template>
