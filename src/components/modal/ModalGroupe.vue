<script setup>
import { computed, reactive } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useGroupeStore } from "../../stores/groupe/Groupe.js";
import { useSubmit } from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
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
const filteredGroupes = computed(() => {
  if (!form.id) {
    return groupes.value;
  }
  // Un groupe ne peut pas devenir son propre descendant : on exclut le
  // groupe édité et tous ses enfants de la liste des parents possibles.
  const rec = (groupeId) => {
    const children = groupeStore.liste.filter((g) => g.parent_id == groupeId);
    return children.flatMap((g) => [g.id, ...rec(g.id)]);
  };
  const excludedIds = new Set([form.id, ...rec(form.id)]);
  return groupes.value.filter((g) => !excludedIds.has(g.id));
});

const { closeModal } = useModalStore();
const save = async () => {
  const { ok } = await submit(() =>
    form.id
      ? groupeStore.updateGroupe({ groupeId: form.id, data: form })
      : groupeStore.createGroupe(form),
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un groupe</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal()"></button>
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
        :options="filteredGroupes"
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
      <button :disabled="isSubmitting" type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
