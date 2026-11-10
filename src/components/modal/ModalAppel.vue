<script setup>
import { computed, reactive, watch } from "vue";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useTelephoneStore } from "../../stores/sapeur/Telephone.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { DateTime } from "luxon";
import BaseAutocomplete from "/src/components/base/BaseAutocomplete.vue";
import useSubmit from "../../composables/useSubmit.js";

const interventionStore = useInterventionStore();
const telephoneStore = useTelephoneStore();
telephoneStore.fetchTelephones();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const form = reactive({
  intervention_id: interventionStore.active.id,
  ...data.appel,
  date2: DateTime.fromSQL(data.appel.date)?.toISO()?.slice(0, 16),
});
const format = "yyyy-MM-dd HH:mm";

const min = DateTime.fromSQL(data.min)?.toISO();
const max = DateTime.fromSQL(data.max)?.toISO();

const listTelephones = computed(() => telephoneStore.liste);

const { closeModal } = useModalStore();

watch(
  () => form.nom,
  () => {
    let result = listTelephones.value.filter((t) => form.nom.localeCompare(t.nom) === 0);
    if (result.length > 0) {
      form.numero = result[0].numero;
    }
  },
);

const save = async () => {
  // Format back dates to SQL Format
  form.date = DateTime.fromISO(form.date2).toFormat(format);

  const { ok } = await submit(() =>
    form.id
      ? interventionStore.editInterventionAppel(form)
      : interventionStore.addInterventionAppel(form),
  );
  if (ok) {
    closeModal();
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un appel</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="heure">Heure</label>
        <input
          id="heure"
          v-model="form.date2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['appels.0.date'] }"
          :min="min"
          :max="max"
        />
      </div>
      <div class="mb-3">
        <base-autocomplete
          v-model="form.nom"
          :items="listTelephones.map((t) => t.nom)"
          :error="!!errors['appels.0.nom']"
          title="Correspondant"
        />
      </div>
      <div class="mb-3">
        <label for="numero">Numéro</label>
        <input
          id="numero"
          v-model="form.numero"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['appels.0.numero'] }"
        />
      </div>
      <div class="mb-3">
        <label for="commentaire">Commentaire</label>
        <textarea
          id="commentaire"
          v-model="form.commentaire"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['appels.0.commentaire'] }"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="button" class="btn btn-primary" @click="save()">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </div>
</template>
