<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">En travaux</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-card>
          <template #title
            ><font-awesome-icon icon="fa-triangle-exclamation" class="text-warning" />
            Page en travaux
            <font-awesome-icon icon="fa-triangle-exclamation" class="text-warning"
          /></template>
          <template #body>
            <p>Cette page est en cours de développement et sera prochainement disponible.</p>
            <p>
              Regarder les notifications
              <router-link v-slot="{ navigate }" :to="{ name: 'about' }" custom>
                <button class="btn btn-link nav-link d-inline-block me-1 ms-1" @click="navigate">
                  <font-awesome-icon :icon="['fas', 'bell']" />
                  <span class="position-absolute translate-middle p-1 bg-danger rounded-circle">
                    <span class="visually-hidden">Notifications</span>
                  </span>
                </button>
              </router-link>
              pour ne pas manquer les nouveautés !
            </p>
          </template>
        </base-card>
      </div>
    </div>
  </div>
</template>
