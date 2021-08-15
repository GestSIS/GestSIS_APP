<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mutations</h3>
      <!-- <button
        type="button"
        class="btn btn-primary"
        disabled
      >
        TODO
      </button> -->
    </div>
    <div class="card-body">
      <table class="table table-sm" cellspacing="0">
        <thead>
          <tr>
            <th></th>
            <th>Nom Prénom</th>
            <th>Date naissance</th>
            <th>Localité</th>
            <th>Fonction</th>
            <th v-for="i in nbNumero" :key="'num-' + i">Numéro {{ i }}</th>
            <th v-for="i in nbGroupes" :key="'grp' + i">Grp{{ i }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="e in mutations"
            :key="e.sapeur_id"
            :class="{
              'table-success': e.statut == 'ajout',
              'table-danger': e.statut == 'supprime',
            }"
          >
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="'select-'+e.sapeur_id"
                  v-model="unselected[e.sapeur_id]"
                  :false-value="true" :true-value="undefined"
                />
                <label class="custom-control-label" :for="'select-'+e.sapeur_id"></label>
              </div>
            </td>
            <td
              :class="{
                'text-warning': e.changements.nom || e.changements.prenom,
              }"
            >
              {{ e.nom }} {{ e.prenom }}
            </td>
            <td
              :class="{
                'text-warning': e.changements.date_naissance,
              }"
            >
              {{ e.date_naissance }}
            </td>
            <td
              :class="{
                'text-warning': e.changements.localite,
              }"
            >
              {{ e.localite }}
            </td>
            <td
              :class="{
                'text-warning': e.changements.fonction,
              }"
            >
              {{ e.fonction }}
            </td>
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
            >
              {{ n }}
            </td>
            <td
              v-for="n in maxNbNumero - e.numeros.length - 1"
              :key="'n-comp-' + n"
            ></td>
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
            >
              {{ g.no }}
            </td>
            <td
              v-for="g in nbGroupes - e.groupes.length"
              :key="'g-comp-' + g"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div>
      <h1>Reference</h1>
      {{ reference }}
      <h1>Actuel</h1>
      {{ actuel }}
      <h1>Mutations</h1>
      {{ mutations }}
    </div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "Mutations",
  data() {
    return {
      maxNbNumero: 3,
      unselected: {}
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
      reference: (state) => state.rta.reference,
      actuel: (state) =>
        state.rta.actuel
          .map((s) => ({
            ...s,
            localite: state.localite.liste.find((l) => l.id == s.localite_id)
              ?.designation,
            fonction: state.fonction.liste.find((f) => f.id == s.fonction_id)
              ?.nom,
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
      // TODO: Compute modified values

      const referenceIds = new Set(this.reference.map((s) => s.sapeur_id));
      const actuelIds = new Set(this.actuel.map((s) => s.sapeur_id));
      const potentielModifieIds = new Set(
        [...referenceIds].filter((id) => actuelIds.has(id))
      );

      const ajoutes = this.actuel
        .filter((s) => !referenceIds.has(s.sapeur_id))
        .map((s) => ({
          ...s,
          statut: 'ajout',
          changements: {},
        }));
      const supprimes = this.reference
        .filter((s) => !actuelIds.has(s.sapeur_id))
        .map((s) => ({
          ...s,
          statut: 'supprime',
          changements: {},
        }));
      const modifies = this.actuel
        .filter((s) => potentielModifieIds.has(s.sapeur_id))
        .map((s) => {
          const reference = this.reference.find(
            (s2) => s2.sapeur_id == s.sapeur_id
          );
          const fields = [
            'nom',
            'prenom',
            'fonction',
            'localite',
            'date_naissance',
          ];
          let changements = {};
          // Fields
          fields.forEach((f) => {
            if (s[f] != reference[f]) {
              changements[f] = true;
            }
          });

          // Groupes
          const referenceGroupes = new Set(reference.groupes.map((g) => g.no));
          const actuelGroupes = new Set(s.groupes.map((g) => g.no));

          const groupesAjoute = s.groupes
            .map((g) => g.no)
            .filter((g) => !referenceGroupes.has(g));
          const groupesSupprime = reference.groupes
            .map((g) => g.no)
            .filter((g) => !actuelGroupes.has(g));

          const groupesReference = new Map(
            reference.groupes.map((g) => [g.no, g.description])
          );
          const groupesModifie = s.groupes.filter(
            (g) =>
              groupesReference.has(g.no) &&
              groupesReference.get(g.no) === g.description
          );

          changements = {
            ...changements,
            groupesAjoute,
            groupesModifie,
            groupesSupprime,
          };

          const groupes = [
            ...s.groupes,
            ...reference.groupes.filter((g) => groupesSupprime.includes(g.no)),
          ];

          // Numéros
          const numerosAjoute = reference.numeros.length;
          const numerosSupprime = s.numeros.length;
          const numerosModifie = s.numeros
            .slice(0, Math.min(numerosAjoute, numerosSupprime))
            .map((n, index) => (reference.numeros[index] != n ? index : -1))
            .filter((i) => i >= 0);

          const numeros = [
            ...s.numeros,
            ...reference.numeros.slice(s.numeros.length),
          ];

          changements = {
            ...changements,
            numerosAjoute,
            numerosModifie,
            numerosSupprime,
          };

          return { ...s, groupes, numeros, statut: 'modifie', changements };
        });

      return [...ajoutes, ...modifies, ...supprimes];
    },
  },
};
</script>

<style lang="scss" scoped>
</style>