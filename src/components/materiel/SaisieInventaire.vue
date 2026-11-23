<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSubmit } from "../../composables/useSubmit.js";
import { useNotification } from "../../composables/useNotification.js";
import { descendantsEtSoi } from "../../tools/inventaire.js";
import ScanArticle from "./ScanArticle.vue";

const { selectionId } = defineProps({
  selectionId: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const inventaireStore = useInventaireStore();
const { showModal } = useModalStore();
const notification = useNotification();
const { submit } = useSubmit();

const piecesNumerotees = computed(() =>
  inventaireStore.courant.lignes.filter((l) => l.numero !== null),
);

// Après un ajout hors de la sélection, la saisie suit le nœud où le matériel a été trouvé.
const suivre = (noeudId) => {
  if (!descendantsEtSoi(selectionId, inventaireStore.noeudsParParent).includes(noeudId)) {
    router.push({
      name: "materiel-inventaire-details",
      params: { id: inventaireStore.courant.id, noeudId },
    });
  }
};

const ajouter = (numero = "") =>
  showModal({
    component: "ModalAjouterMaterielTrouve",
    data: { noeudId: selectionId, numero },
    callback: suivre,
  });

const marquerPresent = (ligne) => {
  if (ligne.statut === "PRESENT") {
    notification.info(`${ligne.numero} est déjà présent.`);
    return;
  }
  submit(
    () => inventaireStore.modifierLigne(ligne.id, { statut: "PRESENT" }),
    "Impossible d'enregistrer la vérification",
    `${ligne.numero} présent.`,
  );
};
</script>

<template>
  <base-card>
    <template #body>
      <div class="d-flex flex-wrap gap-2 align-items-start">
        <div class="flex-grow-1">
          <scan-article
            :articles="piecesNumerotees"
            accepte-inconnu
            @scan="marquerPresent"
            @inconnu="ajouter"
          />
        </div>
        <button type="button" class="btn btn-outline-primary btn-sm" @click="ajouter()">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
          Ajouter du matériel trouvé
        </button>
      </div>
      <p class="small text-body-secondary mb-0">
        Un numéro prévu est marqué présent ; un numéro non prévu ouvre l'ajout de matériel trouvé.
      </p>
    </template>
  </base-card>
</template>
