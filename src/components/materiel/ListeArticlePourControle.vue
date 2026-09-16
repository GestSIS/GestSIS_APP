<script setup>
import { computed, ref, watch } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useCouleurStore } from "../../stores/materiel/Couleur.js";
import { indexedData } from "../../tools/index.js";
import { emplacementIdPourArticle } from "../../tools/materiel.js";
import ArticleService from "../../services/materiel/ArticleService.js";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";
import TableArticlePourControle from "./TableArticlePourControle.vue";

const { id } = defineProps({
  id: { type: String, required: true },
});

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const controleStore = useControleStore();
const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const sapeurStore = useSapeurStore();
const couleurStore = useCouleurStore();

await Promise.all([
  controleStore.fetchControles(),
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  sapeurStore.fetchListeSapeur(),
  couleurStore.fetchCouleurs(),
]);

const controle = computed(() => controleStore.liste.find((c) => c.id === parseInt(id)));
const materielTypeIds = computed(
  () => controle.value?.materiel_types?.map((mt) => mt.materiel_type_id) ?? [],
);
const materielTypeParId = computed(() => indexedData(materielTypeStore.liste));

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));

const linearEmplacements = (emplacementId) => {
  if (emplacementId === null) {
    return [];
  }
  const emplacement = indexedEmplacements.value[emplacementId] ?? null;
  if (emplacement === null) {
    return [];
  }
  return [...linearEmplacements(emplacement.parent_id), emplacement];
};

const enrichir = (article, type, dernieresExecutions) => {
  const emplacementId = emplacementIdPourArticle(article);
  return {
    ...article,
    type,
    emplacements: linearEmplacements(emplacementId),
    nbLavages: (article.lavages ?? []).length,
    sapeur: indexedSapeurs.value[article.sapeur_id]?.nom_prenom ?? "",
    emplacement: indexedEmplacements.value[emplacementId]?.designation ?? "",
    emplacement_sort:
      (indexedSapeurs.value[article.sapeur_id]?.nom_prenom ?? "") +
      "ZZZZ" +
      (indexedEmplacements.value[emplacementId]?.designation ?? ""),
    derniere_execution: dernieresExecutions[article.id]?.derniere_execution ?? null,
    nb_executions: dernieresExecutions[article.id]?.nb_executions ?? 0,
    dernier_controle_echec: dernieresExecutions[article.id]?.dernier_controle_echec ?? false,
  };
};

const groupedArticles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  const [resultats, dernieresExecutions] = await Promise.all([
    Promise.all(materielTypeIds.value.map((typeId) => ArticleService.getParMaterielType(typeId))),
    ControleExecService.getDernieresExecutions(parseInt(id)),
  ]);
  groupedArticles.value = materielTypeIds.value.map((typeId, index) => ({
    key: typeId,
    label: materielTypeParId.value[typeId]?.designation,
    data: resultats[index]
      .filter((a) => a.statut)
      .map((a) => enrichir(a, materielTypeParId.value[typeId], dernieresExecutions)),
  }));
  loading.value = false;
};
// Uniquement sur changement de contrôle affiché : un watchEffect retracerait
// toute la chaîne réactive dérivée de controleStore, et se redéclencherait
// pour rien dès qu'un autre composant (ex: la modale d'exécution) refait
// controleStore.fetchControles().
watch(() => id, loadArticles, { immediate: true });

const { showModal } = useModalStore();
const nouveauControle = () =>
  showModal({
    component: "ModalControleExec",
    data: { controleId: controle.value.id },
    callback: loadArticles,
    size: 2,
  });
</script>

<template>
  <base-card>
    <template #title>Articles concernés</template>
    <template #header>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary btn-sm"
        @click="nouveauControle"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
        Nouveau contrôle
      </button>
    </template>
    <template #body-table>
      <div v-if="materielTypeIds.length === 0" class="text-muted p-3">
        Aucun type de matériel associé à ce contrôle
      </div>
      <table-article-pour-controle
        v-else
        :loading="loading"
        :articles="groupedArticles"
        :controle="controle"
        :refresh="loadArticles"
      />
    </template>
  </base-card>
</template>
