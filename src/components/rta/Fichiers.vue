<script setup>
import { reactive, ref } from "vue";
import RtaService from "../../services/RtaService.js";
import { useRtaStore } from "../../stores/rta/Rta.js";
import PdfViewer from "../pdf/PdfViewer.vue";
import useNotification from "../../composables/useNotification.js";

const rtaStore = useRtaStore();
const awn = useNotification();
const loading = ref(true);
const loadError = ref(null);
rtaStore
  .fetchFichiers()
  .catch(
    (err) => (loadError.value = err?.message ?? "Erreur lors de la récupération des données RTA"),
  )
  .finally(() => (loading.value = false));

const download = (fichier) => {
  RtaService.downloadFichier(fichier.id, fichier.nom).catch((err) =>
    awn.alert(err?.message ?? "Erreur lors du téléchargement du fichier"),
  );
};

const isPdf = (fichier) => fichier?.nom?.endsWith(".pdf") ?? false;

const selectedFichier = reactive({ metadata: null, content: null });
const previewLoading = ref(false);
const previewError = ref(null);

const selectFichier = (fichier) => {
  if (!fichier) {
    return;
  }
  selectedFichier.metadata = fichier;
  selectedFichier.content = null;
  previewError.value = null;
  if (isPdf(fichier)) {
    previewLoading.value = true;
    RtaService.downloadFichier(fichier.id)
      .then((response) => {
        selectedFichier.content = response.data;
      })
      .catch((err) => {
        previewError.value = err?.message ?? "Erreur lors de la récupération du fichier";
      })
      .finally(() => (previewLoading.value = false));
  }
};

const fields = [
  { key: "nom", title: "Fichier" },
  { key: "created_at", title: "Créé le", type: "datetime" },
  { key: "updated_at", title: "Mise à jour le", type: "datetime" },
  { key: "id", title: "Actions", slot: "actions" },
];
</script>

<template>
  <div v-if="loadError" class="alert alert-danger" role="alert">
    {{ loadError }}
  </div>
  <div class="row">
    <div class="col-3">
      <base-card>
        <template #header>
          <h3 class="card-title m-0">GestSIS</h3>
        </template>
        <template #body-table>
          <base-table
            :fields="fields"
            :data="rtaStore.fichiers"
            :loading="loading"
            selectable
            @selected="selectFichier"
          >
            <template #actions="{ rowData }">
              <button class="btn" @click.stop="download(rowData)">
                <font-awesome-icon
                  v-if="rowData.nom.endsWith('.pdf')"
                  :icon="['far', 'file-pdf']"
                />
                <font-awesome-icon
                  v-else-if="rowData.nom.endsWith('.docx') || rowData.nom.endsWith('.odt')"
                  :icon="['far', 'file-word']"
                />
                <font-awesome-icon
                  v-else-if="rowData.nom.endsWith('.xlsx') || rowData.nom.endsWith('.ods')"
                  :icon="['far', 'file-excel']"
                />
                <font-awesome-icon v-else :icon="['far', 'file']" />
              </button>
            </template>
          </base-table>
        </template>
      </base-card>
    </div>
    <div class="col-9">
      <base-card>
        <template v-if="selectedFichier.metadata" #header>
          <div>
            <h3 class="card-title m-0">{{ selectedFichier.metadata.nom }}</h3>
            <em>{{
              new Date(selectedFichier.metadata.updated_at ?? selectedFichier.metadata.created_at)
                .toLocaleString()
                .slice(0, 16)
            }}</em>
          </div>
          <button class="btn btn-sm btn-primary" @click="download(selectedFichier.metadata)">
            <font-awesome-icon :icon="['fas', 'download']" />
            Télécharger
          </button>
        </template>
        <template #body>
          <div v-if="!selectedFichier.metadata">Sélectionnez un fichier</div>
          <div v-else-if="previewLoading">Chargement...</div>
          <div v-else-if="previewError" class="alert alert-danger mb-0" role="alert">
            {{ previewError }}
          </div>
          <pdf-viewer
            v-else-if="isPdf(selectedFichier.metadata)"
            :pdf-data="selectedFichier.content"
          />
          <div v-else>Aperçu non disponible pour ce type de fichier</div>
        </template>
      </base-card>
    </div>
  </div>
</template>
