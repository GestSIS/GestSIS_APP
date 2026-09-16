<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres matériel personnel</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-categorie' }"
          >
            Catégories et type de matériel
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-couleur' }"
          >
            Couleurs
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-emplacement' }"
          >
            Emplacements
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-hangar' }"
          >
            Hangars
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-batterie-type' }"
          >
            Batteries types
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-tuyau-diametre' }"
          >
            Tuyau diamètres
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-materiel-controles' }"
          >
            Contrôles
          </router-link>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <suspense>
        <router-view />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
  </div>
</template>
