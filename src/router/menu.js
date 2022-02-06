import permissions from '@/store/permissions.js';

const links = [
  {
    to: { name: 'effectif' },
    icon: ['far', 'address-book'],
    nom: 'Effectif',
    permission: permissions.SAPEUR.LECTURE,
  },
  {
    to: { name: 'sapeurs' },
    icon: 'user',
    nom: 'Sapeurs',
    permission: permissions.SAPEUR.MODIFICATION,
  },
  {
    to: { name: 'interventions' },
    icon: 'fire-extinguisher',
    nom: 'Interventions',
    permission: permissions.INTERVENTION.MODIFICATION,
  },
  {
    to: { name: 'exercices' },
    icon: ['fas', 'calendar-alt'],
    nom: 'Exercices & Séances',
    permission: permissions.EXERCICE.PRESENCE,
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
  // {
  //   to: '/matériel',
  //   icon: 'toolbox',
  //   nom: 'Matériel personel',
  // },
  {
    to: { name: 'controles-medicaux' },
    icon: 'file-medical-alt',
    nom: 'Contrôles médicaux',
    permission: permissions.CONTROLE_MEDICAL.TOUT,
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
    permission: permissions.ORGANISATION.CONFIG,
  },
  {
    to: { name: 'about' },
    icon: 'info-circle',
    nom: 'A propos',
  },
];

export default links;
