<script setup>
import { computed, ref } from "vue";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "/src/composables/permissions.js";
import InterventionGroupe from "/src/components/intervention/InterventionGroupe.vue";
import InterventionPhase from "/src/components/intervention/InterventionPhase.vue";
import InterventionPresences from "/src/components/intervention/InterventionPresences.vue";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";

const interventionStore = useInterventionStore();

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const dismissedWarning = ref(false);

const dataInter = computed(() => interventionStore.active.data);

const hasEditPermission = useHasPermission(permissions.INTERVENTION.MODIFICATION);
</script>

<template>
  <div class="row">
    <div class="col-xs-12 col-md-12">
      <div
        v-if="!dismissedWarning && dataInter.statut > 2 && hasEditPermission"
        class="alert alert-dismissible alert-warning"
      >
        <button type="button" class="btn-close" @click="dismissedWarning = true"></button>
        Intervention déjà imputée, impossible de modifier les présences.
      </div>
    </div>
    <InterventionGroupe :id="id" />
    <InterventionPhase :id="id" />
    <InterventionPresences :id="id" />
  </div>
</template>
