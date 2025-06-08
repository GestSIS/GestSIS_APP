<script setup>
const model = defineModel();
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Références professionnelles</h3>
    </div>
    <form role="form">
      <div class="card-body">
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
      </div>
    </form>
  </div>
</template>

<style scoped></style>
