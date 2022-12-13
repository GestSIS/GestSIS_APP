<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres fiche travail</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'type' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'type'"
          >
            Travaux types
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-travail-type v-if="tab === 'type'" />
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import ParametreTravailType from './ParametreTravailType.vue';

async function loadData(_, next) {
  const loadTravailTypes = store.dispatch('fetchTravailTypes');

  Promise.all([loadTravailTypes]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExercice',
  components: {
    ParametreTravailType,
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return { tab: 'type' };
  },
};
</script>

<style scoped></style>
