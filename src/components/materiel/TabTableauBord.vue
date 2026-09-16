<script setup>
import WidgetControlesAControler from "./WidgetControlesAControler.vue";
import WidgetLimiteExecutions from "./WidgetLimiteExecutions.vue";
import WidgetMaterielPerime from "./WidgetMaterielPerime.vue";
import WidgetMaterielARecuperer from "./WidgetMaterielARecuperer.vue";
</script>

<template>
  <div class="row">
    <div class="col-12 col-xl-4">
      <suspense>
        <widget-materiel-a-recuperer />
        <template #fallback>Chargement...</template>
      </suspense>
      <suspense>
        <widget-materiel-perime />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
    <div class="col-12 col-xl-8">
      <suspense>
        <widget-controles-a-controler />
        <template #fallback>Chargement...</template>
      </suspense>
      <suspense>
        <widget-limite-executions />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
  </div>
</template>
