<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" to="/">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Configuration
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <!--        <exercice-comptable />-->
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav>
          <div class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
            <router-link
              :to="{ name: 'configuration' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Général</span>
            </router-link>
            <router-link
              :to="{ name: 'param-exercice-comptable' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Exercice Comptables</span>
            </router-link>
            <router-link
              :to="{ name: 'param-sapeur' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Sapeur</span>
            </router-link>
            <router-link
              :to="{ name: 'param-exercice' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Exercice</span>
            </router-link>
            <router-link
              :to="{ name: 'param-intervention' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Intervention</span>
            </router-link>
            <router-link
              :to="{ name: 'param-frais' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Frais</span>
            </router-link>
            <router-link
              :to="{ name: 'param-controle-medical' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Contrôles médicaux</span>
            </router-link>
            <router-link
              :to="{ name: 'param-droits' }"
              class="btn btn-link nav-item nav-link"
              active-class="active"
              role="tab"
              tag="button"
            >
              <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
              <span>Droits et rôles</span>
            </router-link>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view></router-view>
            <div v-if="activeTab === 'general'">TODO Info générales</div>
            <div v-if="activeTab === 'sapeur'">
              TODO
              <ul>
                <li>Type de téléphone</li>
                <li>Nombre de numéro max par sapeur</li>
                <li>Liste des cours spécifique au SIS</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'exercice-comptable'">
              <ul>
                <li>Exercices comptables</li>
                <li>Ajouter, supprimer, clôturer</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'exercice'">
              TODO
              <ul>
                <li>Excuses types</li>
                <li>Type d'exercice avec amendable ou non</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'intervention'">
              TODO
              <ul>
                <li>Véhicules</li>
                <li>Matériel</li>
                <li>Missions type</li>
                <li>Annuaire de téléphones</li>
                <li>Catégorie intervention</li>
                <li>Stat fédéral -> Dans section admin</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'frais'">
              TODO
              <ul>
                <li>Liste des Comptes</li>
                <li>Type de frais pour exercices</li>
                <li>Type de frais pour interventions</li>
                <li>Catégories de revenus</li>
                <li>Exercices comptabes</li>
                <li>Coordonnées bancaire du SIS pour ISO20022</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'medical'">
              TODO
              <ul>
                <li>Médecins</li>
                <li>Type de contrôles</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'droits'">
              TODO
              <ul>
                <li>Droits et rôles</li>
                <li>Rôle et droits liés aux rôles</li>
              </ul>
            </div>
            <div v-else-if="activeTab === 'autres'">
              <p>TODO Nouvelle application ?</p>
              <p>
                Les données suivantes sont celles correspondantes à
                l'application GestSIS 1.0
              </p>
              <ul>
                <li>Localités et communes</li>
                <li>Cours cantonaux</li>
                <li>Fonctions</li>
                <li>Grades</li>
                <li>Stat fédéral</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

// import InterventionTabGeneral from '@/components/InterventionTabGeneral.vue'

export default {
  name: 'configuration',
  data() {
    return {
      activeTab: 'general',
    };
  },
  // props: {
  //   id: {
  //     type: String
  //   }
  // },
  computed: {
    // ...mapGetters(['activeInterventionData', 'activeInterventionId']),
  },
  mounted() {
    // this.$store.dispatch('fetchListeSapeur')
    // this.$store.dispatch('fetchLocalites')
    // this.$store.dispatch('fetchInterventionTraitements')
    // this.$store.dispatch('fetchExercicesComptables')
    // this.$store.dispatch('fetchTypeInterventions')
    // this.$store.dispatch('fetchStatFederals')
    // let id = parseInt(this.id)
    // let svm = this
    // if (this.newMode) {
    //   this.$store
    //     .dispatch('resetActiveIntervention')
    //     .then(() => (svm.loading = false))
    // } else {
    //   this.$store.dispatch('selectIntervention', id)
    //   this.$store
    //     .dispatch('fetchIntervention', id)
    //     .then(() => (svm.loading = false))
    // }
  },
};
</script>

<style lang="scss" scoped></style>
