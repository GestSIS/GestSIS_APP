<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Mutations RTA
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end"></div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            { to: { name: 'rta-mutations' }, texte: 'Mutations' },
            { to: { name: 'rta-gestsis' }, texte: 'GestSIS' },
            { to: { name: 'rta-reference' }, texte: 'Référence' },
          ]"
        />
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active mb-3" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
