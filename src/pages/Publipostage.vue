<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Publipostage
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
            <h3>Publipostage</h3>
          </div>
          <div class="card-body">
            <p>Télécharger fichier Excel pour publipostage.</p>
            <button class="btn btn-primary" @click="publipostage">
              Fichier Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';
import PublipostageService from '@/services/PublipostageService';

export default {
  name: 'publipostage',
  components: {
    ExerciceComptable,
  },
  methods: {
    publipostage() {
      PublipostageService.downloadExcel({});
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
