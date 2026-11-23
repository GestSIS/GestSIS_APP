<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useSubmit } from "../../composables/useSubmit.js";
import { indexedData } from "../../tools/index.js";
import { CLASSES_ETAT, etapesNoeud } from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

const { noeudId, modifiable } = defineProps({
  noeudId: {
    type: Number,
    required: true,
  },
  modifiable: {
    type: Boolean,
    default: false,
  },
});

const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();
const { isSubmitting, submit } = useSubmit();

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const articles = computed(() => inventaireStore.articlesParNoeud[noeudId] ?? []);
const etapes = computed(() =>
  etapesNoeud(noeudId, inventaireStore.indexedNoeuds, indexedEmplacements.value),
);
const fait = computed(() => articles.value.filter((a) => a.etat !== "todo").length);

const fields = [
  { title: "Article", slot: "article", sortKey: "designation" },
  { title: "N°", key: "numero" },
  { title: "Prévu", key: "prevu", type: Number },
  { title: "Constaté", slot: "constate" },
  { title: "Dont défectueux", slot: "defectueux" },
  { title: "Écart", slot: "ecart", sortKey: "etat" },
];
const statuts = computed(() =>
  [
    { value: "PRESENT", label: "Présent", color: "success" },
    { value: "ABSENT", label: "Manquant", color: "danger" },
    { value: "DEFECTUEUX", label: "Défectueux", color: "warning" },
  ].map((s) => ({ ...s, disabled: !modifiable || isSubmitting.value })),
);

const changerStatut = (ligne, statut) =>
  submit(
    () => inventaireStore.modifierLigne(ligne.id, { statut }),
    "Impossible d'enregistrer la vérification",
  );
const retirer = (article) =>
  submit(
    () =>
      article.estLot
        ? inventaireStore.compterLot(article.ligne.id, 0)
        : inventaireStore.retirerLigne(article.ligne.id),
    "Impossible de retirer le matériel",
  );
const vFocus = { mounted: (el) => el.focus() };

// Précision pour le responsable, éditée sur place ; celle d'un lot vaut pour toutes ses pièces
const precision = ref({ id: null, texte: "" });
const editerPrecision = (article) => {
  precision.value = { id: article.id, texte: article.ligne.remarque_sapeur ?? "" };
};
const enregistrerPrecision = async (article) => {
  if (precision.value.id !== article.id) return;
  const texte = precision.value.texte.trim();
  precision.value = { id: null, texte: "" };
  if (texte === (article.ligne.remarque_sapeur ?? "")) return;
  await submit(
    () => inventaireStore.modifierLigne(article.ligne.id, { remarque_sapeur: texte || null }),
    "Impossible d'enregistrer la précision",
  );
};

const resteConforme = () =>
  submit(
    () => inventaireStore.marquerConformes(noeudId),
    "Impossible de marquer le reste conforme",
  );

// Comptage d'un lot (quantité, défectueuses) : affiché tout de suite, envoyé une seule fois,
// 500 ms après le dernier changement (boutons − / + compris) ou à la sortie du champ.
// Défectueuses non saisies : l'API garde le nombre déjà enregistré.
const lotSubmit = useSubmit().submit;
const saisies = ref({});
const envois = new Map();
const quantite = (valeur) =>
  valeur === "" || valeur === null ? null : Math.max(0, parseInt(valeur, 10) || 0);
const comptage = (lot) => {
  const saisie = {
    quantite: lot.constate === null ? "" : String(lot.constate),
    defectueux: lot.defectueux,
    ...saisies.value[lot.id],
  };
  // Défectueuses : parmi les pièces prévues constatées, jamais plus que la quantité affichée
  const max = Math.min(quantite(saisie.quantite) ?? 0, lot.prevu);
  return { ...saisie, max, defectueux: Math.min(saisie.defectueux, max) };
};
const planifier = (lot, delai) => {
  clearTimeout(envois.get(lot.id)?.timer);
  envois.set(lot.id, { timer: setTimeout(() => envoyer(lot), delai), lot });
};
const envoyer = async (lot) => {
  clearTimeout(envois.get(lot.id)?.timer);
  envois.delete(lot.id);
  const saisie = saisies.value[lot.id];
  if (!saisie) return;
  const { quantite: valeur, defectueux } = comptage(lot);
  const { ok, ignored } = await lotSubmit(
    () =>
      inventaireStore.compterLot(
        lot.ligne.id,
        quantite(valeur),
        saisie.defectueux === undefined ? undefined : defectueux,
      ),
    "Impossible d'enregistrer le comptage",
  );
  if (ignored) {
    planifier(lot, 300);
    return;
  }
  // En cas d'échec, l'affichage revient au comptage enregistré.
  if (!ok || saisies.value[lot.id] === saisie) {
    delete saisies.value[lot.id];
  }
};
const saisir = (lot, modification, delai = 500) => {
  saisies.value[lot.id] = { ...saisies.value[lot.id], ...modification };
  planifier(lot, delai);
};
// − / + : depuis la quantité affichée, un lot encore à compter part de 0.
const valeurLot = (lot) => quantite(comptage(lot).quantite) ?? 0;
const ajuster = (lot, pas) => saisir(lot, { quantite: String(Math.max(0, valeurLot(lot) + pas)) });
const ajusterDefectueux = (lot, pas) => saisir(lot, { defectueux: comptage(lot).defectueux + pas });
onBeforeUnmount(() => [...envois.values()].forEach(({ lot }) => envoyer(lot)));
</script>

