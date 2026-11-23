<script setup>
import { computed, reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useSubmit } from "../../composables/useSubmit.js";
import { indexedData } from "../../tools/index.js";
import { descendantsEtSoi, etapesNoeud } from "../../tools/inventaire.js";
import { etapesEmplacement } from "../../tools/materiel.js";
import ScanArticle from "../materiel/ScanArticle.vue";
import CheminEmplacement from "../materiel/CheminEmplacement.vue";

// data : { noeudId, numero? } — nœud proposé, numéro déjà scanné dans la page
// callback(noeudId) : appelé après chaque ajout, avec le nœud où le matériel a été trouvé
const { data, callback } = defineProps({
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
const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const { isSubmitting, submit } = useSubmit();

const NOUVEAU_TYPE = -1;
// Relevé sur l'objet, repris à la création de l'article par le responsable
const DETAILS_VIDES = {
  compartiment: "",
  taille: "",
  date_peremption: "",
  est_etiquete: false,
  remarque_sapeur: "",
};
const form = reactive({
  inventaire_emplacement_id: data.noeudId,
  numerote: true,
  numero: "",
  materiel_type_id: "",
  nouveau_type: "",
  quantite: 1,
  ...DETAILS_VIDES,
});
// Résultat du scan : la ligne de l'inventaire, sinon l'article connu (null = inconnu)
const scan = ref(null);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
// « Cabine › Coffre radios » : chemin dans l'inventaire, sans la racine.
const libelleNoeud = (noeudId) =>
  etapesNoeud(noeudId, inventaireStore.indexedNoeuds, indexedEmplacements.value)
    .map((e) => e.designation)
    .join(" › ");
const piecesNumerotees = computed(() =>
  inventaireStore.courant.lignes.filter((l) => l.numero !== null),
);

const computedData = computed(() => {
  const { ligne, article } = scan.value ?? {};
  const ici = form.inventaire_emplacement_id;
  const nouveauType = form.materiel_type_id === NOUVEAU_TYPE;
  const type = materielTypeStore.liste.find((t) => t.id === form.materiel_type_id);
  const nomType = nouveauType ? form.nouveau_type.trim() : (type?.designation ?? "");
  const inconnu = scan.value !== null && !ligne && !article;
  const lotPrevu =
    !form.numerote &&
    inventaireStore.courant.lignes.some(
      (l) =>
        l.numero === null &&
        l.origine === "ATTENDU" &&
        l.inventaire_emplacement_id === ici &&
        l.materiel_type_id === form.materiel_type_id,
    );

  let carte = null;
  if (ligne?.origine === "EN_PLUS") {
    carte = {
      classe: "alert-warning",
      texte: "Déjà ajouté dans",
      noeudId: ligne.inventaire_emplacement_id,
      fin: ".",
    };
  } else if (ligne) {
    const prevuIci = ligne.inventaire_emplacement_id === ici;
    carte = {
      classe: "alert-success",
      texte: prevuIci ? "Prévu ici" : "Prévu dans",
      noeudId: prevuIci ? null : ligne.inventaire_emplacement_id,
      fin: " : il sera marqué présent.",
    };
  } else if (article) {
    carte = {
      classe: "alert-info",
      texte: `${article.designation}, ${article.attribue ? "attribué à un sapeur" : "rattaché à"}`,
      etapes: article.attribue
        ? []
        : etapesEmplacement(article.emplacement_id, indexedEmplacements.value),
      fin: ". Il sera ajouté ici, le responsable décidera du déplacement.",
    };
  } else if (inconnu) {
    carte = {
      classe: "alert-warning",
      texte: "Numéro inconnu : choisissez son type, le responsable créera l'article.",
      fin: "",
    };
  }

  let resume = "";
  if (form.numerote && scan.value === null) resume = "Scannez l'article ou saisissez son numéro.";
  else if (ligne?.origine === "EN_PLUS") resume = "Rien à ajouter.";
  else if (ligne) resume = `${ligne.numero} marqué présent.`;
  else if ((inconnu || !form.numerote) && nomType === "") {
    resume = nouveauType ? "Donnez un nom au nouveau type." : "Choisissez le type.";
  } else if (form.numerote) {
    resume = `1 × ${article?.designation ?? nomType} ${form.numero} ajouté en plus dans ${libelleNoeud(ici)}.`;
  } else {
    resume = `${form.quantite} × ${nomType} ajouté(s) en plus dans ${libelleNoeud(ici)}.`;
  }

  // Un ajout (pas une pièce prévue) ; création d'article : numéro inconnu ou lot
  const ajout = !ligne && (!form.numerote || scan.value !== null);
  const creation = inconnu || !form.numerote;
  return {
    carte,
    resume,
    ajout,
    // Le compartiment n'a de sens que dans un emplacement compartimenté
    compartimentable:
      indexedEmplacements.value[inventaireStore.indexedNoeuds[ici]?.emplacement_id]
        ?.est_compartimentable ?? false,
    taille: creation && (nouveauType || type?.est_taillee),
    peremption: creation && (nouveauType || type?.est_perimable),
    etiquete: inconnu,
    demandeType: inconnu || !form.numerote,
    nouveauType,
    lotPrevu,
    marquePresent: ligne?.origine === "ATTENDU",
    bloque:
      ligne?.origine === "EN_PLUS" ||
      (form.numerote && scan.value === null) ||
      ((inconnu || !form.numerote) && nomType === ""),
    noeuds: descendantsEtSoi(inventaireStore.racine.id, inventaireStore.noeudsParParent).map(
      (id) => ({ id, designation: libelleNoeud(id) }),
    ),
    // Le type absent du catalogue en tête : la liste des types peut être longue
    types: [
      { id: NOUVEAU_TYPE, designation: "+ Type absent de la liste…" },
      ...materielTypeStore.liste.filter((t) => t.statut && t.est_numerote === form.numerote),
    ],
  };
});

const modes = [
  { value: true, label: "Un article numéroté" },
  { value: false, label: "Du matériel non numéroté" },
];

const recommencer = () => {
  Object.assign(form, {
    numero: "",
    materiel_type_id: "",
    nouveau_type: "",
    quantite: 1,
    ...DETAILS_VIDES,
  });
  scan.value = null;
};
const changerMode = (numerote) => {
  form.numerote = numerote;
  recommencer();
};

const scanner = (ligne) => {
  form.numero = ligne.numero;
  scan.value = { ligne };
};
const chercher = async (numero) => {
  form.numero = numero;
  const { ok, data: article } = await submit(
    () => inventaireStore.chercherArticle(numero),
    "Impossible de rechercher le numéro",
  );
  scan.value = ok ? { article } : null;
};

const enregistrer = () => {
  const { ligne } = scan.value ?? {};
  if (ligne) {
    return inventaireStore.modifierLigne(ligne.id, { statut: "PRESENT" });
  }
  const nouveauType = form.materiel_type_id === NOUVEAU_TYPE;
  return inventaireStore.ajouterEnPlus({
    inventaire_emplacement_id: form.inventaire_emplacement_id,
    numero: form.numerote ? form.numero : null,
    materiel_type_id: nouveauType || form.materiel_type_id === "" ? null : form.materiel_type_id,
    nouveau_type: nouveauType ? form.nouveau_type.trim() : null,
    quantite: form.numerote ? 1 : form.quantite,
    compartiment: computedData.value.compartimentable ? form.compartiment : "",
    taille: computedData.value.taille ? form.taille : null,
    date_peremption: computedData.value.peremption ? form.date_peremption || null : null,
    est_etiquete: computedData.value.etiquete && form.est_etiquete,
    remarque_sapeur: form.remarque_sapeur,
  });
};
const ajouter = async (continuer) => {
  const noeudId = scan.value?.ligne?.inventaire_emplacement_id ?? form.inventaire_emplacement_id;
  const { ok } = await submit(
    enregistrer,
    "Impossible d'ajouter le matériel",
    computedData.value.resume,
  );
  if (!ok) return;
  callback(noeudId);
  if (continuer) recommencer();
  else closeModal();
};

if (data.numero) {
  await chercher(data.numero);
}
</script>

<template>
  <form @submit.prevent="ajouter(false)">
    <div class="modal-header">
      <h5 class="modal-title">Ajouter du matériel trouvé</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <base-select
          v-model="form.inventaire_emplacement_id"
          :options="computedData.noeuds"
          label="1. Où l'avez-vous trouvé ?"
          :required="true"
        />
      </div>

      <base-radio
        :model-value="form.numerote"
        :options="modes"
        label="2. Qu'avez-vous trouvé ?"
        button-style
        @update:model-value="changerMode"
      />

      <div v-if="form.numerote" class="mt-3">
        <scan-article
          v-if="scan === null"
          :articles="piecesNumerotees"
          accepte-inconnu
          @scan="scanner"
          @inconnu="chercher"
        />
        <div v-else class="d-flex align-items-center gap-2 mb-2">
          <span class="fw-semibold">Numéro scanné</span>
          <span class="font-monospace border rounded px-2 bg-body-tertiary">{{ form.numero }}</span>
          <button type="button" class="btn btn-link btn-sm" @click="recommencer">
            Scanner un autre numéro
          </button>
        </div>
        <div v-if="computedData.carte" class="alert py-2 mb-0" :class="computedData.carte.classe">
          {{ computedData.carte.texte }}
          <span v-if="computedData.carte.noeudId" class="fw-semibold">
            {{ libelleNoeud(computedData.carte.noeudId) }}
          </span>
          <chemin-emplacement
            v-if="computedData.carte.etapes?.length"
            :etapes="computedData.carte.etapes"
          />{{ computedData.carte.fin }}
        </div>
      </div>

      <div v-if="computedData.demandeType" class="row g-2 mt-2 align-items-end">
        <div class="col">
          <base-select
            v-model="form.materiel_type_id"
            :options="computedData.types"
            label="Type"
            :required="true"
            placeholder="Choisir…"
          />
        </div>
        <div v-if="!form.numerote" class="col-auto">
          <label for="ajout-quantite" class="form-label mb-1">Quantité trouvée</label>
          <div class="input-group input-group-sm">
            <button
              type="button"
              class="btn btn-outline-secondary"
              aria-label="Une de moins"
              :disabled="form.quantite <= 1"
              @click="form.quantite--"
            >
              −
            </button>
            <input
              id="ajout-quantite"
              v-model.number="form.quantite"
              type="number"
              min="1"
              max="1000"
              class="form-control text-center"
              style="width: 70px"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              aria-label="Une de plus"
              @click="form.quantite++"
            >
              +
            </button>
          </div>
        </div>
        <div v-if="computedData.nouveauType" class="col-12">
          <label for="ajout-nouveau-type" class="form-label mb-1">Nom du nouveau type</label>
          <input
            id="ajout-nouveau-type"
            v-model="form.nouveau_type"
            type="text"
            required
            maxlength="255"
            class="form-control form-control-sm"
            placeholder="Ex. Seau pliable"
          />
          <div class="form-text">
            Le responsable matériel le créera dans le catalogue en traitant les écarts.
          </div>
        </div>
        <div v-if="computedData.lotPrevu" class="col-12">
          <div class="alert alert-info py-2 mb-0">
            Ce type est déjà prévu ici : à compartiment, taille et péremption identiques, la
            quantité s'ajoute à celle comptée ; sinon elle forme sa propre ligne.
          </div>
        </div>
      </div>

      <div v-if="computedData.ajout" class="row g-2 mt-1">
        <div v-if="computedData.compartimentable" class="col-md-4 col-6">
          <label for="ajout-compartiment" class="form-label mb-1">Compartiment</label>
          <input
            id="ajout-compartiment"
            v-model="form.compartiment"
            type="text"
            maxlength="255"
            class="form-control form-control-sm"
          />
        </div>
        <div v-if="computedData.taille" class="col-md-3 col-6">
          <label for="ajout-taille" class="form-label mb-1">Taille</label>
          <input
            id="ajout-taille"
            v-model="form.taille"
            type="text"
            maxlength="255"
            class="form-control form-control-sm"
          />
        </div>
        <div v-if="computedData.peremption" class="col-md-3 col-6">
          <label for="ajout-peremption" class="form-label mb-1">Péremption</label>
          <input
            id="ajout-peremption"
            v-model="form.date_peremption"
            type="date"
            class="form-control form-control-sm"
          />
        </div>
        <div v-if="computedData.etiquete" class="col-auto d-flex align-items-end">
          <base-checkbox v-model="form.est_etiquete" label="Étiqueté" />
        </div>
        <div class="col-12">
          <label for="ajout-precision" class="form-label mb-1">Précision pour le responsable</label>
          <input
            id="ajout-precision"
            v-model="form.remarque_sapeur"
            type="text"
            maxlength="1000"
            class="form-control form-control-sm"
            placeholder="Ex. sous le siège passager"
          />
        </div>
      </div>

      <div class="border-top mt-3 pt-2">
        <span class="small text-uppercase text-body-secondary me-2">Résultat</span>
        <span class="fw-semibold" :class="{ 'text-body-secondary': computedData.bloque }">
          {{ computedData.resume }}
        </span>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Annuler</button>
      <button
        type="button"
        class="btn btn-outline-primary"
        :disabled="isSubmitting || computedData.bloque"
        @click="ajouter(true)"
      >
        Ajouter et continuer
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting || computedData.bloque">
        {{ computedData.marquePresent ? "Marquer présent" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
