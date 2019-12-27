<template>
  <div>
    <table class="table">
      <tr>
        <th>Nom</th>
        <th>Localité</th>
        <th>Fonction</th>
        <th>Convoqué</th>
        <th>Présent</th>
        <th>Remplacé</th>
        <th>Excusé</th>
        <th>Excuse type</th>
        <th>Amende</th>
      </tr>
      <tr v-for="sapeur in sapeurs" :key="sapeur.id">
        <td>{{ sapeur.nom + ' ' + sapeur.prenom }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ExerciceInput',
  computed: {
    ...mapGetters(['currentExercice', 'currentExerciceId']),
    sapeurs() {
      return [];
    }
  }
};
</script>

<style scoped></style>
