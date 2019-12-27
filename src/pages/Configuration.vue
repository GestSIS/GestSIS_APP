<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" to="/">
              Accueil
            </router-link>
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
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'general' }"
              role="tab"
              @click.prevent="activeTab = 'general'"
            >
              General
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'sapeur' }"
              role="tab"
              @click.prevent="activeTab = 'sapeur'"
            >
              Sapeurs
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'exercice' }"
              role="tab"
              @click.prevent="activeTab = 'exercice'"
            >
              Exercices
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'intervention' }"
              role="tab"
              @click.prevent="activeTab = 'intervention'"
            >
              Interventions
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'frais' }"
              role="tab"
              @click.prevent="activeTab = 'frais'"
            >
              Frais
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'medical' }"
              role="tab"
              @click.prevent="activeTab = 'medical'"
            >
              Contrôles médicaux
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'droits' }"
              role="tab"
              @click.prevent="activeTab = 'droits'"
            >
              Droits
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'admin' }"
              role="tab"
              @click.prevent="activeTab = 'admin'"
            >
              GestSIS Admin
            </button>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <div v-if="activeTab === 'general'">
              TODO Info générales
            </div>
            <div v-if="activeTab === 'sapeur'">
              TODO
              <ul>
                <li>Type de téléphone</li>
                <li>Nombre de numéro max par sapeur</li>
                <li>Liste des cours spécifique au SIS</li>
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
            <div v-else-if="activeTab === 'droits'">
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
// import InterventionTabSapeurs from '@/components/InterventionTabSapeurs.vue'
// import InterventionTabMateriel from '@/components/InterventionTabMateriel.vue'
// import InterventionTabVehicule from '@/components/InterventionTabVehicule.vue'
// import InterventionTabJournal from '@/components/InterventionTabJournal.vue'
// import ExerciceComptable from '@/components/ExerciceComptable'

export default {
  name: 'configuration',
  data() {
    return {
      activeTab: 'general'
    };
  },
  components: {
    // ExerciceComptable
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
    // this.$store.dispatch('fetchListSapeur')
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
  }
};
</script>

<style lang="scss" scoped></style>
