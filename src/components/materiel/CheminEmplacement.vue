<script setup>
import { computed, ref } from "vue";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { indexedData } from "../../tools/index.js";
import { iconeEtape } from "../../tools/materiel.js";
import TagCouleur from "./TagCouleur.vue";

/**
 * Chemin d'un emplacement en étiquettes : « Courtételle › Transport 3 › Partie arrière ».
 * Au-delà de `max` niveaux, les niveaux du milieu sont repliés en « … » (chemin complet au
 * survol, et au clic si `depliable`). Les couleurs viennent du store des couleurs, que le
 * parent charge.
 */
const { etapes, max, depliable } = defineProps({
  // De la racine à l'emplacement : { designation, couleur_id, hangar?, vehicule? } (cf. etapesEmplacement)
  etapes: {
    type: Array,
    required: true,
  },
  max: {
    type: Number,
    default: 3,
  },
  // false dans un bouton : « … » n'est alors pas cliquable
  depliable: {
    type: Boolean,
    default: true,
  },
});

const couleurStore = useCouleurStore();
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const deplie = ref(false);
const visibles = computed(() =>
  deplie.value || etapes.length <= max
    ? etapes
    : [etapes[0], null, ...etapes.slice(etapes.length - (max - 1))],
);
const cheminComplet = computed(() => etapes.map((e) => e.designation).join(" › "));
</script>

<template>
  <span class="d-inline-flex flex-wrap align-items-center gap-1" :title="cheminComplet">
    <template v-for="(etape, index) in visibles" :key="index">
      <span v-if="index > 0" class="text-body-secondary" aria-hidden="true">›</span>
      <template v-if="etape === null">
        <button
          v-if="depliable"
          type="button"
          class="btn btn-link btn-sm p-0 lh-1 text-body-secondary text-decoration-none"
          :aria-label="`Afficher le chemin complet : ${cheminComplet}`"
          @click.stop="deplie = true"
        >
          …
        </button>
        <span v-else class="text-body-secondary">…</span>
      </template>
      <tag-couleur v-else :couleur="indexedCouleurs[etape.couleur_id]" :icone="iconeEtape(etape)">
        {{ etape.designation }}
      </tag-couleur>
    </template>
  </span>
</template>
