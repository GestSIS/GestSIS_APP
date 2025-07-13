<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mutations</h3>
    </div>
    <div class="card-body pb-0">
      <div class="row g-3 align-items-center mb-3">
        <div class="col-auto">
          <input
            id="m-user"
            v-model="username"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors.username }"
            name="username"
            placeholder="Utilisateur"
          />
        </div>
        <div class="col-auto">
          <input
            id="m-password"
            v-model="password"
            type="password"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors.password }"
            name="password"
            placeholder="Mot de passe"
          />
        </div>
        <font-awesome-icon
          v-tooltip.bottom="
            'Utilisez vos identifiants du site gestionrta-jura.ch'
          "
          class="col-auto"
          :icon="['far', 'question-circle']"
        />
        <button type="button" class="col-auto btn btn-primary" @click="mutate">
          Transfert RTA
        </button>
        <a
          href="https://www.gestionrta-jura.ch/gestionRtaJura/"
          target="_blank"
          class="col-auto btn btn-link"
          @click="mutate"
        >
          gestionrta-jura.ch
        </a>
      </div>
      <div class="mb-3">
        <div class="input-group input-group-sm">
          <label for="m-communication"></label>
          <textarea
            id="m-communication"
            v-model="communication"
            type="text"
            rows="2"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['communication'] }"
            name="communication"
            placeholder="Communication"
          />
        </div>
      </div>
    </div>
    <div class="card-body table-responsive p-0">
      <table class="table table-sm" cellspacing="0">
        <thead>
          <tr>
            <th class="text-center">
              <input
                id="select-all"
                checked
                type="checkbox"
                class="form-check-input"
                :false-value="true"
                :true-value="false"
                @change="switchAll"
              />
              <label class="form-check-label" for="select-all"></label>
            </th>
            <th>Nom Prénom</th>
            <th>Date de naissance</th>
            <th>Localité</th>
            <th>Adresse</th>
            <th>Fonction</th>
            <th v-for="i in nbNumero" :key="'num-' + i">Numéro {{ i }}</th>
            <th v-for="i in nbGroupes" :key="'grp' + i">Grp{{ i }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!mutations.length">
            <td></td>
            <td colspan="5">
              Aucun changement détecté entre la base RTA et les données
              actuelles.
            </td>
          </tr>
          <tr
            v-for="e in mutations"
            :key="e.sapeur_id"
            :class="{
              'table-success': e.statut == 'ajoute',
              'table-danger': e.statut == 'supprime',
            }"
          >
            <td class="text-center">
              <input
                :id="'select-' + e.sapeur_id"
                v-model="unselected[e.sapeur_id]"
                type="checkbox"
                class="form-check-input"
                :false-value="true"
                :true-value="false"
              />
              <label
                class="form-check-label"
                :for="'select-' + e.sapeur_id"
              ></label>
            </td>
            <td
              :class="{
                'text-warning': e.changements.nom || e.changements.prenom,
              }"
            >
              {{ e.nom_prenom }}
            </td>
            <td
              :class="{
                'text-warning': e.changements.date_naissance,
              }"
            >
              {{ new Date(e.date_naissance).toLocaleDateString('fr-CH') }}
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
                'text-warning': e.changements.adresse,
              }"
            >
              {{ e.adresse }}
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
              v-for="n in nbNumero - e.numeros.length"
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
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MutationsRta',
  data() {
    return {
      maxNbNumero: 3,
      unselected: {},
      username: '',
      password: '',
      communication: '',
      errors: {},
    };
  },
  computed: {
    ...mapState({
      reference: (state) =>
        state.rta.reference.map((f) => ({ ...f, fonction: f?.fonction || '' })),
      activeSisData: (state) =>
        state.auth.sis.liste.find((s) => s.id == state.auth.sis.activeId),
      actuel: (state) =>
        state.rta.actuel
          .map((s) => ({
            ...s,
            localite: state.localite.liste.find((l) => l.id == s.localite_id)
              ?.designation,
            fonction:
              state.fonction.liste.find((f) => f.id == s.fonction_id)?.nom ??
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
      const referenceIds = new Set(this.reference.map((s) => s.sapeur_id));
      const actuelIds = new Set(this.actuel.map((s) => s.sapeur_id));
      const potentielModifieIds = new Set(
        [...referenceIds].filter((id) => actuelIds.has(id)),
      );

      const sapeurCompare = (a, b) => a.nom_prenom.localeCompare(b.nom_prenom);

      const ajoutes = this.actuel
        .filter((s) => !referenceIds.has(s.sapeur_id))
        .map((s) => ({
          ...s,
          statut: 'ajoute',
          changements: {},
        }))
        .sort(sapeurCompare);
      const supprimes = this.reference
        .filter((s) => !actuelIds.has(s.sapeur_id))
        .map((s) => ({
          ...s,
          statut: 'supprime',
          changements: {},
        }))
        .sort(sapeurCompare);
      const modifies = this.actuel
        .filter((s) => potentielModifieIds.has(s.sapeur_id))
        .map((s) => {
          let modifie = false;

          const reference = this.reference.find(
            (s2) => s2.sapeur_id == s.sapeur_id,
          );
          const fields = [
            'nom',
            'prenom',
            'fonction',
            'localite',
            'adresse',
            'date_naissance',
          ];
          let changements = {};
          // Fields
          fields.forEach((f) => {
            if (s[f] != reference[f]) {
              changements[f] = true;
              modifie = true;
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
            reference.groupes.map((g) => [g.no, g.description]),
          );
          const groupesModifie = s.groupes.filter(
            (g) =>
              groupesReference.has(g.no) &&
              groupesReference.get(g.no) !== g.description,
          );

          if (
            groupesAjoute.length > 0 ||
            groupesSupprime.length > 0 ||
            groupesModifie.length > 0
          ) {
            modifie = true;
          }

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

          if (
            numerosAjoute < numeros.length ||
            numerosSupprime < numeros.length ||
            numerosModifie.length > 0
          ) {
            modifie = true;
          }

          changements = {
            ...changements,
            modifie,
            numerosAjoute,
            numerosModifie,
            numerosSupprime,
          };

          return { ...s, groupes, numeros, statut: 'modifie', changements };
        })
        .filter((m) => m.changements.modifie)
        .sort(sapeurCompare);

      return [...ajoutes, ...modifies, ...supprimes];
    },
  },
  watch: {
    mutations() {
      this.unselected = {
        ...this.mutations
          .map((m) => ({ [m.sapeur_id]: false }))
          .reduce((a, b) => ({ ...a, ...b }), {}),
        ...this.unselected,
      };
    },
  },
  mounted() {
    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchFonctions');
    this.$store.dispatch('fetchGroupes');
    this.$store.dispatch('fetchReferenceGestSis');
    if (!this.reference.length) {
      this.$store.dispatch('fetchReferenceRta');
    }
    this.unselected = {
      ...this.mutations
        .map((m) => ({ [m.sapeur_id]: false }))
        .reduce((a, b) => ({ ...a, ...b }), {}),
      ...this.unselected,
    };
  },
  methods: {
    switchAll(valeur) {
      this.mutations.forEach(
        (m) => (this.unselected[m.sapeur_id] = !valeur.target.checked),
      );
    },
    mutate() {
      if (!this.password) {
        this.errors.password = 'Mot de passe invalide';
      } else {
        delete this.errors.password;
      }
      if (!this.username) {
        this.errors.username = "Nom d'utilisateur invalide";
      } else {
        delete this.errors.username;
      }
      this.errors = { ...this.errors };

      if (this.errors.username || this.errors.password) {
        return;
      }

      const unselected = new Set(
        Object.entries(this.unselected)
          .filter((data) => data[1])
          .map((data) => parseInt(data[0])),
      );
      const mutations = this.mutations.filter(
        (m) => !unselected.has(m.sapeur_id),
      );

      const sis = this.activeSisData.nom;

      const data = {
        sis,
        username: this.username,
        password: this.password,
        communication: this.communication || '-',
        ajoutes: mutations.filter((m) => m.statut === 'ajoute'),
        modifies: mutations
          .filter((m) => m.statut === 'modifie')
          .map((s) => ({
            ...s,
            groupes: s.groupes.filter(
              (g) => !s.changements.groupesSupprime.includes(g.no),
            ),
            numeros: s.numeros.slice(0, s.changements.numerosSupprime),
          })),
        supprimes: mutations.filter((m) => m.statut === 'supprime'),
      };

      this.loading = true;
      this.$store
        .dispatch('updateReferenceRta', data)
        .then(() => {
          this.$awn.success('Mutation transmise avec succès');
        })
        .catch((error) => {
          this.errors = { ...error };
          this.$awn.alert(error.message);
        });
    },
  },
};
</script>
