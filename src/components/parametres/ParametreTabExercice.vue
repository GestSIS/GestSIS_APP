<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-3">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres exercices</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'categorie' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'categorie'"
          >
            Catégories
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'excuse' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'excuse'"
          >
            Excuses
          </a>
        </nav>
      </div>
    </div>
    <div v-if="tab === 'categorie'" class="col-sm-12 col-xl-9">
      <parametre-exercice-categorie />
    </div>
    <div v-if="tab === 'excuse'" class="col-sm-12 col-xl-6 col-md-6">
      <parametre-excuse />
    </div>
    <div v-if="tab === 'excuse'" class="col-sm-12 col-xl-6 col-md-6">
      <parametre-excuse-type />
    </div>
  </div>
</template>

<script>
import store from '/src/store/index';
import ParametreExerciceCategorie from './ParametreExerciceCategorie.vue';
import ParametreExcuseType from './ParametreExcuseType.vue';
import ParametreExcuse from './ParametreExcuse.vue';

async function loadData(_, next) {
  const loadExcuses = store.dispatch('fetchExcuseTypes');
  const loadCategories = store.dispatch('fetchExerciceCategories');
  store.dispatch('fetchAspsmsParams');

  Promise.all([loadExcuses, loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExercice',
  components: {
    ParametreExcuseType,
    ParametreExcuse,
    ParametreExerciceCategorie,
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return { tab: 'categorie' };
  },
};
</script>

<style scoped></style>
