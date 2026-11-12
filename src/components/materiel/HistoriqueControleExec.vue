<script setup>
import { computed, ref } from "vue";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";
import { useSubmit } from "../../composables/useSubmit.js";

const { articleId, controle } = defineProps({
  articleId: { type: Number, required: true },
  controle: { type: Object, required: true },
});

const hasControlePermission = useHasPermission(permissions.MATERIEL.CONTROLE);

const execs = ref([]);
const loadExecs = async () => {
  execs.value = (await ControleExecService.getExecsPourArticle(articleId))
    .filter((e) => e.controle_id === controle.id)
    .sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at));
};
await loadExecs();

const composantsDe = (exec) =>
  (exec.exec_taches ?? []).filter((t) => t.type_snapshot === "COMPOSANT");

const colonnes = computed(() => [
  { title: "Date", key: "executed_at", type: "date" },
  ...(controle.recurrence_type === "PERIODIQUE"
    ? [{ title: "Échéance", key: "date_echeance", type: "date" }]
    : []),
  { title: "Résultat", slot: "resultat" },
  ...(execs.value.some((e) => composantsDe(e).length > 0)
    ? [{ title: "Composants", slot: "composants" }]
    : []),
  { title: "Exécuté par", slot: "executeur" },
  { title: "Remarque", key: "remarque_globale" },
  { title: "Actions", slot: "actions" },
]);

const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();

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

const supprimer = async (exec) => {
  if (
    !(await confirm(
      "Supprimer ce contrôle ?",
      "Voulez-vous vraiment supprimer cette exécution de contrôle ? Cette action est irréversible.",
    ))
  ) {
    return;
  }
  const { ok } = await submit(
    () => ControleExecService.supprimerExec(exec.id),
    "Impossible de supprimer ce contrôle",
    "Contrôle supprimé.",
  );
  if (ok) {
    loadExecs();
  }
};
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
    <template #composants="{ rowData }">
      <div v-for="c in composantsDe(rowData)" :key="c.id">
        {{ c.nom_snapshot }} : {{ c.article?.numero ?? "—" }}
      </div>
    </template>
    <template #executeur="{ rowData }">
      {{ rowData.executeur?.nom }} {{ rowData.executeur?.prenom }}
    </template>
    <template #actions="{ rowData }">
      <button
        v-if="hasControlePermission"
        title="Modifier"
        class="btn btn-outline-secondary border-0"
        @click="modifier(rowData)"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
      <button
        :disabled="isSubmitting"
        v-if="hasControlePermission"
        title="Supprimer"
        class="btn btn-outline-danger border-0"
        @click="supprimer(rowData)"
      >
        <font-awesome-icon :icon="['far', 'trash-alt']" />
      </button>
    </template>
  </base-table>
</template>
