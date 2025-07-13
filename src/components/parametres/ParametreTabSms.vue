<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import ParametreAspsms from './ParametreAspsms.vue';

const store = useStore();
await store.dispatch('fetchAspsmsParams');

const tab = ref('aspsms');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres SMS</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
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
      <parametre-aspsms v-if="tab === 'aspsms'" />
    </div>
  </div>
</template>
