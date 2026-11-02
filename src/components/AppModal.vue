<script setup>
import {
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { useModalStore } from "../stores/common/Modal";

const components = Object.fromEntries(
  Object.entries(import.meta.glob("./modal/*.vue")).map(([key, value]) => {
    const name = key.split("/").pop().replace(".vue", "");
    return [name, defineAsyncComponent(value)];
  }),
);

const modal = useModalStore();

// Une saisie a eu lieu dans la modale ouverte : la quitter avec Échap, la croix ou
// le bouton Fermer / Annuler demande confirmation. Détecté ici, sur les évènements
// natifs, pour couvrir toutes les modales sans que chacune ait à le gérer.
const modifiee = ref(false);
const confirmationVisible = ref(false);
const boutonRester = useTemplateRef("bouton-rester");
const BOUTONS_SORTIE =
  ".modal-header .btn-close, .modal-footer .btn-secondary, .modal-footer .btn-outline-secondary";
// Bouton de sortie cliqué, à relancer si l'utilisateur confirme : chaque modale
// garde ainsi sa propre façon de se fermer.
let boutonEnAttente = null;

watch(
  () => [modal.visible, modal.component, modal.data],
  () => {
    modifiee.value = false;
    confirmationVisible.value = false;
    boutonEnAttente = null;
  },
);

const demanderConfirmation = () => {
  confirmationVisible.value = true;
  nextTick(() => boutonRester.value?.focus());
};

const rester = () => {
  confirmationVisible.value = false;
  boutonEnAttente = null;
};

const quitter = () => {
  confirmationVisible.value = false;
  if (boutonEnAttente) {
    const bouton = boutonEnAttente;
    boutonEnAttente = null;
    modifiee.value = false;
    bouton.click();
    return;
  }
  (modal.callback() ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      modal.closeModal();
    }
  });
};

const escapeHandler = (e) => {
  if (e.key !== "Escape" || e.repeat || !modal.visible) {
    return;
  }
  if (confirmationVisible.value) {
    rester();
  } else if (modifiee.value) {
    demanderConfirmation();
  } else {
    quitter();
  }
};
const interceptionSortie = (e) => {
  const bouton = modifiee.value ? e.target.closest(BOUTONS_SORTIE) : null;
  if (bouton) {
    e.stopPropagation();
    e.preventDefault();
    boutonEnAttente = bouton;
    demanderConfirmation();
  }
};
onMounted(() => document.addEventListener("keydown", escapeHandler));
onUnmounted(() => document.removeEventListener("keydown", escapeHandler));
</script>

<template>
  <div>
    <!-- Modal -->
    <div
      v-if="modal.visible"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      @click.capture="interceptionSortie"
      @input.capture="modifiee = true"
      @change.capture="modifiee = true"
    >
      <div
        class="modal-dialog modal-dialog-scrollable"
        :class="
          {
            [-1]: 'modal-sm',
            0: '', // Default
            1: 'modal-lg',
            2: 'modal-xl',
            3: 'modal-pleine-largeur',
          }[modal.size]
        "
        role="document"
      >
        <suspense>
          <component
            :is="components[modal.component]"
            :callback="modal.callback"
            :data="modal.data"
            class="modal-content"
          ></component>
          <template #fallback>Loading ...</template>
        </suspense>
      </div>
    </div>
    <!-- Overlay -->
    <div v-if="modal.visible" id="modal-overlay" class="modal-backdrop fade show"></div>
    <!-- Confirmation au-dessus de la modale, qui reste affichée pour ne pas perdre la saisie
         (le store n'affiche qu'une modale à la fois : modal.confirm() la remplacerait). -->
    <template v-if="confirmationVisible">
      <div class="modal-backdrop fade show" style="z-index: 1060"></div>
      <div class="modal fade show d-block" style="z-index: 1065" tabindex="-1" role="alertdialog">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Quitter sans enregistrer ?</h5>
            </div>
            <div class="modal-body">Les informations saisies seront perdues.</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-danger" @click="quitter">Quitter</button>
              <button ref="bouton-rester" type="button" class="btn btn-primary" @click="rester">
                Continuer la saisie
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
