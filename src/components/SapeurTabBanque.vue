<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <div class="card-header">
          <h3 class="card-title">Informations bancaires</h3>
        </div>
        <!-- /.card-header -->
        <div class="card-body">
          <!-- IBAN -->
          <div class="form-group">
            <label for="f-sap-nom">IBAN</label>
            <input
              type="text"
              class="form-control"
              id="f-sap-nom"
              name="nom"
              :value="activeSapeur.iban"
            />
          </div>
          <div class="form-group">
            <!-- TODO Add a list when IBAN has been entered to present a list of the banks which are available -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabBanque',
  computed: {
    ...mapGetters(['activeSapeur'])
  }
}
</script>

<style scoped></style>
