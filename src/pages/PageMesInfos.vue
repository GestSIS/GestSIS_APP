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
              Mes infos
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
          <div class="tab-pane fade show active" role="tabpanel">
            <div class="col-12">
              <suspense>
                <router-view />
                <template #fallback>Chargement...</template>
              </suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import store from '/src/store/index';

store.dispatch('fetchExercicesComptables');

const routes = [
  { to: { name: 'mes-infos' }, texte: 'Mes infos' },
  { to: { name: 'mes-exercices' }, texte: 'Mes exercices' },
  { to: { name: 'mes-interventions' }, texte: 'Mes interventions' },
  { to: { name: 'mes-absences' }, texte: 'Mes absences' },
  { to: { name: 'mon-materiel' }, texte: 'Mon matériel' },
  { to: { name: 'mes-travaux' }, texte: 'Ma fiche de travail' },
  { to: { name: 'mes-decomptes' }, texte: 'Mes décomptes' },
  { to: { name: 'mes-controles-medicaux' }, texte: 'Mes contrôles médicaux' },
  { to: { name: 'mes-cours' }, texte: 'Mes cours' },
  { to: { name: 'mes-fonctions' }, texte: 'Mes fonctions' },
  { to: { name: 'mes-grades' }, texte: 'Mes grades' },
  { to: { name: 'mes-groupes' }, texte: 'Mes groupes' },
  { to: { name: 'mes-mutations' }, texte: 'Mes mutations' },
  { to: { name: 'mes-permis' }, texte: 'Mes permis' },
];
</script>
