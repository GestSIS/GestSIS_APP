<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
store.dispatch('fetchLocalites');
store.dispatch('fetchFonctions');
store.dispatch('fetchGroupes');
store.dispatch('fetchReferenceGestSis');
store.dispatch('fetchReferenceRta');

const maxNbNumero = 3;

const reference = computed(() =>
  store.state.rta.reference.map((f) => ({ ...f, fonction: f?.fonction || '' })),
);
const actuel = computed(() =>
  store.state.rta.actuel
    .map((s) => ({
      ...s,
      localite: store.state.localite.liste.find((l) => l.id == s.localite_id)
        ?.designation,
      fonction:
        store.state.fonction.liste.find((f) => f.id == s.fonction_id)?.nom ||
        '',
      sapeur_id: s.id,
      numeros: s.telephones.map((t) => ({
        numero: t.numero,
        type:
          t.telephone_type_id === 1
            ? 'Privé'
            : t.telephone_type_id === 2
              ? 'Prof'
              : 'Mobile',
        tri: t.priorite,
      })),
      telephones: null,
      groupes: s.groupes
        .map((id) => store.state.groupe.liste.find((g) => g.id == id))
        .filter((g) => g?.type == 1)
        .map((g) => ({ no: g.no, designation: g.designation })),
    }))
    .map((s) => {
      const groupes = s.groupes.slice(0);
      groupes.sort((a, b) => a.no - b.no);
      return {
        ...s,
        groupes: groupes.map((g) => ({ ...g, no: g.no.toString() })),
      };
    })
    .filter((s) => s.groupes.length > 0),
);
const mutations = computed(() => {
  const referenceIds = new Set(reference.value.map((s) => s.sapeur_id));
  const sapeurCompare = (a, b) => a.nom_prenom.localeCompare(b.nom_prenom);

  return actuel.value
    .map((s) => {
      // Ajoute
      if (!referenceIds.has(s.sapeur_id)) {
        return {
          ...s,
          statut: 'ajoute',
          changements: {},
        };
      }

      // Modifie
      const referenceModifie = reference.value.find(
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
        if (s[f] != referenceModifie[f]) {
          changements[f] = true;
        }
      });

      // Groupes
      const referenceGroupes = new Set(
        referenceModifie.groupes.map((g) => g.no),
      );
      const groupesAjoute = s.groupes
        .map((g) => g.no)
        .filter((g) => !referenceGroupes.has(g));

      const groupesReference = new Map(
        referenceModifie.groupes.map((g) => [g.no, g.description]),
      );
      const groupesModifie = s.groupes.filter(
        (g) =>
          groupesReference.has(g.no) &&
          groupesReference.get(g.no) !== g.description,
      );

      changements = {
        ...changements,
        groupesAjoute,
        groupesModifie,
        groupesSupprime: [],
      };

      // RTA Numéros
      const oldNumeros = new Set(referenceModifie.numeros.map((n) => n.numero));
      const currentNumeros = new Set(s.numeros.map((n) => n.numero));

      changements = {
        ...changements,
        numerosAjoute: s.numeros.filter((n) => !oldNumeros.has(n.numero)),
        numerosSupprime: referenceModifie.numeros.filter(
          (n) => !currentNumeros.has(n.numero),
        ),
      };

      return { ...s, statut: 'modifie', changements };
    })
    .sort(sapeurCompare);
});

const nbNumero = computed(() => {
  const numCount = mutations.value.map((s) => s.numeros.length);
  return numCount.length > 0 ? Math.max(...numCount) : 0;
});
const nbGroupes = computed(() => {
  const numCount = mutations.value.map((s) => s.groupes.length);
  return numCount.length > 0 ? Math.max(...numCount) : 0;
});
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">GestSIS</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <table class="table table-sm" cellspacing="0">
        <thead>
          <tr>
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
              Aucun sapeur possédant un numéro rta dans GestSIS n'appartient à
              un groupe d'alarme.
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
                  e.statut == 'modifie' &&
                  e.changements.numerosAjoute.includes(n.no),
                'text-danger':
                  e.statut == 'modifie' &&
                  e.changements.numerosSupprime.includes(n.no),
              }"
            >
              {{ n.numero }}
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
