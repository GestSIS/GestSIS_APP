<script setup>
const activeSapeur = defineModel();
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Informations bancaires</h3>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label for="f-sap-nom">IBAN</label>
        <input
          id="f-sap-nom"
          v-model="activeSapeur.iban"
          type="text"
          class="form-control form-control-sm"
          name="nom"
          disabled
        />
      </div>
    </div>
  </div>
</template>
