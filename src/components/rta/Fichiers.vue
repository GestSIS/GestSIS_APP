<script setup>
import RtaService from '../../services/RtaService.js';
import { useRtaStore } from '../../stores/rta/Rta.js';

const rtaStore = useRtaStore();
rtaStore.fetchFichiers();

const download = (fichier) => {
  RtaService.downloadFichier(fichier.id, fichier.nom);
};

const fields = [
  { key: 'nom', title: 'Fichier' },
  { key: 'created_at', title: 'Créé le', type: 'datetime' },
  { key: 'updated_at', title: 'Mise à jour le', type: 'datetime' },
  { key: 'id', title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">GestSIS</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :fields="fields" :data="rtaStore.fichiers">
        <template #actions="{ rowData }">
          <button class="btn" @click="download(rowData)">
            <font-awesome-icon
              v-if="rowData.nom.endsWith('.pdf')"
              :icon="['far', 'file-pdf']"
            />
            <font-awesome-icon
              v-else-if="
                rowData.nom.endsWith('.docx') || rowData.nom.endsWith('.odt')
              "
              :icon="['far', 'file-word']"
            />
            <font-awesome-icon
              v-else-if="
                rowData.nom.endsWith('.xlsx') || rowData.nom.endsWith('.ods')
              "
              :icon="['far', 'file-excel']"
            />
            <font-awesome-icon v-else :icon="['far', 'file']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
