<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Statistique
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab :routes="routes" />
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel"></div>
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import permissions from '../store/permissions.js';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

const routes = [
  { to: { name: 'stat-dashboard' }, texte: 'Résumé' },
  {
    to: { name: 'stat-sapeur' },
    texte: 'Sapeur',
    permission: permissions.SAPEUR.LECTURE,
  },
  {
    to: { name: 'stat-exercice-simple' },
    texte: 'Exercice',
    permission: permissions.EXERCICE.PRESENCE,
  },
  {
    to: { name: 'stat-exercice-presence' },
    texte: 'Présences exercices',
    permission: permissions.EXERCICE.PRESENCE,
  },
  {
    to: { name: 'stat-intervention' },
    texte: 'Intervention',
    permission: permissions.INTERVENTION.MODIFICATION,
  },
  {
    to: { name: 'stat-intervention-presence' },
    texte: 'Présences interventions',
    permission: permissions.INTERVENTION.LECTURE,
  },
  {
    to: { name: 'stat-comptabilite' },
    texte: 'Comptabilité',
    permission: permissions.COMPTABILITE.LECTURE,
  },
];
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
