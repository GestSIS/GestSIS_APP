<script setup>
import { ref } from "vue";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useMedecinStore } from "../../stores/controleMedical/Medecin.js";
import { useControleMedicalTypeStore } from "../../stores/controleMedical/ControleMedicalType.js";
import ParametreMedecin from "./ParametreMedecin.vue";
import ParametreControleMedicalType from "./ParametreControleMedicalType.vue";

const localiteStore = useLocaliteStore();
const medecinStore = useMedecinStore();
const controleMedicalTypeStore = useControleMedicalTypeStore();
const loadMedecin = medecinStore.fetchMedecins();
const loadType = controleMedicalTypeStore.fetchTypes();
const loadLocalite = localiteStore.fetchLocalites();

await Promise.all([loadMedecin, loadType, loadLocalite]);

const tab = ref("medecin");
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres contrôles médicaux</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <a
            class="nav-link"
            :class="{ active: tab === 'medecin' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'medecin'"
          >
            Médecins
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'type' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'type'"
          >
            Contrôles médicaux types
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-medecin v-if="tab === 'medecin'" />
      <parametre-controle-medical-type v-if="tab === 'type'" />
    </div>
  </div>
</template>
