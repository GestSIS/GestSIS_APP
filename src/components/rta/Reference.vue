<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Référence RTA</h3>
      <button @click="reset" class="btn btn-outline-primary">Réinitialiser</button>
    </div>
    <div class="card-body">
      <table class="table table-sm" cellspacing="0">
        <thead>
          <tr>
            <!-- <th></th> -->
            <th>Nom Prénom</th>
            <th>Date naissance</th>
            <th>Localité</th>
            <th>Adresse</th>
            <th>Fonction</th>
            <th v-for="i in nbNumero" :key="'num-' + i">Numéro {{ i }}</th>
            <th v-for="i in nbGroupes" :key="'grp' + i">Grp{{ i }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!mutations.length">
            <td colspan="5">Aucun sapeur présent actuellement dans la référence RTA.</td>
          </tr>
          <tr
            v-for="e in mutations"
            :key="e.sapeur_id"
            :class="{
              'table-success': e.statut == 'ajoute',
              'table-danger': e.statut == 'supprime',
            }"
          >
            <!-- <td class="text-center">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :id="'select-' + e.sapeur_id"
                  v-model="unselected[e.sapeur_id]"
                  :false-value="true"
                  :true-value="undefined"
                />
                <label
                  class="form-check-label"
                  :for="'select-' + e.sapeur_id"
                ></label>
            </td>-->
            <td
              :class="{
                'text-warning': e.changements.nom || e.changements.prenom,
              }"
            >{{ e.nom }} {{ e.prenom }}</td>
            <td
              :class="{
                'text-warning': e.changements.date_naissance,
              }"
            >{{ e.date_naissance }}</td>
            <td
              :class="{
                'text-warning': e.changements.localite,
              }"
            >{{ e.localite }}</td>
            <td
              :class="{
                'text-warning': e.changements.adresse,
              }"
            >{{ e.adresse }}</td>
            <td
              :class="{
                'text-warning': e.changements.fonction,
              }"
            >{{ e.fonction }}</td>
            <td
              v-for="(n, i) in e.numeros.slice(0, maxNbNumero)"
              :key="'n-' + n + '-' + i"
              :class="{
                'text-success':
                  e.statut == 'modifie' && i >= e.changements.numerosAjoute,
                'text-warning':
                  e.statut == 'modifie' &&
                  e.changements.numerosModifie.includes(i),
                'text-danger':
                  e.statut == 'modifie' && i >= e.changements.numerosSupprime,
              }"
            >{{ n }}</td>
            <td v-for="n in nbNumero - e.numeros.length" :key="'n-comp-' + n"></td>
            <td
              v-for="g in e.groupes"
              :key="'g-' + g.no"
              :class="{
                'text-success':
                  e.statut == 'modifie' &&
                  e.changements.groupesAjoute.includes(g.no),
                'text-warning':
                  e.statut == 'modifie' &&
                  e.changements.groupesModifie.includes(g.no),
                'text-danger':
                  e.statut == 'modifie' &&
                  e.changements.groupesSupprime.includes(g.no),
              }"
            >{{ g.no }}</td>
            <td v-for="g in nbGroupes - e.groupes.length" :key="'g-comp-' + g"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'Reference',
  data() {
    return {
      maxNbNumero: 3,
      unselected: {},
      username: '',
      password: '',
      communication: '',
      errorsData: {},
    };
  },
  mounted() {
    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchFonctions');
    this.$store.dispatch('fetchGroupes');
    this.$store.dispatch('fetchReferenceGestSis');
    if (!this.reference.length) {
      this.$store.dispatch('fetchReferenceRta');
    }
  },
  computed: {
    ...mapState({
      reference: (state) =>
        state.rta.reference.map((f) => ({ ...f, fonction: f?.fonction || '' })),
      actuel: (state) =>
        state.rta.actuel
          .map((s) => ({
            ...s,
            localite: state.localite.liste.find((l) => l.id == s.localite_id)
              ?.designation,
            fonction:
              state.fonction.liste.find((f) => f.id == s.fonction_id)?.nom ||
              '',
            sapeur_id: s.id,
            numeros: s.telephones.map((t) => t.numero),
            telephones: null,
            groupes: s.groupes
              .map((id) => state.groupe.liste.find((g) => g.id == id))
              .filter((g) => g?.type == 1)
              .map((g) => ({ no: g.no, designation: g.designation })),
          }))
          .map((s) => {
            const groupes = s.groupes.slice(0);
            groupes.sort((a, b) => a.no - b.no);
            return { ...s, groupes };
          })
          .filter((s) => s.groupes.length > 0),
    }),
    nbNumero() {
      const numCount = this.mutations.map((s) => s.numeros.length);
      return numCount.length > 0 ? Math.max(...numCount) : 0;
    },
    nbGroupes() {
      const numCount = this.mutations.map((s) => s.groupes.length);
      return numCount.length > 0 ? Math.max(...numCount) : 0;
    },
    mutations() {
      const actuelsIds = new Set(this.reference.map((s) => s.sapeur_id));
      const fields = [
        'nom',
        'prenom',
        'fonction',
        'localite',
        'adresse',
        'date_naissance',
      ];
      const sapeurCompare = (a, b) => (a.nom + a.prenom).localeCompare(b.nom + b.prenom);

      return this.reference
        .map((s) => {
          // Ajoute
          if (!actuelsIds.has(s.sapeur_id)) {
            return {
              ...s,
              statut: 'supprime',
              changements: {},
            };
          }

          // Modifie
          const actuel = this.actuel.find((s2) => s2.sapeur_id == s.sapeur_id);
          if (!actuel) {
            return {
              ...s,
              statut: 'supprime',
              changements: {},
            };
          }

          let changements = {};
          // Fields
          fields.forEach((f) => {
            if (s[f] != actuel[f]) {
              changements[f] = true;
            }
          });

          // Groupes
          const actuelGroupes = new Set(actuel.groupes.map((g) => g.no));

          const groupesSupprime = s.groupes
            .map((g) => g.no)
            .filter((g) => !actuelGroupes.has(g));

          const groupesActuel = new Map(
            actuel.groupes.map((g) => [g.no, g.description])
          );
          const groupesModifie = s.groupes.filter(
            (g) =>
              groupesActuel.has(g.no) && groupesActuel.get(g.no) !== g.description
          );

          changements = {
            ...changements,
            groupesAjoute: [],
            groupesModifie,
            groupesSupprime,
          };

          const groupes = [...s.groupes];

          // Numéros
          const numerosAjoute = s.numeros.length;
          const numerosSupprime = actuel.numeros.length;
          const numerosModifie = s.numeros
            .slice(0, Math.min(numerosAjoute, numerosSupprime))
            .map((n, index) => (actuel.numeros[index] != n ? index : -1))
            .filter((i) => i >= 0);

          changements = {
            ...changements,
            numerosAjoute,
            numerosModifie,
            numerosSupprime,
          };

          return { ...s, groupes, statut: 'modifie', changements };
        })
        .sort(sapeurCompare);
    },
  },
  methods: {
    reset() {
      this.$store.dispatch('resetReferenceRta')
    }
  }
};
</script>

<style lang="scss" scoped></style>
