<script setup>
import { computed, reactive } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useSubmit } from "../../composables/useSubmit.js";
import { piecesEcart } from "../../tools/inventaire.js";

defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const { closeModal } = useModalStore();
const inventaireStore = useInventaireStore();
const { errors, isSubmitting, submit } = useSubmit();

// Les précisions par pièce se saisissent pendant l'inventaire (✎) ; ici la remarque générale
const form = reactive({ remarque: inventaireStore.courant.remarque ?? "" });

const computedData = computed(() => {
  const lignes = inventaireStore.courant.lignes;
  const ecarts = inventaireStore.ecartsSaisie;
  const verifiees = lignes.filter((l) => l.statut !== null).length;
  return {
    verifiees,
    total: lignes.length,
    resteAVerifier: lignes.length - verifiees,
    nombreEcarts: piecesEcart(ecarts),
    totaux: [
      { libelle: "manquants", classe: "text-danger", etat: "manq" },
      { libelle: "en plus, déplacés ou nouveaux", classe: "text-primary", etat: "plus" },
      { libelle: "défectueux", classe: "text-warning-emphasis", etat: "def" },
    ].map((t) => ({ ...t, nombre: piecesEcart(ecarts.filter((e) => e.etat === t.etat)) })),
  };
});

const valider = async () => {
  const nombre = computedData.value.nombreEcarts;
  const { ok } = await submit(
    () => inventaireStore.validerInventaire(form.remarque.trim() || null),
    "Impossible de valider l'inventaire",
    nombre === 0
      ? "Inventaire validé : tout est conforme."
      : `Inventaire validé : ${nombre} écart${nombre > 1 ? "s transmis" : " transmis"} au responsable matériel.`,
  );
  if (ok) closeModal();
};
</script>

<template>
  <form @submit.prevent="valider">
    <div class="modal-header">
      <h5 class="modal-title">Valider l'inventaire — {{ inventaireStore.racine.designation }}</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <p class="text-body-secondary">
        Vous confirmez que le comptage est terminé. Vous n'avez aucune décision à prendre : les
        écarts sont transmis au responsable matériel, qui décidera de la suite.
      </p>
      <div v-if="computedData.resteAVerifier > 0" class="alert alert-warning" role="alert">
        Il reste {{ computedData.resteAVerifier }} pièce{{
          computedData.resteAVerifier > 1 ? "s" : ""
        }}
        à vérifier : terminez la saisie avant de valider.
      </div>

      <div class="row g-2 mb-3 text-center">
        <div class="col-md-3 col-6">
          <div class="border rounded p-2">
            <div class="fs-4 fw-bold">{{ computedData.verifiees }} / {{ computedData.total }}</div>
            <div class="small text-body-secondary">lignes vérifiées</div>
          </div>
        </div>
        <div v-for="total in computedData.totaux" :key="total.etat" class="col-md-3 col-6">
          <div class="border rounded p-2">
            <div class="fs-4 fw-bold" :class="total.classe">{{ total.nombre }}</div>
            <div class="small text-body-secondary">{{ total.libelle }}</div>
          </div>
        </div>
      </div>

      <label for="remarque">Remarque générale</label>
      <textarea
        id="remarque"
        v-model="form.remarque"
        rows="2"
        class="form-control form-control-sm"
        :class="{ 'is-invalid': errors['remarque'] }"
        placeholder="Ex. compartiment D1 humide, à vérifier"
      ></textarea>
      <div v-if="errors['remarque']" class="invalid-feedback">{{ errors["remarque"][0] }}</div>
      <p class="small text-body-secondary mt-2 mb-0">
        Après validation, la saisie n'est plus modifiable. Le stock n'est pas touché tant que le
        responsable n'a pas traité les écarts.
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Retour à la saisie
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting || computedData.resteAVerifier > 0"
      >
        Valider l'inventaire
      </button>
    </div>
  </form>
</template>
