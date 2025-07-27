<script setup>
import { inject, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
await store.dispatch('fetchAbsenceParams');

const errors = ref({});
const params = ref({
  actif: false,
  ...store.state.absenceParam.params,
});

const awn = inject('awn');
const save = async () => {
  store
    .dispatch('updateAbsenceParams', params.value)
    .then((res) => {
      errors.value = {};
      awn.success(res?.message || 'Modifications enregistrées');
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(e?.message || "Erreur lors de l'enregistrement");
    });
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres pour absences</h3>
          <button type="button" class="btn btn-primary" @click="save">
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
                    content:
                      'Les utilisateurs pourront saisir des absences individuellement',
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
