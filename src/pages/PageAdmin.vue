<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Admin</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          :routes="[
            { to: { name: 'admin-sis' }, texte: 'Sis' },
            { to: { name: 'admin-users' }, texte: 'Utilisateurs' },
          ]"
        />
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <div class="col-12">
              <router-view />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
