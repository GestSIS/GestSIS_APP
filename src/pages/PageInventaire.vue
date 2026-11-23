<script setup>
import { computed, watch } from "vue";
import { useInventaireStore } from "../stores/materiel/Inventaire";
import { useEmplacementStore } from "../stores/materiel/Emplacement";
import { useMaterielTypeStore } from "../stores/materiel/Type";
import { useCouleurStore } from "../stores/materiel/Couleur";
import { useSapeurStore } from "../stores/sapeur/Sapeur";
import { useHasPermission } from "../composables/useHasPermission.js";
import permissions from "../composables/permissions.js";
import { piecesEcart } from "../tools/inventaire.js";
import InventaireEntete from "../components/materiel/InventaireEntete.vue";

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const inventaireStore = useInventaireStore();

await Promise.all([
  inventaireStore.fetchInventaire(id),
  useEmplacementStore().fetchEmplacements(),
  useMaterielTypeStore().fetchMaterielTypes(),
  useCouleurStore().fetchCouleurs(),
  useSapeurStore().fetchSapeurs(),
]);
watch(
  () => id,
  (nouveau) => inventaireStore.fetchInventaire(nouveau),
);

const hasInventairePermission = useHasPermission(permissions.MATERIEL.INVENTAIRE);
const modifiable = computed(
  () => inventaireStore.courant.statut === "EN_COURS" && hasInventairePermission.value,
);

const onglets = computed(() => {
  const valide = inventaireStore.courant.statut === "VALIDE";
  const aTraiter = piecesEcart(inventaireStore.ecarts.filter((e) => e.decision === null));
  let badge = "";
  if (valide) badge = aTraiter > 0 ? String(aTraiter) : "✓";
  return [
    { to: `/inventaires/${id}/saisie`, texte: valide ? "Inventaire" : "Saisie", exact: false },
    {
      to: `/inventaires/${id}/ecarts`,
      texte: "Écarts",
      exact: false,
      badge,
      badgeClass: aTraiter > 0 ? "text-bg-danger" : "text-bg-success",
      disabled: !valide,
      title: valide ? "" : "Disponible une fois l'inventaire validé",
    },
  ];
});
</script>

<template>
  <div class="container-fluid">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb m-3">
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'accueil' }">Accueil</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'materiel-tableau-bord' }">Matériel</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link :to="{ name: 'materiel-inventaires' }">Inventaires</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ inventaireStore.courant.designation }}
        </li>
      </ol>
    </nav>

    <inventaire-entete :modifiable="modifiable" />
    <base-navigation-tab :routes="onglets" />
    <router-view :modifiable="modifiable" />
  </div>
</template>