<template>
  <base-card>
    <template #title>
      <chemin-emplacement :etapes="etapes" class="fs-6" />
      <span class="text-body-secondary fw-normal small ms-1">
        {{ fait }} / {{ articles.length }} vérifiés
      </span>
    </template>
    <template #header>
      <button
        v-if="modifiable && fait < articles.length"
        type="button"
        class="btn btn-outline-success btn-sm"
        :disabled="isSubmitting"
        @click="resteConforme"
      >
        Reste conforme
      </button>
    </template>
    <template #body-table>
      <base-table
        :data="articles"
        :fields="fields"
        :selectable="true"
        no-data="Aucun matériel"
        hide-download
      >
        <template #article="{ rowData }">
          {{ rowData.designation }}
          <span v-if="rowData.ligne.compartiment" class="small text-body-secondary">
            · {{ rowData.ligne.compartiment }}
          </span>
          <span
            v-for="variante in rowData.variantes"
            :key="variante"
            class="badge text-bg-light border fw-normal ms-1"
          >
            {{ variante }}
          </span>
          <span v-if="rowData.etiquette" class="badge text-bg-light border ms-1">
            {{ rowData.etiquette }}
          </span>
          <input
            v-if="precision.id === rowData.id"
            v-model="precision.texte"
            v-focus
            type="text"
            maxlength="1000"
            class="form-control form-control-sm mt-1"
            placeholder="Précision pour le responsable matériel"
            :aria-label="`Précision sur ${rowData.designation}`"
            @keydown.enter.prevent="enregistrerPrecision(rowData)"
            @keydown.esc="precision.id = null"
            @blur="enregistrerPrecision(rowData)"
          />
          <span v-else-if="rowData.ligne.remarque_sapeur" class="d-block small text-body-secondary">
            {{ rowData.ligne.remarque_sapeur }}
          </span>
        </template>
        <template #constate="{ rowData }">
          <div class="d-flex gap-1 align-items-center">
            <div v-if="rowData.estLot" class="input-group input-group-sm" style="width: 140px">
              <button
                type="button"
                class="btn btn-outline-secondary"
                :aria-label="`${rowData.designation} : une pièce de moins`"
                :disabled="!modifiable || valeurLot(rowData) <= 0"
                @click="ajuster(rowData, -1)"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max="1000"
                class="form-control text-center"
                :value="comptage(rowData).quantite"
                placeholder="?"
                :aria-label="`Quantité constatée de ${rowData.designation}`"
                :disabled="!modifiable"
                @input="saisir(rowData, { quantite: $event.target.value })"
                @blur="envoyer(rowData)"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                :aria-label="`${rowData.designation} : une pièce de plus`"
                :disabled="!modifiable"
                @click="ajuster(rowData, 1)"
              >
                +
              </button>
            </div>
            <button
              v-if="rowData.estLot && rowData.prevu > 0"
              type="button"
              class="btn btn-outline-secondary btn-sm text-nowrap"
              :disabled="!modifiable"
              @click="saisir(rowData, { quantite: String(rowData.prevu) }, 0)"
            >
              = prévu
            </button>
            <base-radio
              v-else-if="!rowData.estLot && !rowData.retirable"
              :model-value="rowData.ligne.statut"
              :options="statuts"
              :label="`État de ${rowData.numero}`"
              button-style
              size="sm"
              @update:model-value="(statut) => changerStatut(rowData.ligne, statut)"
            />
            <button
              v-if="modifiable && rowData.retirable"
              type="button"
              class="btn btn-outline-danger btn-sm border-0"
              title="Retirer"
              :aria-label="`Retirer ${rowData.designation}`"
              :disabled="isSubmitting"
              @click="retirer(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </div>
        </template>
        <template #defectueux="{ rowData }">
          <div
            v-if="rowData.estLot && rowData.prevu > 0"
            class="input-group input-group-sm"
            style="width: 110px"
          >
            <button
              type="button"
              class="btn btn-outline-secondary"
              :aria-label="`${rowData.designation} : une pièce défectueuse de moins`"
              :disabled="!modifiable || comptage(rowData).defectueux <= 0"
              @click="ajusterDefectueux(rowData, -1)"
            >
              −
            </button>
            <span
              class="form-control text-center"
              :class="{ 'text-body-tertiary': rowData.constate === null }"
            >
              {{ comptage(rowData).defectueux }}
            </span>
            <button
              type="button"
              class="btn btn-outline-secondary"
              :aria-label="`${rowData.designation} : une pièce défectueuse de plus`"
              :disabled="!modifiable || comptage(rowData).defectueux >= comptage(rowData).max"
              @click="ajusterDefectueux(rowData, 1)"
            >
              +
            </button>
          </div>
        </template>
        <template #ecart="{ rowData }">
          <div class="d-flex flex-wrap gap-1 align-items-center">
            <span
              v-for="badge in rowData.badges"
              :key="badge.etat"
              class="badge"
              :class="CLASSES_ETAT[badge.etat]"
            >
              {{ badge.texte }}
            </span>
            <button
              v-if="modifiable"
              type="button"
              class="btn btn-sm border-0"
              :class="rowData.ligne.remarque_sapeur ? 'text-primary' : 'text-body-tertiary'"
              title="Précision pour le responsable"
              :aria-label="`Précision sur ${rowData.designation}`"
              @click="editerPrecision(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
          </div>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
