<script setup>
import { ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useAbsenceParamStore } from "../../stores/absence/AbsenceParam.js";
import useSubmit from "../../composables/useSubmit.js";

const absenceParamStore = useAbsenceParamStore();
await absenceParamStore.fetchParams();

const { errors, isSubmitting, submit } = useSubmit();
const params = ref({
  actif: false,
  ...absenceParamStore.params,
});

const awn = useNotification();
const save = async () => {
  const { ok, data } = await submit(() => absenceParamStore.updateAbsenceParams(params.value));
  if (ok) {
    awn.success(data?.message || "Modifications enregistrées");
  }
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres pour absences</h3>
          <button :disabled="isSubmitting" type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
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
        </div>
      </div>
    </div>
  </div>
</template>
