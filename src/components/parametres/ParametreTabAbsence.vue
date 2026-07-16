<script setup>
import { ref } from "vue";
import { useAbsenceParamStore } from "../../stores/absence/AbsenceParam.js";
import ParametreAbsence from "./ParametreAbsence.vue";

const absenceParamStore = useAbsenceParamStore();
await absenceParamStore.fetchParams();

const tab = ref("absence");
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres Absences</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <a
            class="nav-link"
            :class="{ active: tab === 'absence' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'absence'"
          >
            Général
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-absence v-if="tab === 'absence'" />
    </div>
  </div>
</template>
