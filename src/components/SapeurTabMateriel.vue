<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-body">
          <table class="table">
            <tbody>
              <tr v-for="permis in listPermisType">
                <td class="text-right">
                  <font-awesome-icon
                    class="text-danger"
                    v-if="permis.type.toLowerCase() === 'c1'"
                    style="font-size:1.7em"
                    :icon="['fab', 'gripfire']"
                  />
                  <img
                    :src="`${publicPath}icons/${permis.type.toLowerCase()}.gif`"
                  />
                </td>
                <td>
                  <p>{{ permis.type }}</p>
                </td>
                <td>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="" class="input-group-text">
                        <font-awesome-icon icon="calendar" />
                      </div>
                    </div>
                    <input
                      type="date"
                      class="form-control"
                      :value="
                        activeSapeurPermis
                          .map(p => p.permis_type_id)
                          .includes(permis.id)
                          ? activeSapeurPermis.filter(
                              p => p.permis_type_id === permis.id
                            )[0].date
                          : ''
                      "
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabMateriel',
  data() {
    return {
      publicPath: process.env.BASE_URL
    }
  },
  computed: {
    ...mapGetters(['listPermisType', 'activeSapeurPermis'])
  },
  mounted() {
    if (this.listPermisType.length === 0) {
      this.$store.dispatch('fetchPermisType')
    }
  }
}
</script>

<style scoped></style>
