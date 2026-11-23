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
    <div class="col-sm-12 col-xl-3">
      <base-card title="Paramètres Absences">
        <template #default>
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
        </template>
      </base-card>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-absence v-if="tab === 'absence'" />
    </div>
  </div>
</template>
