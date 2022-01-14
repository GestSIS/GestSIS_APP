<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">A propos</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>A propos</h3>
          </div>
          <div class="card-body">
            <h1>GestSIS</h1>
            <p>
              Application métier pour la gestion d'un service d'incendie et de
              secours.
            </p>
            <p>Auteur : Bastien Wermeille</p>
            <p>
              <!-- TODO: Ajout sujet par défault - Nom SIS -->
              <a href="mailto:support@gestsis.ch">Contacter</a>
            </p>
            <p>
              GestSIS © {{ new Date().getFullYear() }} - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

export default {
  name: 'about',
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
