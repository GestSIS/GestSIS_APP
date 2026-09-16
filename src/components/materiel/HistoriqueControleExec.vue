<script setup>
import { ref } from "vue";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const { articleId, controle } = defineProps({
  articleId: { type: Number, required: true },
  controle: { type: Object, required: true },
});

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const execs = ref([]);
const loadExecs = async () => {
  execs.value = (await ControleExecService.getExecsPourArticle(articleId))
    .filter((e) => e.controle_id === controle.id)
    .sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at));
};
await loadExecs();

const colonnes = [
  { title: "Date", key: "executed_at", type: "date" },
  ...(controle.recurrence_type === "PERIODIQUE"
    ? [{ title: "Échéance", key: "date_echeance", type: "date" }]
    : []),
  { title: "Résultat", slot: "resultat" },
  { title: "Exécuté par", slot: "executeur" },
  { title: "Remarque", key: "remarque_globale" },
  { title: "Actions", slot: "actions" },
];

const { showModal, confirm } = useModalStore();
const awn = useNotification();

const modifier = (exec) =>
  showModal({
    component: "ModalControleExec",
    data: {
      execId: exec.id,
      controleId: exec.controle_id,
      articleId: exec.article_id,
      executed_at: exec.executed_at,
      date_echeance: exec.date_echeance,
      remarque_globale: exec.remarque_globale,
      execTaches: exec.exec_taches,
    },
    callback: loadExecs,
  });

const supprimer = (exec) =>
  confirm(
    "Supprimer ce contrôle ?",
    "Voulez-vous vraiment supprimer cette exécution de contrôle ? Cette action est irréversible.",
  )
    .then(() => ControleExecService.supprimerExec(exec.id))
    .then(loadExecs)
    .catch((err) => awn.alert(err?.message ?? "Impossible de supprimer ce contrôle"));
</script>

<template>
  <base-table
    :data="execs"
    :fields="colonnes"
    :hide-download="true"
    no-data="Aucune exécution enregistrée"
  >
    <template #resultat="{ rowData }">
      <span class="badge" :class="rowData.conforme ? 'bg-success' : 'bg-danger'">
        {{ rowData.conforme ? "Conforme" : "Anomalie" }}
      </span>
    </template>
    <template #executeur="{ rowData }">
      {{ rowData.executeur?.nom }} {{ rowData.executeur?.prenom }}
    </template>
    <template #actions="{ rowData }">
      <button
        v-if="hasEditPermission"
        title="Modifier"
        class="btn btn-outline-secondary border-0"
        @click="modifier(rowData)"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
      <button
        v-if="hasEditPermission"
        title="Supprimer"
        class="btn btn-outline-danger border-0"
        @click="supprimer(rowData)"
      >
        <font-awesome-icon :icon="['far', 'trash-alt']" />
      </button>
    </template>
  </base-table>
</template>
