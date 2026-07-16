<script setup>
import { computed } from "vue";
import { useMedecinStore } from "../../stores/controleMedical/Medecin.js";
import { useControleMedicalTypeStore } from "../../stores/controleMedical/ControleMedicalType.js";
import MesInfosService from "../../services/MesInfosService";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";

const infosStore = useMesInfosStore();
const medecinStore = useMedecinStore();
const controleMedicalTypeStore = useControleMedicalTypeStore();

Promise.all([
  infosStore.fetchMesControlesMedicaux(),
  medecinStore.fetchMedecins(),
  controleMedicalTypeStore.fetchTypes(),
]);

const controlesMedicaux = computed(() =>
  infosStore.controlesMedicaux
    .slice()
    .sort((a, b) => b.validite?.localeCompare(a.validite))
    .map((c) => ({
      ...c,
      type: controleMedicalTypeStore.liste.find((t) => t.id == c.controle_medical_type_id)
        ?.designation,
      medecin: medecinStore.liste.find((m) => m.id == c.medecin_id)?.designation,
    })),
);

const downloadJustificatif = ({ id, filename }) => {
  MesInfosService.downloadMonJustificatif(id, filename);
};
const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }

  if ((dataItem.validite && Date.parse(dataItem.validite) < new Date()) || !dataItem.accepter) {
    return "table-danger";
  }
};

const fields = [
  { title: "Type", key: "type" },
  { title: "Medecin", key: "medecin" },
  { title: "Consultation", key: "consultation", type: Date },
  { title: "Validité", key: "validite", type: Date },
  { title: "Designation", key: "designation" },
  { title: "Accepté", key: "accepter", type: Boolean },
  // { title: 'En cours', key: 'en_cours', type: Boolean },
  {
    title: "Doc",
    key: "doc",
    slot: "doc",
    titleClass: "align-middle text-center",
    columnClass: "align-middle text-center",
  },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes contrôles médicaux</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="controlesMedicaux"
        :selectable="true"
        :hide-download="true"
        :row-class="onRowClass"
        no-data="Aucun contrôle médical"
      >
        <template #doc="{ rowData }">
          <button v-if="rowData.filename" class="btn" @click="downloadJustificatif(rowData)">
            <font-awesome-icon :icon="['far', 'file-pdf']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
