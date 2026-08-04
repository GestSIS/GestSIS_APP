import permissions from "../composables/permissions.js";

const links = [
  {
    to: { name: "accueil" },
    icon: ["far", "house"],
    nom: "Accueil",
  },
  {
    to: { name: "mes-infos" },
    icon: ["fas", "image-portrait"],
    nom: "Mes infos",
    sapeur: true,
  },
  {
    to: { name: "effectif" },
    icon: ["far", "address-book"],
    nom: "Effectif",
    permission: permissions.EFFECTIF.TOUT,
  },
  {
    to: { name: "sapeur-index", params: { id: 0 } },
    icon: "user",
    nom: "Sapeurs",
    permission: permissions.SAPEUR.LECTURE,
    active: (route) => route.name.startsWith("sapeur"),
  },
  {
    to: { name: "interventions" },
    icon: "fire-extinguisher",
    nom: "Interventions",
    permission: permissions.INTERVENTION.LECTURE,
    active: (route) => route.name.startsWith("intervention"),
  },
  {
    to: { name: "exercices" },
    icon: ["fas", "calendar-alt"],
    nom: "Exercices & Séances",
    permission: permissions.EXERCICE.LECTURE,
    active: (route) => route.name.startsWith("exercice"),
  },
  {
    to: { name: "fiche-travail" },
    icon: ["fas", "business-time"],
    nom: "Fiche de travail",
    permissions: [
      permissions.FICHE_TRAVAIL.SAISIE_PERSO,
      permissions.FICHE_TRAVAIL.LECTURE,
      permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
    ],
  },
  {
    to: { name: "cours" },
    icon: ["fas", "medal"],
    nom: "Cours",
    permission: permissions.COURS.LECTURE,
  },
  {
    to: { name: "organisation" },
    icon: "sitemap",
    nom: "Organisation",
    permission: permissions.ORGANISATION.MODIFICATION,
  },
  {
    to: { name: "absences" },
    icon: "umbrella-beach",
    nom: "Absences",
    permission: permissions.ABSENCE.LECTURE,
  },
  {
    to: { name: "comptabilite-decompte" },
    icon: "calculator",
    nom: "Comptabilité",
    permission: permissions.COMPTABILITE.LECTURE,
  },
  {
    to: { name: "publipostage" },
    icon: "envelope",
    nom: "Publipostage",
    permission: permissions.SAPEUR.LECTURE,
  },
  {
    to: { name: "stat-dashboard" },
    icon: ["far", "chart-bar"],
    nom: "Statistiques",
    permissions: [
      permissions.SAPEUR.LECTURE,
      permissions.EXERCICE.LECTURE,
      permissions.INTERVENTION.LECTURE,
      permissions.COMPTABILITE.LECTURE,
    ],
  },
  {
    to: { name: "controles-medicaux" },
    icon: "file-medical-alt",
    nom: "Contrôles médicaux",
    permission: permissions.CONTROLE_MEDICAL.TOUT,
  },
  {
    to: { name: "materiel-par-type" },
    icon: "shirt",
    nom: "Matériel",
    permission: permissions.MATERIEL.LECTURE,
  },
  // {
  //   to: '/impressions',
  //   icon: 'sitemap',
  //   nom: 'Impressions',
  // },
  {
    to: { name: "utilisateurs" },
    icon: "user",
    nom: "Utilisateurs",
    permission: permissions.UTILISATEUR.TOUT,
  },
  {
    to: { name: "param-general" },
    icon: "sliders-h",
    nom: "Configuration",
    permissions: [
      permissions.COMPTABILITE.CONFIG,
      permissions.CONTROLE_MEDICAL.CONFIG,
      permissions.COURS.CONFIG,
      permissions.EXERCICE.CONFIG,
      permissions.FICHE_TRAVAIL.CONFIG,
      permissions.INTERVENTION.CONFIG,
      permissions.MATERIEL.CONFIG,
      permissions.SAPEUR.CONFIG,
      permissions.SIS.CONFIG,
      permissions.SMS.CONFIG,
      permissions.UTILISATEUR.CONFIG,
    ],
  },
  {
    to: "/rta",
    icon: "globe-europe",
    nom: "Exportation RTA",
    permission: permissions.ORGANISATION.MODIFICATION,
  },
  {
    to: { name: "about" },
    icon: "info-circle",
    nom: "A propos",
  },
];

export default links;
