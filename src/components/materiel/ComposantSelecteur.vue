<script setup>
import { computed, useTemplateRef } from "vue";
import ScanArticle from "./ScanArticle.vue";

// Article d'une tâche composant : un champ de scan, et une liste pour choisir à
// la main (ex : plusieurs articles portant le même numéro). Émet `avancer` après
// un scan ou sur Entrée dans le champ vide, pour passer au composant suivant.
const { articles, dejaSelectionnes } = defineProps({
  // Articles déjà libellés (`label`) : ceux qui peuvent être choisis ici.
  articles: { type: Array, required: true },
  // Ids des articles déjà utilisés ailleurs dans la fenêtre.
  dejaSelectionnes: { type: Set, default: () => new Set() },
  required: { type: Boolean, default: false },
});
const emit = defineEmits(["avancer"]);
const model = defineModel({ type: Number, default: null });

const options = computed(() =>
  articles.filter((a) => a.id === model.value || !dejaSelectionnes.has(a.id)),
);

// L'option vide doit avoir la valeur "" : c'est ce que le navigateur considère
// comme vide pour `required`. Le modèle reste null quand aucun article n'est choisi.
const selection = computed({
  get: () => model.value ?? "",
  set: (value) => {
    model.value = value === "" ? null : value;
  },
});

const choisir = (article) => {
  model.value = article.id;
  emit("avancer");
};

const scan = useTemplateRef("scan");
defineExpose({ focus: () => scan.value?.focus() });
</script>

<template>
  <div style="min-width: 110px">
    <scan-article
      ref="scan"
      :articles="articles"
      :deja-selectionnes="dejaSelectionnes"
      @scan="choisir"
      @vide="emit('avancer')"
    />
    <base-select
      v-model="selection"
      :options="options"
      :required="required"
      base-value=""
      display-key="label"
      base-option="Aucun article"
    />
  </div>
</template>
