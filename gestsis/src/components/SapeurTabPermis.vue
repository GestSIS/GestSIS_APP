<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-body">
          <table class="table">
            <tbody>
              <tr v-for="permis in listPermisType">
                <td class="text-right">
                  <i
                    v-if="permis.type.toLowerCase() === 'c1'"
                    class="fab fa-gripfire text-danger"
                    style="font-size:1.5em"
                  ></i
                  ><img
                    :src="`${publicPath}icons/${permis.type.toLowerCase()}.gif`"
                  />
                </td>
                <td>
                  <p>{{ permis.type }}</p>
                </td>
                <td>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text"
                        ><i class="fa fa-calendar"></i
                      ></span>
                    </div>
<!--                    <input type="date" class="form-control" :value="{{ array_key_exists($permi['id'],$sap_details['permis'])?date('Y-m-d', strtotime($sap_details['permis'][$permi['id']]['date'])):"" }}">-->
                  </div>
                </td>
              </tr>
              <!--
                        <tr>
                            <td class="text-right"><i class="fab fa-gripfire text-danger" style="font-size:1.5em"></i><img src="{{ asset('img/c1.gif') }}"></td>
                            <td><p>C1</p></td>
                            <td>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"><i class="fa fa-calendar"></i></span>
                                    </div>
                                    <input type="date" class="form-control">
                                </div>
                            </td>
                        </tr>-->
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
  name: 'SapeurTabPermis',
  data () {
    return {
      publicPath: process.env.BASE_URL
    }
  },
  computed: {
    ...mapGetters(['activeSapeur', 'listPermisType'])
  },
  mounted() {
    if (this.listPermisType.length === 0) {
      this.$store.dispatch('fetchPermisType')
    }
  }
}
</script>

<style scoped></style>
