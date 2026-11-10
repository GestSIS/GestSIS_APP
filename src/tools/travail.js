import { EXERCICE_STATUT } from "./exercice.js";
import { INTERVENTION_STATUT } from "./intervention.js";

// Statut d'une fiche de travail personnel/commun, centralisé (utilisé dans
// comptabilite/ComptabiliteTabTravaux.vue et mes_infos/MesTravaux.vue).
// Valeurs des statuts, pour les comparaisons dans le code
export const TRAVAIL_STATUT = {
  REFUSE: -1,
  EN_ATTENTE: 0,
  ACCEPTE: 1,
  IMPUTE: 2,
};

export const travailStatuts = {
  [TRAVAIL_STATUT.REFUSE]: { label: "Refusé", badgeClass: "text-bg-danger" },
  [TRAVAIL_STATUT.EN_ATTENTE]: { label: "En attente", badgeClass: "text-bg-warning" },
  [TRAVAIL_STATUT.ACCEPTE]: { label: "Accepté", badgeClass: "text-bg-primary" },
  [TRAVAIL_STATUT.IMPUTE]: { label: "Imputé", badgeClass: "text-bg-success" },
};

export function travailStatut(statut) {
  return travailStatuts[statut] ?? { label: "Inconnu", badgeClass: "text-bg-secondary" };
}

export const travailStatutOptions = Object.entries(travailStatuts).map(([id, s]) => ({
  id: Number(id),
  designation: s.label,
}));

// Événement auquel une fiche de travail est liée (utilisé dans PageTravaux.vue et
// mes_infos/MesTravaux.vue). L'API charge `intervention` (id, date_debut, objet, statut)
// et `exercice` (id, date, designation, statut).

// Une fois l'événement validé (ou l'exercice annulé), ses fiches ne se remettent plus en
// attente et ne se modifient plus que par son validateur (depuis l'événement)
export function evenementVerrouille(travail) {
  if (travail?.intervention) {
    return travail.intervention.statut >= INTERVENTION_STATUT.VALIDEE;
  }
  if (travail?.exercice) {
    return (
      travail.exercice.statut === EXERCICE_STATUT.ANNULE ||
      travail.exercice.statut >= EXERCICE_STATUT.VALIDE
    );
  }
  return false;
}

const dateFr = (date) => new Date(date).toLocaleDateString("fr-CH");

export function lienTravail(travail) {
  if (travail?.intervention) {
    return {
      libelle:
        "Intervention " +
        dateFr(travail.intervention.date_debut) +
        " - " +
        travail.intervention.objet,
      route: { name: "intervention-presence", params: { id: String(travail.intervention.id) } },
    };
  }
  if (travail?.exercice) {
    return {
      libelle: "Exercice " + dateFr(travail.exercice.date) + " - " + travail.exercice.designation,
      route: { name: "exercice-presence", params: { id: String(travail.exercice.id) } },
    };
  }
  return null;
}
