<script setup>
import { ref, useTemplateRef } from "vue";
import useNotification from "../../composables/useNotification.js";

// Champ de saisie au scanner : le numéro scanné (suivi d'un « return »)
// désigne l'article correspondant parmi `articles` (numéro exact, sans tenir
// compte de la casse ni des espaces), émis via `scan`. Le champ se vide
// ensuite pour le scan suivant. C'est au parent de placer l'article (ligne
// vide ou nouvelle ligne).
const { articles, dejaSelectionnes } = defineProps({
  articles: { type: Array, required: true },
  // Ids des articles déjà dans la liste du parent : un nouveau scan est refusé.
  dejaSelectionnes: { type: Set, default: () => new Set() },
});
const emit = defineEmits(["scan"]);

const awn = useNotification();
const numeroScanne = ref("");

const scanner = () => {
  const numero = numeroScanne.value.trim().toLowerCase();
  numeroScanne.value = "";
  if (numero === "") {
    return;
  }

  const correspondants = articles.filter((a) => a.numero?.trim().toLowerCase() === numero);
  const disponibles = correspondants.filter((a) => !dejaSelectionnes.has(a.id));

  if (correspondants.length === 0) {
    awn.warning(`Aucun article avec le numéro « ${numero} »`);
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
      placeholder="Scanner ou saisir un numéro d'article puis Entrée"
      aria-label="Scanner un article"
      @keydown.enter.prevent="scanner"
    />
  </div>
</template>
