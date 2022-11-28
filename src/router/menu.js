import permissions from '../store/permissions.js';

const links = [
  {
    to: { name: 'mes-exercices' },
    icon: ['fas', 'image-portrait'],
    nom: 'Mes infos',
    sapeur: true,
  },
  {
    to: { name: 'effectif' },
    icon: ['far', 'address-book'],
    nom: 'Effectif',
    permission: permissions.EFFECTIF.TOUT,
  },
  {
    to: { name: 'sapeurs' },
    icon: 'user',
    nom: 'Sapeurs',
    permission: permissions.SAPEUR.LECTURE,
  },
  {
    to: { name: 'interventions' },
    icon: 'fire-extinguisher',
    nom: 'Interventions',
    permission: permissions.INTERVENTION.LECTURE,
  },
  {
    to: { name: 'exercices' },
    icon: ['fas', 'calendar-alt'],
    nom: 'Exercices & Séances',
    permission: permissions.EXERCICE.LECTURE,
  },
  {
    to: { name: 'cours' },
    icon: ['fas', 'medal'],
    nom: 'Cours',
    permission: permissions.COURS.LECTURE,
  },
  {
    to: { name: 'organisation' },
    icon: 'sitemap',
    nom: 'Organisation',
    permission: permissions.ORGANISATION.MODIFICATION,
  },
  {
    to: { name: 'comptabilite-decompte' },
    icon: 'calculator',
    nom: 'Comptabilité',
    permission: permissions.COMPTABILITE.TOUT,
  },
  {
    to: { name: 'publipostage' },
    icon: 'envelope',
    nom: 'Publipostage',
    permission: permissions.SAPEUR.LECTURE,
  },
  {
    to: { name: 'stat-dashboard' },
    icon: ['far', 'chart-bar'],
    nom: 'Statistiques',
  },
  {
    to: { name: 'controles-medicaux' },
    icon: 'file-medical-alt',
    nom: 'Contrôles médicaux',
    permission: permissions.CONTROLE_MEDICAL.TOUT,
  },
  {
    to: { name: 'mat-perso-dashboard' },
    icon: 'shirt',
    nom: 'Matériel personel',
    permission: permissions.MATERIEL_PERSONNEL.LECTURE,
  },
  // {
  //   to: '/impressions',
  //   icon: 'sitemap',
  //   nom: 'Impressions',
  // },
  {
    to: { name: 'users' },
    icon: 'user',
    nom: 'Utilisateurs',
    permission: permissions.ADMIN.TOUT,
  },
  {
    to: { name: 'param-general' },
    icon: 'sliders-h',
    nom: 'Configuration',
    //TODO: See what to do here
    permission: permissions.SIS.CONFIG,
  },
  {
    to: '/rta',
    icon: 'globe-europe',
    nom: 'Exportation RTA',
    permission: permissions.ORGANISATION.MODIFICATION,
  },
  {
    to: { name: 'about' },
    icon: 'info-circle',
    nom: 'A propos',
  },
];

export default links;
