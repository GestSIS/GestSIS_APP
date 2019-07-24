<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              A propos
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
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
              Ce projet a été réalisé dans le cadre de mon Travail de Bachelor à
              la He-Arc à Neuchâtel.
            </p>
            <img src="@/assets/he_arc.png" class="img-fluid" />
            <p>© GestSIS 2019 - Tous droits réservés</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/ExerciceComptable'

export default {
  name: 'exercices',
  components: {
    ExerciceComptable
  }
}
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
