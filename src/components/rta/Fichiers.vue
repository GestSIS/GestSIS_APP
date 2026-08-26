<script setup>
import { computed, reactive, ref } from "vue";
import RtaService from "../../services/RtaService.js";
import { useRtaStore } from "../../stores/rta/Rta.js";
import PdfViewer from "../pdf/PdfViewer.vue";
import EditableTree from "../editable_tree/EditableTree.vue";
import useNotification from "../../composables/useNotification.js";

const rtaStore = useRtaStore();
const awn = useNotification();
const loadError = ref(null);
rtaStore
  .fetchFichiers()
  .catch(
    (err) => (loadError.value = err?.message ?? "Erreur lors de la récupération des données RTA"),
  );

const download = (fichier) => {
  RtaService.downloadFichier(fichier.id, fichier.nom).catch((err) =>
    awn.alert(err?.message ?? "Erreur lors du téléchargement du fichier"),
  );
};

const isPdf = (fichier) => fichier?.nom?.endsWith(".pdf") ?? false;

const fileType = (fichier) => {
  if (fichier.nom.endsWith(".pdf")) return "pdf";
  if (fichier.nom.endsWith(".docx") || fichier.nom.endsWith(".odt")) return "word";
  if (fichier.nom.endsWith(".xlsx") || fichier.nom.endsWith(".ods")) return "excel";
  return "file";
};

const types = {
  pdf: { icon: ["far", "file-pdf"], color: "#e74c3c" },
  word: { icon: ["far", "file-word"], color: "#2980b9" },
  excel: { icon: ["far", "file-excel"], color: "#27ae60" },
  file: { icon: ["far", "file"], color: "#7f8c8d" },
};

const computedFichiers = computed(() =>
  rtaStore.fichiers.map((f) => ({
    ...f,
    key: "f-" + f.id,
    type: fileType(f),
    label: f.nom,
    description: new Date(f.updated_at ?? f.created_at).toLocaleString().slice(0, 16),
  })),
);

const selectedFichier = reactive({ metadata: null, content: null });
const previewLoading = ref(false);
const previewError = ref(null);

const selectFichier = (node) => {
  const fichier = node?.data;
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
          <editable-tree
            :tree="computedFichiers"
            :types="types"
            selectable
            @selected="selectFichier"
          >
            <template #default="{ node }">
              <button
                class="btn btn-sm btn-outline-primary border-0 ms-auto ps-1 pe-1"
                type="button"
                aria-label="Télécharger le fichier"
                @click.stop="download(node.data)"
              >
                <font-awesome-icon :icon="['fas', 'file-arrow-down']" />
              </button>
            </template>
          </editable-tree>
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
