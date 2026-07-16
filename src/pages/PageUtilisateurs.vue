<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Utilisateurs</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            { to: { name: 'utilisateurs' }, texte: 'Utilisateurs' },
            {
              to: { name: 'utilisateurs-manquants' },
              texte: 'Sapeurs sans comptes',
            },
          ]"
        />
      </div>
      <router-view />
    </div>
  </div>
</template>
