<script setup>
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useMedecinStore } from "../../stores/controleMedical/Medecin.js";
import { useControleMedicalTypeStore } from "../../stores/controleMedical/ControleMedicalType.js";
import ControlesMedicauxService from "/src/services/ControlesMedicauxService.js";
import { computed, ref, watchEffect } from "vue";

const sapeurStore = useSapeurStore();
const medecinStore = useMedecinStore();
const controleMedicalTypeStore = useControleMedicalTypeStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurControlesMedicaux(sapeurStore.active.id);
  loading.value = false;
});

await Promise.all([medecinStore.fetchMedecins(), controleMedicalTypeStore.fetchTypes()]);

const controles = computed(() =>
  sapeurStore.active.controles.map((c) => ({
    ...c,
    controle_medical_type: controleMedicalTypeStore.liste.find(
      (l) => l.id == c.controle_medical_type_id,
    )?.designation,
    medecin: medecinStore.liste.find((l) => l.id == c.medecin_id)?.designation,
  })),
);

const downloadJustificatif = ({ id, filename }) => {
  ControlesMedicauxService.downloadJustificatif(id, filename);
};

const fields = [
  { title: "Type", key: "controle_medical_type" },
  { title: "Médecin", key: "medecin" },
  { title: "Consultation", key: "consultation", type: Date },
  { title: "Validité", key: "validite", type: Date },
  { title: "Désignation", key: "designation" },
  { title: "Accepté", key: "accepter", type: Boolean },
  // { title: 'En cours', key: 'en_cours', type: Boolean },
  // TODO: mise en place du système en_cours pour les contrôles médicaux
  { title: "Doc", slot: "doc" },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Contrôles médicaux</h3>
    </div>
    <form role="form">
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="controles"
          no-data="Aucun contrôle médical"
        >
          <template #doc="{ rowData }">
            <button v-if="rowData.filename" class="btn" @click="downloadJustificatif(rowData)">
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
          </template>
        </base-table>
      </div>
    </form>
  </div>
</template>
