<script setup>
import { computed } from 'vue';
import { useRtaStore } from '../../stores/rta/Rta.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useGroupeStore } from '../../stores/groupe/Groupe.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';

const maxNbNumero = 3;

const rtaStore = useRtaStore();
const localiteStore = useLocaliteStore();
const groupeStore = useGroupeStore();
const fonctionStore = useFonctionStore();

localiteStore.fetchLocalites();
fonctionStore.fetchFonctions();
groupeStore.fetchGroupes();
rtaStore.fetchReferenceGestSis();
rtaStore.fetchReferenceRta();

const formatNumero = (numero) => {
  const num = numero.replaceAll(' ', '');
  if (num.length === 10) {
    return `+41 ${num.slice(1, 3)} ${num.slice(3, 6)} ${num.slice(6, 8)} ${num.slice(8)}`;
  }
  if (num.length === 12) {
    return `${num.slice(0, 3)} ${num.slice(3, 5)} ${num.slice(5, 8)} ${num.slice(8, 10)} ${num.slice(10)}`;
  }
  return numero;
};
const reference = computed(() =>
  rtaStore.reference.map((f) => ({
    ...f,
    numeros: f.numeros.map((n) => ({ ...n, numero: formatNumero(n.numero) })),
    fonction: f?.fonction || '',
  })),
);
const actuel = computed(() =>
  rtaStore.actuel
    .map((s) => ({
      ...s,
      localite: localiteStore.liste.find((l) => l.id == s.localite_id)
        ?.designation,
      fonction:
        fonctionStore.liste.find((f) => f.id == s.fonction_id)?.nom || '',
      sapeur_id: s.id,
      numeros: s.telephones.map((t) => ({
        numero: formatNumero(t.numero),
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
        .map((id) => groupeStore.liste.find((g) => g.id == id))
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
  const actuelsIds = new Set(reference.value.map((s) => s.sapeur_id));
  const fields = [
    'nom',
    'prenom',
    'fonction',
    'localite',
    'adresse',
    'date_naissance',
  ];
  const sapeurCompare = (a, b) => a.nom_prenom.localeCompare(b.nom_prenom);

  return reference.value
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
      const actuelModifie = actuel.value.find(
        (s2) => s2.sapeur_id == s.sapeur_id,
      );
      if (!actuelModifie) {
        return {
          ...s,
          statut: 'supprime',
          changements: {},
        };
      }

      let changements = {};
      // Fields
      fields.forEach((f) => {
        if (s[f] != actuelModifie[f]) {
          changements[f] = true;
        }
      });

      // Groupes
      const actuelGroupes = new Set(actuelModifie.groupes.map((g) => g.no));

      const groupesSupprime = s.groupes
        .map((g) => g.no)
        .filter((g) => !actuelGroupes.has(g));

      const groupesActuel = new Map(
        actuelModifie.groupes.map((g) => [g.no, g.description]),
      );
      const groupesModifie = s.groupes.filter(
        (g) =>
          groupesActuel.has(g.no) && groupesActuel.get(g.no) !== g.description,
      );

      changements = {
        ...changements,
        groupesAjoute: [],
        groupesModifie,
        groupesSupprime,
      };

      const groupes = [...s.groupes];

      // RTA Numéros
      const currentNumeros = new Set(
        actuelModifie.numeros.map((n) => n.numero),
      );
      const oldNumeros = new Set(s.numeros.map((n) => n.numero));

      changements = {
        ...changements,
        numerosAjoute: actuelModifie.numeros
          .filter((n) => !oldNumeros.has(n.numero))
          .map((n) => n.numero),
        numerosSupprime: s.numeros
          .filter((n) => !currentNumeros.has(n.numero))
          .map((n) => n.numero),
      };

      return { ...s, groupes, statut: 'modifie', changements };
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
      <h3 class="card-title">Référence RTA</h3>
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
            <td colspan="5">
              Aucun sapeur présent actuellement dans la référence RTA.
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
              v-for="(n, i) in (e.changements?.numeros ?? e.numeros).slice(
                0,
                maxNbNumero,
              )"
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
              v-for="n in nbNumero -
              (e.changements?.numeros ?? e.numeros).length"
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
