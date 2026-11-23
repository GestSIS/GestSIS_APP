import { groupedByData } from "./index.js";
import { formatDate } from "./formatters.js";
import { etapeEmplacement, etapesEmplacement } from "./materiel.js";

// Saisie d'inventaire : les lignes de l'API regroupées en articles affichables.
// Une pièce numérotée = une ligne ; un lot = les lignes de même clé `lot`, calculée par l'API
// (même nœud, type, désignation, compartiment, taille et péremption).
// État d'un article : todo | ok | manq | def | plus.

export const CLASSES_ETAT = {
  todo: "text-bg-light border",
  ok: "text-bg-success",
  manq: "text-bg-danger",
  def: "text-bg-warning",
  plus: "text-bg-primary",
};

// Lignes de chaque nature d'écart (comme le scope `ecarts` de l'API)
const NATURES = {
  manq: (l) => l.statut === "ABSENT",
  def: (l) => l.statut === "DEFECTUEUX",
  plus: (l) => l.origine === "EN_PLUS",
};
const ecartsParNature = (lignes) =>
  Object.entries(NATURES)
    .map(([etat, estDeNature]) => ({
      etat,
      ligne_ids: lignes.filter(estDeNature).map((l) => l.id),
    }))
    .filter((e) => e.ligne_ids.length > 0);

// Taille et péremption relevées sur l'objet, pour distinguer les variantes d'un même article
export const variantes = (ligne) =>
  [
    ligne.taille && `taille ${ligne.taille}`,
    ligne.date_peremption && `périme ${formatDate(ligne.date_peremption)}`,
  ].filter(Boolean);

const piece = (ligne) => {
  const enPlus = ligne.origine === "EN_PLUS";
  const etat =
    { ABSENT: "manq", DEFECTUEUX: "def", PRESENT: enPlus ? "plus" : "ok" }[ligne.statut] ?? "todo";
  let etiquette = "";
  if (enPlus) {
    etiquette = ligne.article_id ? "Article existant" : "Nouvel article";
    if (ligne.materiel_type_id === null) etiquette = "Nouveau type";
  }
  const texte =
    { todo: "À vérifier", ok: "Conforme", manq: "Manquant", def: "Défectueux" }[etat] ?? "En plus";
  return {
    id: `piece-${ligne.id}`,
    noeudId: ligne.inventaire_emplacement_id,
    estLot: false,
    ligne,
    designation: ligne.designation,
    numero: ligne.numero,
    prevu: enPlus ? 0 : 1,
    etat,
    etiquette,
    variantes: variantes(ligne),
    badges: [{ etat, texte }],
    retirable: enPlus,
    ecarts: ecartsParNature([ligne]),
  };
};

// Un lot est à compter tant qu'une de ses pièces prévues n'est pas vérifiée. Il peut porter
// à la fois des manquantes (ou du surplus) et des défectueuses : un badge, puis un écart, par nature.
const lot = (lignes) => {
  const prevues = lignes.filter((l) => l.origine === "ATTENDU");
  const prevu = prevues.length;
  const constate = prevues.some((l) => l.statut === null)
    ? null
    : lignes.filter((l) => l.statut !== "ABSENT").length;
  const defectueux = prevues.filter((l) => l.statut === "DEFECTUEUX").length;

  const badges = [];
  if (constate === null) badges.push({ etat: "todo", texte: "À compter" });
  else {
    if (constate < prevu) badges.push({ etat: "manq", texte: `−${prevu - constate} manquant` });
    if (constate > prevu) badges.push({ etat: "plus", texte: `+${constate - prevu} en plus` });
    if (defectueux > 0) badges.push({ etat: "def", texte: `${defectueux} défectueux` });
    if (badges.length === 0) badges.push({ etat: "ok", texte: "Conforme" });
  }

  const ligne = prevues[0] ?? lignes[0];
  let etiquette = "";
  if (prevu === 0) etiquette = ligne.materiel_type_id === null ? "Nouveau type" : "Non prévu ici";
  return {
    id: `lot-${ligne.id}`,
    noeudId: ligne.inventaire_emplacement_id,
    estLot: true,
    ligne,
    designation: ligne.designation,
    numero: "non numéroté",
    prevu,
    constate,
    defectueux,
    etat: badges[0].etat,
    etiquette,
    variantes: variantes(ligne),
    badges,
    retirable: prevu === 0,
    ecarts: ecartsParNature(lignes),
  };
};

/**
 * Articles d'un inventaire, indexés par nœud et triés par désignation (les variantes d'un
 * même article se suivent). Chaque article porte ses écarts, un par nature.
 */
export const articlesParNoeud = (lignes) => {
  const lots = Object.values(
    groupedByData(
      lignes.filter((l) => l.lot !== null),
      "lot",
    ),
  );
  const articles = [...lignes.filter((l) => l.lot === null).map(piece), ...lots.map(lot)]
    .map((a) => ({
      ...a,
      ecarts: a.ecarts.map((e) => ({ ...a, ...e, id: `${a.id}-${e.etat}` })),
    }))
    .sort(
      (a, b) =>
        a.designation.localeCompare(b.designation) ||
        (a.ligne.taille ?? "").localeCompare(b.ligne.taille ?? "") ||
        (a.ligne.date_peremption ?? "").localeCompare(b.ligne.date_peremption ?? ""),
    );
  return groupedByData(articles, "noeudId");
};

