<script setup>
const activeSapeur = defineModel();
</script>

<template>
  <base-card title="Informations bancaires">
    <template #body>
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
    </template>
  </base-card>
</template>
