<script setup>
import { computed } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { indexedData } from "../../tools/index.js";
import { CLASSES_ETAT, etapesNoeud, piecesEcart } from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));

// Pour un lot, seul le nombre de pièces (« −2 », « +1 », « 1 déf. »).
const ecarts = computed(() =>
  inventaireStore.ecartsSaisie.map((a) => ({
    ...a,
    titre: [a.designation, ...(a.estLot ? [] : [a.numero]), ...a.variantes].join(" · "),
    ecart: a.estLot
      ? { manq: "−", plus: "+", def: "" }[a.etat] +
        a.ligne_ids.length +
        (a.etat === "def" ? " déf." : "")
      : a.badges[0].texte,
    etapes: etapesNoeud(a.noeudId, inventaireStore.indexedNoeuds, indexedEmplacements.value),
  })),
);
const totaux = computed(() => [
  {
    libelle: "manquants",
    classe: "text-danger",
    nombre: piecesEcart(ecarts.value.filter((e) => e.etat === "manq")),
  },
  {
    libelle: "en plus",
    classe: "text-primary",
    nombre: piecesEcart(ecarts.value.filter((e) => e.etat === "plus")),
  },
  {
    libelle: "défectueux",
    classe: "text-warning-emphasis",
    nombre: piecesEcart(ecarts.value.filter((e) => e.etat === "def")),
  },
]);
</script>

<template>
  <base-card>
    <template #title>Écarts constatés</template>
    <template #body>
      <div class="row text-center g-2 mb-2">
        <div v-for="total in totaux" :key="total.libelle" class="col-4">
          <div class="fs-4 fw-bold" :class="total.classe">{{ total.nombre }}</div>
          <div class="small">{{ total.libelle }}</div>
        </div>
      </div>
      <ul class="list-unstyled mb-2">
        <li v-for="ecart in ecarts" :key="ecart.id" class="border-top">
          <router-link
            :to="{
              name: 'materiel-inventaire-details',
              params: { id: inventaireStore.courant.id, noeudId: ecart.noeudId },
            }"
            class="btn btn-sm w-100 d-flex align-items-center gap-2 text-start border-0 py-2"
          >
            <span class="flex-grow-1">
              <span class="d-block fw-semibold">{{ ecart.titre }}</span>
              <chemin-emplacement :etapes="ecart.etapes" :depliable="false" class="small" />
            </span>
            <span class="badge" :class="CLASSES_ETAT[ecart.etat]">{{ ecart.ecart }}</span>
          </router-link>
        </li>
      </ul>
      <p class="small text-body-secondary mb-0">
        Rien n'est modifié dans le stock avant la clôture : chaque écart sera traité à l'étape
        suivante.
      </p>
    </template>
  </base-card>
</template>
