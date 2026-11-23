<script setup>
const model = defineModel();
</script>

<template>
  <base-card title="Références professionnelles">
    <template #body>
      <form role="form">
        <div class="mb-3">
          <label for="m-sap-profession">Profession</label>
          <input
            id="m-sap-profession"
            v-model="model.profession"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="profession"
          />
        </div>
        <div class="mb-3">
          <label for="m-sap-employeur">Employeur</label>
          <input
            id="m-sap-employeur"
            v-model="model.employeur"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="employeur"
          />
        </div>
        <div class="mb-3">
          <label for="m-sap-lieu-travail">Lieu de travail</label>
          <input
            id="m-sap-lieu-travail"
            v-model="model.lieu_de_travail"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="lieu_travail"
          />
        </div>
      </form>
    </template>
  </base-card>
</template>
