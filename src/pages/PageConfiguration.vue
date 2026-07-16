<script setup>
import permissions from "../composables/permissions.js";

const routes = [
  {
    to: { name: "param-general" },
    texte: "Général",
  },
  {
    to: { name: "param-exercice-comptable" },
    texte: "Exercice Comptables",
    permission: permissions.COMPTABILITE.CONFIG,
  },
  {
    to: { name: "param-sapeur" },
    texte: "Sapeur",
    permission: permissions.SAPEUR.CONFIG,
  },
  {
    to: { name: "param-exercice" },
    texte: "Exercice",
    permission: permissions.EXERCICE.CONFIG,
  },
  {
    to: { name: "param-intervention" },
    texte: "Intervention",
    permission: permissions.INTERVENTION.CONFIG,
  },
  {
    to: { name: "param-materiel" },
    texte: "Matériel",
    permission: permissions.MATERIEL.CONFIG,
  },
  {
    to: { name: "param-sms" },
    texte: "Sms",
    permission: permissions.SMS.CONFIG,
  },
  {
    to: { name: "param-fiche-travail" },
    texte: "Fiche de travail",
    permission: permissions.FICHE_TRAVAIL.CONFIG,
  },
  {
    to: { name: "param-absence" },
    texte: "Absences",
    permission: permissions.ABSENCE.CONFIG,
  },
  {
    to: { name: "param-comptabilite" },
    texte: "Comptabilité",
    permission: permissions.COMPTABILITE.CONFIG,
  },
  {
    to: { name: "param-controle-medical" },
    texte: "Contrôles médicaux",
    permission: permissions.CONTROLE_MEDICAL.CONFIG,
  },
  {
    to: { name: "param-roles" },
    texte: "Droits et rôles",
    permission: permissions.UTILISATEUR.CONFIG,
  },
];
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">Configuration</li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end"></div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab :routes="routes" />
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active mb-3" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
