<script setup>
import { ref } from "vue";
import { useAspsmsParamStore } from "../../stores/sms/AspsmsParam.js";
import ParametreAspsms from "./ParametreAspsms.vue";

const aspsmsParamStore = useAspsmsParamStore();
await aspsmsParamStore.fetchParams();

const tab = ref("aspsms");
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3">
      <base-card title="Paramètres SMS">
        <template #default>
          <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
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
        </template>
      </base-card>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-aspsms v-if="tab === 'aspsms'" />
    </div>
  </div>
</template>
