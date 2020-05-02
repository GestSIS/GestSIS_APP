<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'exercices' }">
                Controles médicaux
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav v-if="!newMode">
          <div class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: !tabPresence }"
              role="tab"
              href="#"
              @click.prevent="tabPresence = false"
            >
              Informations
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: tabPresence }"
              role="tab"
              href="#"
              @click.prevent="tabPresence = true"
            >
              Présences
            </button>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <ExerciceTabSapeurs v-if="tabPresence"></ExerciceTabSapeurs>
            <ExerciceTabGeneral
              :newMode="newMode"
              v-if="!tabPresence"
            ></ExerciceTabGeneral>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex';

export default {
  name: 'controleMedical',
  data() {
    return {
      tabPresence: true,
      loading: true
    };
  },
  props: {
    id: {
      type: String
    }
  }
};
</script>

<style lang="scss" scoped></style>
