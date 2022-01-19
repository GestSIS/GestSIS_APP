<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">Frais</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'comptabilite-decompte' }"
          >
            Décomptes
          </router-link>
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: 'comptabilite-compte' }"
          >
            Comptes
          </router-link>
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'comptabilite-exercice' }"
          >
            Exercices
          </router-link>
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'comptabilite-intervention' }"
          >
            Interventions
          </router-link>
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'comptabilite-annuel' }"
          >
            Indemnités et Frais annuels
          </router-link>
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'comptabilite-sapeurs' }"
          >
            Sapeurs
          </router-link>
          <router-link
            tag="a"
            class="nav-item nav-link"
            role="tab"
            active-class="active"
            :to="{ name: 'comptabilite-amendes' }"
          >
            Amendes
          </router-link>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

export default {
  name: 'comptabilite',
  components: {
    ExerciceComptable,
  },
};
</script>

<style lang="scss" scoped></style>
