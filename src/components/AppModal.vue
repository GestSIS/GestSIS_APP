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

// Accessibilité : la modale ouverte reçoit le focus, le garde (Tab boucle à
// l'intérieur, le reste de la page est rendu `inert`) et le rend à l'élément qui
// l'a ouverte à la fermeture. Son nom accessible est le `.modal-title` du contenu.
const racine = useTemplateRef("racine");
const dialogue = useTemplateRef("dialogue");
const confirmation = useTemplateRef("confirmation");
const titreId = ref(null);
const chargement = ref(false);
let declencheur = null;
let focusAvantConfirmation = null;

const FOCUSABLES =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const elementsFocusables = (conteneur) =>
  [...conteneur.querySelectorAll(FOCUSABLES)].filter((el) => el.getClientRects().length > 0);

const rendreFocus = (element) => {
  nextTick(() => {
    if (element?.isConnected) {
      element.focus();
    }
  });
};

// Les frères de l'AppModal dans le layout (sidebar, navbar, contenu de la page).
const setFondInerte = (inerte) => {
  const parent = racine.value?.parentElement;
  if (!parent) {
    return;
  }
  for (const enfant of parent.children) {
    if (enfant !== racine.value) {
      enfant.inert = inerte;
    }
  }
};

watch(
  () => modal.visible,
  (visible) => {
    if (visible) {
      // Flush "pre" : le DOM n'a pas encore changé, le focus est toujours sur le déclencheur.
      declencheur = document.activeElement;
      setFondInerte(true);
    } else {
      setFondInerte(false);
      rendreFocus(declencheur);
      declencheur = null;
    }
  },
);

// Appelé quand le contenu (composant asynchrone) de la modale est rendu, y compris
// lorsqu'une modale en remplace une autre sans fermeture.
const contenuPret = () => {
  chargement.value = false;
  const titre = dialogue.value?.querySelector(".modal-title");
  if (titre && !titre.id) {
    titre.id = "app-modal-titre";
  }
  titreId.value = titre?.id ?? null;
  // Une modale qui place elle-même le focus (champ de recherche, autofocus…) garde la main.
  if (dialogue.value && !dialogue.value.contains(document.activeElement)) {
    dialogue.value.focus();
  }
};

const pieger = (e) => {
  const conteneur = confirmationVisible.value ? confirmation.value : dialogue.value;
  if (!conteneur) {
    return;
  }
  const focusables = elementsFocusables(conteneur);
  if (focusables.length === 0) {
    e.preventDefault();
    conteneur.focus();
    return;
  }
  const premier = focusables[0];
  const dernier = focusables[focusables.length - 1];
  const actif = document.activeElement;
  const horsModale = actif === conteneur || !conteneur.contains(actif);
  if (e.shiftKey && (horsModale || actif === premier)) {
    e.preventDefault();
    dernier.focus();
  } else if (!e.shiftKey && (horsModale || actif === dernier)) {
    e.preventDefault();
    premier.focus();
  }
};

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
  focusAvantConfirmation = document.activeElement;
  confirmationVisible.value = true;
  nextTick(() => boutonRester.value?.focus());
};

const rester = () => {
  confirmationVisible.value = false;
  boutonEnAttente = null;
  rendreFocus(focusAvantConfirmation);
  focusAvantConfirmation = null;
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
  if (e.key === "Tab" && modal.visible) {
    pieger(e);
    return;
  }
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
onUnmounted(() => {
  document.removeEventListener("keydown", escapeHandler);
  setFondInerte(false);
});
</script>

<template>
  <div ref="racine">
    <!-- Modal -->
    <div
      v-if="modal.visible"
      ref="dialogue"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titreId"
      :aria-busy="chargement"
      :inert="confirmationVisible"
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
        <suspense @pending="chargement = true" @resolve="contenuPret">
          <component
            :is="components[modal.component]"
            :callback="modal.callback"
            :data="modal.data"
            class="modal-content"
          ></component>
          <template #fallback>
            <div class="modal-content">
              <div class="modal-body d-flex justify-content-center" role="status">
                <div class="spinner-border" aria-hidden="true"></div>
                <span class="visually-hidden">Chargement…</span>
              </div>
            </div>
          </template>
        </suspense>
      </div>
    </div>
    <!-- Overlay -->
    <div v-if="modal.visible" id="modal-overlay" class="modal-backdrop fade show"></div>
    <!-- Confirmation au-dessus de la modale, qui reste affichée pour ne pas perdre la saisie
         (le store n'affiche qu'une modale à la fois : modal.confirm() la remplacerait). -->
    <template v-if="confirmationVisible">
      <div class="modal-backdrop fade show" style="z-index: 1060"></div>
      <div
        ref="confirmation"
        class="modal fade show d-block"
        style="z-index: 1065"
        tabindex="-1"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-modal-confirmation-titre"
        aria-describedby="app-modal-confirmation-texte"
      >
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h5 id="app-modal-confirmation-titre" class="modal-title">
                Quitter sans enregistrer ?
              </h5>
            </div>
            <div id="app-modal-confirmation-texte" class="modal-body">
              Les informations saisies seront perdues.
            </div>
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
