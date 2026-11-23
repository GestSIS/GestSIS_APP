<script setup>
import { computed, ref, watch } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { indexedData } from "../../tools/index.js";
import { etapeEmplacement, iconeEtape } from "../../tools/materiel.js";
import { ancetresEtSoi, descendantsEtSoi } from "../../tools/inventaire.js";
import TagCouleur from "./TagCouleur.vue";

const { selectionId } = defineProps({
  selectionId: {
    type: Number,
    required: true,
  },
});

const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const replies = ref(new Set());
const toggleLine = (id) =>
  replies.value.has(id) ? replies.value.delete(id) : replies.value.add(id);
// La sélection reste visible, même choisie depuis la liste des écarts.
watch(
  () => selectionId,
  (id) => ancetresEtSoi(id, inventaireStore.indexedNoeuds).forEach((i) => replies.value.delete(i)),
);

const computedData = computed(() => {
  const stats = (noeudId) => {
    const etats = descendantsEtSoi(noeudId, inventaireStore.noeudsParParent).flatMap((id) =>
      (inventaireStore.articlesParNoeud[id] ?? []).map((a) => a.etat),
    );
    const fait = etats.filter((e) => e !== "todo").length;
    const complet = etats.length > 0 && fait === etats.length;
    let point = complet ? "var(--bs-success)" : "var(--bs-gray-400)";
    if (etats.includes("plus")) point = "var(--bs-primary)";
    if (etats.includes("manq")) point = "var(--bs-danger)";
    return {
      compte: `${fait}/${etats.length}`,
      compteClass: { "text-danger": etats.includes("manq"), "text-success": complet },
      point,
    };
  };

  const recursive = (noeud, level = 0) => [
    {
      ...noeud,
      level,
      ...stats(noeud.id),
      etape: etapeEmplacement(indexedEmplacements.value[noeud.emplacement_id], noeud.designation),
      aDesEnfants: (inventaireStore.noeudsParParent[noeud.id] ?? []).length > 0,
    },
    ...(replies.value.has(noeud.id)
      ? []
      : [...(inventaireStore.noeudsParParent[noeud.id] ?? [])]
          .sort((a, b) => a.tri - b.tri)
          .flatMap((enfant) => recursive(enfant, level + 1))),
  ];
  return inventaireStore.racine ? recursive(inventaireStore.racine) : [];
});

const routeNoeud = (noeudId) => ({
  name: "materiel-inventaire-details",
  params: { id: inventaireStore.courant.id, noeudId },
});
</script>

<template>
  <base-card>
    <template #title>Emplacements</template>
    <template #header>
      <router-link
        v-if="inventaireStore.noeuds.length > 1 && selectionId !== inventaireStore.racine.id"
        :to="routeNoeud(inventaireStore.racine.id)"
        class="btn btn-outline-secondary btn-sm"
      >
        Tout afficher
      </router-link>
    </template>
    <template #body>
      <ul class="list-unstyled mb-0">
        <li
          v-for="noeud in computedData"
          :key="noeud.id"
          class="d-flex align-items-center"
          :style="{ paddingLeft: `${noeud.level * 14}px` }"
        >
          <button
            v-if="noeud.aDesEnfants"
            type="button"
            class="btn btn-sm border-0 px-1"
            :aria-label="(replies.has(noeud.id) ? 'Déplier ' : 'Replier ') + noeud.designation"
            :aria-expanded="!replies.has(noeud.id)"
            @click="toggleLine(noeud.id)"
          >
            <font-awesome-icon
              :icon="['fas', replies.has(noeud.id) ? 'angle-right' : 'angle-down']"
              fixed-width
            />
          </button>
          <span
            v-else-if="inventaireStore.noeuds.length > 1"
            class="d-inline-block"
            style="width: 28px"
          ></span>
          <router-link
            :to="routeNoeud(noeud.id)"
            class="btn btn-sm flex-grow-1 d-flex align-items-center gap-2 text-start border-0 py-2"
            :class="{ 'bg-primary-subtle': selectionId === noeud.id }"
            :aria-current="selectionId === noeud.id ? 'true' : undefined"
          >
            <span class="flex-grow-1">
              <tag-couleur
                :couleur="indexedCouleurs[noeud.etape.couleur_id]"
                :icone="iconeEtape(noeud.etape)"
              >
                {{ noeud.designation }}
              </tag-couleur>
            </span>
            <span class="small" :class="noeud.compteClass">{{ noeud.compte }}</span>
            <span
              class="rounded-circle flex-shrink-0"
              :style="{ width: '8px', height: '8px', background: noeud.point }"
            ></span>
          </router-link>
        </li>
      </ul>
    </template>
  </base-card>
</template>
