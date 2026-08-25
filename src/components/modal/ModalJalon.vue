<script setup>
import { reactive, ref } from "vue";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { DateTime } from "luxon";

const interventionStore = useInterventionStore();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  intervention_id: interventionStore.active.id,
  ...data.jalon,
  date_time2: DateTime.fromSQL(data.jalon.date_time)?.toISO()?.slice(0, 16),
});
const format = "yyyy-MM-dd HH:mm";

const min = DateTime.fromSQL(data.min)?.toISO();
const max = DateTime.fromSQL(data.max)?.toISO();

const { closeModal } = useModalStore();

const save = async () => {
  // Format back dates to SQL Format
  form.date_time = DateTime.fromISO(form.date_time2).toFormat(format);

  try {
    if (form.id) {
      await interventionStore.editInterventionJalon(form);
    } else {
      await interventionStore.addInterventionJalon(form);
    }
    closeModal();
  } catch (err) {
    errors.value = {
      ...err,
      date_time: err["jalons.0.date_time"],
      titre: err["jalons.0.titre"],
      description: err["jalons.0.description"],
    };
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un jalon</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="heure">Heure</label>
        <input
          id="heure"
          v-model="form.date_time2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date_time'] }"
          :min="min"
          :max="max"
        />
      </div>
      <div class="mb-3">
        <label for="titre">Titre</label>
        <input
          id="titre"
          v-model="form.titre"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['titre'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </div>
</template>
