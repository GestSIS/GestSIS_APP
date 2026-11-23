<script setup>
import { ref } from "vue";
import { useAbsenceParamStore } from "../../stores/absence/AbsenceParam.js";
import { useSubmit } from "../../composables/useSubmit.js";

const absenceParamStore = useAbsenceParamStore();
await absenceParamStore.fetchParams();

const { errors, isSubmitting, submit } = useSubmit();
const params = ref({
  actif: false,
  ...absenceParamStore.params,
});

const save = async () => {
  await submit(
    () => absenceParamStore.updateAbsenceParams(params.value),
    "Erreur lors de l'enregistrement",
    "Modifications enregistrées",
  );
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <base-card title="Paramètres pour absences">
        <template #header>
          <button :disabled="isSubmitting" type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </template>
        <template #body>
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                id="module-absence"
                v-model="params.actif"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="module-absence"
                >Activer le module absence<font-awesome-icon
                  v-tooltip.bottom="{
                    content: 'Les utilisateurs pourront saisir des absences individuellement',
                  }"
                  class="ms-1"
                  :icon="['far', 'question-circle']"
              /></label>
            </div>
          </div>
        </template>
      </base-card>
    </div>
  </div>
</template>
