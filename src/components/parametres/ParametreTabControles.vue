<script setup>
import { ref } from 'vue';
import ParametreControles from './ParametreControles.vue';

const tab = ref('controles');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres contrôles</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <a
            class="nav-link"
            :class="{ active: tab === 'controles' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'controles'"
          >
            Contrôles et tâches
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <suspense>
        <parametre-controles v-if="tab === 'controles'" />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
  </div>
</template>
