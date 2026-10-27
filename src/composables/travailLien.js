// Événement auquel une fiche de travail est liée (utilisé dans PageTravaux.vue et
// mes_infos/MesTravaux.vue). L'API charge `intervention` (id, date_debut, objet, statut)
// et `exercice` (id, date, designation, statut).

// Statuts (InterventionBusiness / ExerciceBusiness)
const INTERVENTION_VALIDEE = 2;
const EXERCICE_ANNULE = 0;
const EXERCICE_VALIDE = 3;

// Une fois l'événement validé (ou l'exercice annulé), ses fiches ne se remettent plus en
// attente et ne se modifient plus que par son validateur (depuis l'événement)
export function evenementVerrouille(travail) {
  if (travail?.intervention) {
    return travail.intervention.statut >= INTERVENTION_VALIDEE;
  }
  if (travail?.exercice) {
    return (
      travail.exercice.statut === EXERCICE_ANNULE || travail.exercice.statut >= EXERCICE_VALIDE
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
