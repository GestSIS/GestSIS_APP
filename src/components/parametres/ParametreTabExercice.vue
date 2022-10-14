<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3">
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
            Excuses types
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'aspsms' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'aspsms'"
          >
            ASPSMS
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-exercice-categorie v-if="tab === 'categorie'" />
      <parametre-excuse-type v-if="tab === 'excuse'" />
      <parametre-aspsms v-if="tab === 'aspsms'" />
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import ParametreExerciceCategorie from './ParametreExerciceCategorie.vue';
import ParametreExcuseType from './ParametreExcuseType.vue';
import ParametreAspsms from './ParametreAspsms.vue';

async function loadData(_, next) {
  const loadExcuses = store.dispatch('fetchExcuseTypes');
  const loadCategories = store.dispatch('fetchExerciceCategories');
  const loadAspsmsParams = store.dispatch('fetchAspsmsParams');

  Promise.all([loadExcuses, loadCategories, loadAspsmsParams]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExercice',
  components: {
    ParametreExcuseType,
    ParametreExerciceCategorie,
    ParametreAspsms,
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
