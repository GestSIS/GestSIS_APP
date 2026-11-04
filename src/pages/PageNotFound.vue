<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Page introuvable</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>
              <font-awesome-icon icon="fa-triangle-exclamation" class="text-warning" />
              Page introuvable
            </h3>
          </div>
          <div class="card-body">
            <p>Cette page n'existe pas ou a été déplacée. Vérifiez le lien utilisé.</p>
            <router-link :to="{ name: 'accueil' }" class="btn btn-primary">
              Retour à l'accueil
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
