<script setup>
import { computed, reactive, ref } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useModalStore } from "../../stores/common/Modal.js";
import { useSubmit } from "../../composables/useSubmit.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";
import { indexedData } from "../../tools/index.js";
import { formatDate } from "../../tools/formatters.js";
import { etapesEmplacement } from "../../tools/materiel.js";
import {
  CLASSES_ETAT,
  LIBELLES_DECISION,
  descendantsEtSoi,
  etapesNoeud,
  nomSapeur,
  optionsEcart,
  piecesEcart,
  variantes,
} from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

// Écarts comparés au stock actuel : prévu au démarrage, en stock aujourd'hui, constaté.
// L'API propose comment aligner le stock sur le constaté et recalcule l'écart à l'application.

const inventaireStore = useInventaireStore();
const sapeurStore = useSapeurStore();
const emplacementStore = useEmplacementStore();
const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const peutTraiter = useHasPermission(permissions.MATERIEL.MODIFICATION);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));

const filtre = ref("afaire");
// Décision choisie par écart, avant de l'appliquer (la première proposée par défaut)
const choix = reactive({});

const CONSTATE = { manq: "manquante", def: "défectueuse", plus: "trouvée ici" };

/**
 * Où est l'article d'une pièce aujourd'hui (texte, ou chemin s'il est rangé ailleurs) et, pour
 * une pièce prévue ici, ce qui a changé depuis l'inventaire.
 */
const etatPiece = (ecart, emplacementIci) => {
  const article = ecart.article_actuel;
  const prevue = ecart.origine === "ATTENDU";
  if (!article) return { texte: "—", etapes: [], change: "" };
  if (article.supprime_le) {
    return {
      texte: "supprimé",
      etapes: [],
      change: `supprimé le ${formatDate(article.supprime_le)}`,
    };
  }
  if (article.sapeur_id) {
    const texte = `attribué à ${nomSapeur(indexedSapeurs.value[article.sapeur_id])}`;
    return { texte, etapes: [], change: prevue ? texte : "" };
  }
  if (article.emplacement_id === emplacementIci) return { texte: "ici", etapes: [], change: "" };
  return {
    texte: "",
    etapes: etapesEmplacement(article.emplacement_id, indexedEmplacements.value),
    change: prevue ? "rangé ailleurs" : "",
  };
};

