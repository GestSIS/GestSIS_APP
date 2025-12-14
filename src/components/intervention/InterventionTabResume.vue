<script setup>
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission';
import { inject, reactive, ref, watchEffect } from 'vue';
import { useInterventionStore } from '../../stores/intervention/Intervention.js';

const interventionStore = useInterventionStore();

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const form = reactive({
  description: '',
});

watchEffect(async () => {
  loading.value = true;
  await interventionStore.fetchIntervention(id);
  form.description = interventionStore.active.data.description;
  loading.value = false;
});

const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION,
);

const awn = inject('awn');
const errors = ref({});
const save = async () => {
  try {
    const res = await interventionStore.saveActiveIntervention({
      id,
      ...form,
    });
    awn.success(res?.message || 'Modifications enregistrées');
  } catch (err) {
    errors.value = err;
    awn.alert(err?.message || "Erreur lors de l'enregistrement");
  }
};
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Résumé</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="save"
          >
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <label for="m-int-resume">Description</label>
          <textarea
            id="m-int-resume"
            v-model="form.description"
            :readonly="!hasEditPermission"
            class="form-control form-control-sm"
            rows="30"
            @blur="save"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
