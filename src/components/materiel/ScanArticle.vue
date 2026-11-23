<script setup>
import { ref, useTemplateRef } from "vue";
import { useNotification } from "../../composables/useNotification.js";
import { formatDate } from "../../tools/formatters.js";

// Champ de saisie au scanner : le numéro scanné (suivi d'un « return »)
// désigne l'article correspondant parmi `articles` (numéro exact, sans tenir
// compte de la casse ni des espaces), émis via `scan`. Le champ se vide
// ensuite pour le scan suivant. C'est au parent de placer l'article (ligne
// vide ou nouvelle ligne).
const { articles, dejaSelectionnes, accepteInconnu } = defineProps({
  articles: { type: Array, required: true },
  // Ids des articles déjà dans la liste du parent : un nouveau scan est refusé.
  dejaSelectionnes: { type: Set, default: () => new Set() },
  // Un numéro absent de `articles` est émis via `inconnu` au lieu d'être refusé.
  accepteInconnu: { type: Boolean, default: false },
});
const emit = defineEmits(["scan", "vide", "inconnu"]);

const awn = useNotification();
const numeroScanne = ref("");

const scanner = () => {
  const saisi = numeroScanne.value.trim();
  const numero = saisi.toLowerCase();
  numeroScanne.value = "";
  if (numero === "") {
    emit("vide");
    return;
  }

  const tousCorrespondants = articles.filter((a) => a.numero?.trim().toLowerCase() === numero);
  // À numéro égal, un article supprimé ne masque pas un article en service.
  const correspondants = tousCorrespondants.filter((a) => !a.supprime_le);
  const disponibles = correspondants.filter((a) => !dejaSelectionnes.has(a.id));

  if (tousCorrespondants.length === 0 && accepteInconnu) {
    emit("inconnu", saisi);
  } else if (tousCorrespondants.length === 0) {
    awn.warning(`Aucun article avec le numéro « ${numero} »`);
  } else if (correspondants.length === 0) {
    const supprime = tousCorrespondants[0];
    awn.warning(`Article supprimé le ${formatDate(supprime.supprime_le)}`);
  } else if (disponibles.length === 0) {
    awn.warning(`L'article « ${numero} » est déjà dans la liste`);
  } else if (disponibles.length > 1) {
    awn.warning(`Plusieurs articles portent le numéro « ${numero} », sélectionnez-le à la main`);
  } else {
    emit("scan", disponibles[0]);
  }
};

const input = useTemplateRef("input");
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div class="input-group input-group-sm mb-2">
    <span class="input-group-text">
      <font-awesome-icon :icon="['fas', 'barcode']" />
    </span>
    <input
      ref="input"
      v-model="numeroScanne"
      type="text"
      class="form-control"
      title="Scanner ou saisir un numéro d'article puis Entrée"
      placeholder="Scanner ou saisir un numéro d'article puis Entrée"
      aria-label="Scanner un article"
      @keydown.enter.prevent="scanner"
    />
  </div>
</template>
