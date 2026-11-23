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
        <base-card>
          <template #title
            ><font-awesome-icon icon="fa-triangle-exclamation" class="text-warning" /> Page
            introuvable</template
          >
          <template #body>
            <p>Cette page n'existe pas ou a été déplacée. Vérifiez le lien utilisé.</p>
            <router-link :to="{ name: 'accueil' }" class="btn btn-primary">
              Retour à l'accueil
            </router-link>
          </template>
        </base-card>
      </div>
    </div>
  </div>
</template>
