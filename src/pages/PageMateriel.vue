<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6 col-12">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Matériel</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- <base-navigation-tab
          :routes="[
            { to: { name: 'materiel-liste' }, texte: 'Matériel' },
            { to: { name: 'materiel-inventaire' }, texte: 'Inventaires' },
            { to: { name: 'materiel-maintenance' }, texte: 'Maintenances' },
          ]"
        /> -->
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script></script>

<style></style>
