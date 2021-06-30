<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Statistique
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Stats</h3>
          </div>
          <div class="card-body">
            <h4>Exercices</h4>
            <ul>
              <li>Nb exercices par types</li>
              <li>Présences et absences par sapeur</li>
            </ul>
            <h4>Intervention</h4>
            <ul>
              <li>Nb interventions par type</li>
              <li>Nb heures par type intervention</li>
              <li>Statistiques de présences sur intervention</li>
            </ul>
            <h4>Frais</h4>
            <ul>
              <li>Répartition des frais</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

export default {
  name: 'statistiques',
  components: {
    ExerciceComptable,
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
