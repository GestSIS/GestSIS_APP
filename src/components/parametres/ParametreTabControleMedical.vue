<script setup>
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useMedecinStore } from "../../stores/controleMedical/Medecin.js";
import { useControleMedicalTypeStore } from "../../stores/controleMedical/ControleMedicalType.js";

const localiteStore = useLocaliteStore();
const medecinStore = useMedecinStore();
const controleMedicalTypeStore = useControleMedicalTypeStore();
const loadMedecin = medecinStore.fetchMedecins();
const loadType = controleMedicalTypeStore.fetchTypes();
const loadLocalite = localiteStore.fetchLocalites();

await Promise.all([loadMedecin, loadType, loadLocalite]);
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres contrôles médicaux</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-controle-medical-medecin' }"
          >
            Médecins
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-controle-medical-type' }"
          >
            Contrôles médicaux types
          </router-link>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <router-view />
    </div>
  </div>
</template>