// Arbres { id, parent_id, tri } : nœuds d'un inventaire, ou emplacements du stock.

/** Le nœud et ses descendants, dans l'ordre de l'arbre. */
export const descendantsEtSoi = (noeudId, noeudsParParent) => [
  noeudId,
  ...[...(noeudsParParent[noeudId] ?? [])]
    .sort((a, b) => a.tri - b.tri)
    .flatMap((n) => descendantsEtSoi(n.id, noeudsParParent)),
];

/** Les ancêtres du nœud puis lui-même, depuis la racine (protégé contre les cycles). */
export const ancetresEtSoi = (noeudId, indexedNoeuds) => {
  const ids = [];
  for (let id = noeudId; id && !ids.includes(id); id = indexedNoeuds[id]?.parent_id) {
    ids.unshift(id);
  }
  return ids;
};

/** Emplacement inventorié (racine du périmètre) ; null s'il a été supprimé depuis. */
export const emplacementInventorie = (inventaire) => inventaire.racine?.emplacement_id ?? null;

/** Chemin actuel de l'emplacement inventorié ; sa désignation figée s'il a été supprimé. */
export const etapesInventaire = (inventaire, indexedEmplacements) => {
  const id = emplacementInventorie(inventaire);
  return id
    ? etapesEmplacement(id, indexedEmplacements)
    : [etapeEmplacement(null, inventaire.racine?.designation ?? inventaire.designation)];
};

/**
 * Étapes de CheminEmplacement pour un nœud, à partir de l'emplacement inventorié (la racine
 * seule pour elle-même) : désignation figée, couleur et icône de l'emplacement actuel.
 */
export const etapesNoeud = (noeudId, indexedNoeuds, indexedEmplacements) => {
  const ids = ancetresEtSoi(noeudId, indexedNoeuds);
  return (ids.length > 1 ? ids.slice(1) : ids).map((id) =>
    etapeEmplacement(
      indexedEmplacements[indexedNoeuds[id].emplacement_id],
      indexedNoeuds[id].designation,
    ),
  );
};

/**
 * Nombre de pièces en écart : chaque ligne compte, un lot pour chacune de ses pièces. Vaut
 * pour les écarts de la saisie comme pour ceux comparés au stock par l'API.
 */
export const piecesEcart = (ecarts) => ecarts.reduce((total, e) => total + e.ligne_ids.length, 0);

// --- Écarts d'un inventaire validé, comparés par l'API au stock actuel ----------------------
// Un écart (cf. InventaireEcartBusiness) : nature manq | def | plus, resolution A_JOUR |
// PLUS_CONCERNE | null, proposition RETIRER | AJOUTER | SUPPRIMER | CREER | DEPLACER | null.

/** Décisions proposées pour un écart (valeur = `decision` de l'API), la première par défaut. */
export const optionsEcart = (ecart) => {
  const sortir = (label) => ({ value: "SORTIR_DU_STOCK", label });
  const ajouter = (label) => ({ value: "AJOUTER_AU_STOCK", label });
  const sansAction = (label) => ({ value: "AUCUNE_ACTION", label });
  const def = ecart.nature === "def";
  switch (ecart.proposition) {
    case "RETIRER":
      return def
        ? [sortir(`Retirer ${ecart.quantite} (hors service)`), sansAction("Noter seulement")]
        : [
            sortir(`Mettre le stock à ${ecart.actuel - ecart.quantite}`),
            sansAction(`Garder ${ecart.actuel}`),
          ];
    case "SUPPRIMER":
      return def
        ? [sansAction("Noter seulement"), sortir("Supprimer l'article (hors service)")]
        : [sansAction("Garder comme manquant"), sortir("Supprimer l'article (perdu)")];
    case "AJOUTER":
    case "CREER": {
      let label = ecart.est_lot ? `Ajouter ${ecart.quantite} au stock…` : "Créer l'article…";
      if (ecart.materiel_type_id === null) label = "Créer ou choisir le type…";
      return [ajouter(label), sansAction("Ignorer")];
    }
    case "DEPLACER":
      return [ajouter("Déplacer ici"), sansAction("Laisser en place")];
    default:
      // Déjà à jour ou plus concerné : rien à faire sur le stock
      return [sansAction("Clore")];
  }
};

/** Résultat affiché d'un écart traité. */
export const LIBELLES_DECISION = {
  SORTIR_DU_STOCK: "Retiré du stock",
  AJOUTER_AU_STOCK: "Ajouté au stock",
  AUCUNE_ACTION: "Clos sans changer le stock",
};

/** « Nom Prénom » d'un sapeur de la liste des sapeurs, « — » s'il n'est pas connu. */
export const nomSapeur = (sapeur) => sapeur?.nom_prenom ?? "—";
