<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
      <!--      &lt;!&ndash; general form elements &ndash;&gt;-->
      <!--      <div class="card card-primary card-outline">-->
      <!--        &lt;!&ndash; /.card-header &ndash;&gt;-->
      <!--        <div class="card-body">-->
      <!--          <table id="sap-groupe" class="table" cellspacing="0" width="100%">-->
      <!--            <thead>-->
      <!--              <tr>-->
      <!--                <th data-field="groupe">Groupe</th>-->
      <!--                <th data-field="designation">Désignation</th>-->
      <!--              </tr>-->
      <!--            </thead>-->
      <!--            <tbody>-->
      <!--              @foreach($sap_details['groupes'] as $groupe)-->
      <!--              <tr id="row_{{ $groupe['id'] }}">-->
      <!--                <td>{{ $groupe['no'] != 0 ? $groupe['no'] : '' }}</td>-->
      <!--                <td>{{ $groupe['nom'] }}</td>-->
      <!--              </tr>-->
      <!--              @endforeach-->
      <!--            </tbody>-->
      <!--          </table>-->
      <!--          &lt;!&ndash; TODO Fetch data &ndash;&gt;-->
      <!--        </div>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabCours',
  computed: {
    ...mapGetters(['activeSapeur'])
  }
}
</script>

<style scoped></style>
