<script setup>
import { computed, reactive, ref } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { DateTime } from "luxon";

const sapeurStore = useSapeurStore();
const interventionStore = useInterventionStore();
sapeurStore.fetchListeSapeur();

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

const responsableMode = ref(
  data?.jalon?.sapeur_id ? "sapeur_id" : data?.jalon?.sapeur ? "sapeur" : "aucun",
);
const listeSapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();

const save = async () => {
  // Format back dates to SQL Format
  form.date_time = DateTime.fromISO(form.date_time2).toFormat(format);

  if (responsableMode.value == "sapeur") {
    delete form.sapeur_id;
    if (!form.sapeur) {
      errors.value.sapeur = "Manquant";
      return;
    }
  } else if (responsableMode.value == "sapeur_id") {
    delete form.sapeur;
    if (!form.sapeur_id) {
      errors.value.sapeur_id = "Manquant";
      return;
    }
  } else {
    form.sapeur_id = null;
    form.sapeur = null;
  }

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
      sapeur_id: err["jalons.0.sapeur_id"],
      sapeur: err["jalons.0.sapeur"],
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
      <label class="form-check-label" for="flexSwitchCheckDefault"> Responsable </label>
      <div class="form-check">
        <input
          id="responsable_aucun"
          v-model="responsableMode"
          class="form-check-input"
          type="radio"
          name="responsable"
          value="aucun"
        />
        <label class="form-check-label" for="responsable_aucun">Aucun</label>
      </div>
      <div class="form-check">
        <input
          id="responsable_sapeur_id"
          v-model="responsableMode"
          class="form-check-input"
          type="radio"
          name="responsable"
          value="sapeur_id"
        />
        <label class="form-check-label" for="responsable_sapeur_id">Sapeur</label>
      </div>
      <div class="form-check">
        <input
          id="responsable_sapeur"
          v-model="responsableMode"
          class="form-check-input"
          type="radio"
          name="responsable"
          value="sapeur"
        />
        <label class="form-check-label" for="responsable_sapeur">Externe au SIS</label>
      </div>
      <base-select
        v-if="responsableMode == 'sapeur_id'"
        v-model="form.sapeur_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['sapeur_id'] }"
        display-key="nom_prenom"
        :options="listeSapeurs"
      />
      <div v-if="responsableMode == 'sapeur'" class="mb-3">
        <input
          v-model="form.sapeur"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['sapeur'] }"
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