/** Ce qui a changé dans un lot depuis l'inventaire : pièces ajoutées, pièces parties. */
const changeLot = (ecart) =>
  [
    ecart.ajoutes_depuis > 0 &&
      `+${ecart.ajoutes_depuis} ajoutée${ecart.ajoutes_depuis > 1 ? "s" : ""}`,
    ecart.partis_depuis > 0 && `${ecart.partis_depuis} partie${ecart.partis_depuis > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(", ");

const resolutionTexte = (ecart) => {
  if (ecart.resolution === "PLUS_CONCERNE") {
    return "L'article a bougé depuis l'inventaire : il n'est pas touché.";
  }
  if (ecart.est_lot)
    return `Le stock compte déjà ${ecart.actuel} pièce${ecart.actuel > 1 ? "s" : ""}.`;
  return ecart.nature === "plus"
    ? "L'article est déjà rangé ici."
    : "L'article n'est déjà plus en stock.";
};

const computedData = computed(() => {
  const ecarts = inventaireStore.ecarts.map((e) => {
    const emplacementIci = inventaireStore.indexedNoeuds[e.noeud_id]?.emplacement_id;
    const options = optionsEcart(e).map((o) => ({ ...o, color: "secondary" }));
    // Le choix mémorisé ne vaut que s'il est encore proposé (l'écart a pu être recalculé)
    const decisionChoisie = options.some((o) => o.value === choix[e.id])
      ? choix[e.id]
      : options[0].value;
    const piece = e.est_lot ? null : etatPiece(e, emplacementIci);
    const creation =
      decisionChoisie === "AJOUTER_AU_STOCK" && ["AJOUTER", "CREER"].includes(e.proposition);
    const traite = e.decision !== null;
    return {
      ...e,
      traite,
      variantes: variantes(e),
      prevuTexte: e.est_lot ? String(e.prevu) : e.origine === "ATTENDU" ? "prévue ici" : "—",
      actuelTexte: e.est_lot ? String(e.actuel) : piece.texte,
      actuelEtapes: piece?.etapes ?? [],
      // Pour un écart traité, le stock reflète aussi la décision : rien à signaler
      change: traite ? "" : e.est_lot ? changeLot(e) : piece.change,
      constateTexte: e.est_lot
        ? e.nature === "def"
          ? `${e.ligne_ids.length} défectueuse${e.ligne_ids.length > 1 ? "s" : ""}`
          : `${e.constate} comptée${e.constate > 1 ? "s" : ""}`
        : CONSTATE[e.nature],
      resolutionTitre:
        { A_JOUR: "Déjà à jour", PLUS_CONCERNE: "Plus concerné" }[e.resolution] ?? "",
      resolutionTexte: e.resolution ? resolutionTexte(e) : "",
      options,
      decisionChoisie,
      decisionTexte: LIBELLES_DECISION[e.decision] ?? "",
      traitePar: nomSapeur(indexedSapeurs.value[e.traite_par_sapeur_id]),
      // Créer des articles ouvre leur fiche (achat, numéro…) : jamais appliqué avec les autres
      aConfigurer: creation,
    };
  });
  const visibles = ecarts.filter(
    (e) => filtre.value === "tous" || e.traite === (filtre.value === "traites"),
  );
  // Une carte par emplacement, dans l'ordre de l'arbre
  const ordre = inventaireStore.racine
    ? descendantsEtSoi(inventaireStore.racine.id, inventaireStore.noeudsParParent)
    : [];
  const cartes = ordre
    .map((noeudId) => ({
      noeudId,
      etapes: etapesNoeud(noeudId, inventaireStore.indexedNoeuds, indexedEmplacements.value),
      ecarts: visibles.filter((e) => e.noeud_id === noeudId),
    }))
    .filter((c) => c.ecarts.length > 0);
  const total = piecesEcart(ecarts);
  const traites = piecesEcart(ecarts.filter((e) => e.traite));
  return {
    cartes,
    aAppliquer: visibles.filter((e) => !e.traite),
    filtres: [
      { value: "afaire", label: `À traiter (${total - traites})` },
      { value: "traites", label: `Traités (${traites})` },
      { value: "tous", label: "Tous" },
    ],
    noData:
      filtre.value === "traites"
        ? "Aucun écart traité pour le moment."
        : "Tous les écarts de cet inventaire sont traités.",
  };
});

const traitement = (ecart) => ({
  ecart: ecart.id,
  signature: ecart.signature,
  decision: ecart.decisionChoisie,
});

const CHAMPS_ARTICLE = [
  "emplacement_id",
  "numero",
  "compartiment",
  "taille",
  "date_peremption",
  "est_etiquete",
  "achat",
  "remarque",
  "disponible_intervention",
];
const champsArticle = (article) =>
  Object.fromEntries(CHAMPS_ARTICLE.map((champ) => [champ, article[champ]]));

// Création d'articles : la fiche, pré-remplie avec ce que le sapeur a relevé, applique la
// décision à l'enregistrement (création et traitement en une seule opération)
const configurer = (ecart) => {
  const emplacementId = inventaireStore.indexedNoeuds[ecart.noeud_id]?.emplacement_id ?? null;
  const typePropose = ecart.materiel_type_id === null ? ecart.designation : undefined;
  const releve = {
    compartiment: ecart.compartiment,
    taille: ecart.taille,
    date_peremption: ecart.date_peremption,
    est_etiquete: ecart.est_etiquete,
  };

  // Un lot : une ligne par pièce à ajouter, chacune avec son numéro, sa taille, sa péremption…
  if (ecart.est_lot) {
    showModal({
      component: "ModalAjoutArticleMultiplePourType",
      size: 2,
      data: {
        materielTypeId: ecart.materiel_type_id ?? undefined,
        emplacementId,
        typePropose,
        lignes: Array.from({ length: ecart.quantite }, () => ({ ...releve })),
        enregistrer: (articles, materielTypeId) =>
          inventaireStore.traiterEcart({
            ...traitement(ecart),
            materiel_type_id: materielTypeId,
            articles: articles.map(champsArticle),
          }),
      },
    });
    return;
  }

  showModal({
    component: "ModalArticle",
    data: {
      ...releve,
      materiel_type_id: ecart.materiel_type_id ?? undefined,
      quantite: 1,
      emplacement_id: emplacementId,
      numero: ecart.numero ?? "",
      taille: ecart.taille ?? "",
      quantiteFixe: true,
      sansVehicule: true,
      typePropose,
      typeProposeNumerote: ecart.numero !== null,
      enregistrer: (article) =>
        inventaireStore.traiterEcart({
          ...traitement(ecart),
          materiel_type_id: article.materiel_type_id,
          article: champsArticle(article),
        }),
    },
  });
};

const appliquer = (ecart) => {
  if (ecart.aConfigurer) {
    configurer(ecart);
    return;
  }
  submit(
    () => inventaireStore.traiterEcart(traitement(ecart)),
    "Impossible de traiter l'écart",
    "Écart traité.",
  );
};

// Les écarts affichés qui ne créent pas d'article, l'un après l'autre. Chacun part
// avec la signature affichée : si le stock a changé entre-temps, l'API le refuse et
// l'application s'arrête sur l'écart recalculé.
const appliquerTous = async () => {
  const ecarts = computedData.value.aAppliquer.filter((e) => !e.aConfigurer);
  if (ecarts.length === 0) return;
  const ignores = computedData.value.aAppliquer.length - ecarts.length;
  const confirme = await confirm(
    `Appliquer ${ecarts.length} décision${ecarts.length > 1 ? "s" : ""} ?`,
    `Les décisions sont définitives et modifient le stock.${ignores ? ` ${ignores} écart${ignores > 1 ? "s demandent" : " demande"} une fiche d'article : à appliquer un par un.` : ""}`,
  );
  if (!confirme) return;
  const payloads = ecarts.map(traitement);
  await submit(
    async () => {
      for (const payload of payloads) {
        await inventaireStore.traiterEcart(payload);
      }
    },
    "Impossible de traiter tous les écarts",
    `${payloads.length} écart${payloads.length > 1 ? "s traités" : " traité"}.`,
  );
};

const fields = [
  { title: "Article", slot: "article", sortKey: "designation" },
  { title: "Prévu au démarrage", slot: "prevu" },
  { title: "En stock aujourd'hui", slot: "actuel" },
  { title: "Constaté", slot: "constate", sortKey: "nature" },
  { title: "Pour aligner le stock", slot: "decision" },
];
</script>

<template>
  <base-card>
    <template #body>
      <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <base-radio
          v-model="filtre"
          :options="computedData.filtres"
          label="Filtre des écarts"
          button-style
          size="sm"
        />
        <span class="small text-body-secondary flex-grow-1">
          Comparé au stock actuel : ce qui a changé depuis l'inventaire est signalé.
        </span>
        <button
          v-if="peutTraiter && filtre !== 'traites'"
          type="button"
          class="btn btn-outline-primary btn-sm"
          :disabled="isSubmitting"
          @click="appliquerTous"
        >
          Appliquer tous les choix affichés
        </button>
      </div>
    </template>
  </base-card>

  <p v-if="computedData.cartes.length === 0" class="text-body-secondary">
    {{ computedData.noData }}
  </p>
  <base-card v-for="carte in computedData.cartes" :key="carte.noeudId">
    <template #title>
      <chemin-emplacement :etapes="carte.etapes" class="fs-6" />
    </template>
    <template #body-table>
      <base-table :data="carte.ecarts" :fields="fields" hide-download>
        <template #article="{ rowData }">
          <span class="fw-semibold">{{ rowData.designation }}</span>
          <span v-if="rowData.numero" class="ms-1 font-monospace small">{{ rowData.numero }}</span>
          <span
            v-for="variante in rowData.variantes"
            :key="variante"
            class="badge text-bg-light border fw-normal ms-1"
          >
            {{ variante }}
          </span>
          <span v-if="rowData.precision" class="d-block small text-body-secondary">
            « {{ rowData.precision }} »
          </span>
        </template>
        <template #prevu="{ rowData }">{{ rowData.prevuTexte }}</template>
        <template #actuel="{ rowData }">
          <span class="fw-semibold">{{ rowData.actuelTexte }}</span>
          <chemin-emplacement
            v-if="rowData.actuelEtapes.length"
            :etapes="rowData.actuelEtapes"
            class="small"
          />
          <span v-if="rowData.change" class="d-block small text-warning-emphasis">
            <strong>Depuis l'inventaire :</strong> {{ rowData.change }}
          </span>
        </template>
        <template #constate="{ rowData }">
          <span class="badge" :class="CLASSES_ETAT[rowData.nature]">
            {{ rowData.constateTexte }}
          </span>
        </template>
        <template #decision="{ rowData }">
          <span v-if="rowData.traite" class="small text-success fw-semibold">
            <font-awesome-icon :icon="['fas', 'check']" class="me-1" />
            {{ rowData.decisionTexte }} · {{ rowData.traitePar }},
            {{ formatDate(rowData.traite_le) }}
            <span v-if="rowData.remarque_traitement" class="d-block fw-normal text-body-secondary">
              {{ rowData.remarque_traitement }}
            </span>
          </span>
          <template v-else>
            <div v-if="rowData.resolution" class="small text-success mb-1">
              <strong>✓ {{ rowData.resolutionTitre }}</strong>
              <span class="text-body-secondary"> · {{ rowData.resolutionTexte }}</span>
            </div>
            <span v-if="!peutTraiter" class="small text-body-secondary">À traiter</span>
            <div v-else class="d-flex flex-wrap gap-2 align-items-center">
              <base-radio
                :model-value="rowData.decisionChoisie"
                :options="rowData.options"
                :label="`Décision pour ${rowData.designation}`"
                button-style
                size="sm"
                @update:model-value="(decision) => (choix[rowData.id] = decision)"
              />
              <button
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="isSubmitting"
                @click="appliquer(rowData)"
              >
                {{ rowData.aConfigurer ? "Appliquer…" : "Appliquer" }}
              </button>
            </div>
          </template>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
