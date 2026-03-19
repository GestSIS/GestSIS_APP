<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useRtaStore } from '../../stores/rta/Rta.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useGroupeStore } from '../../stores/groupe/Groupe.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useAuthStore } from '../../stores/auth/Auth.js';

const authStore = useAuthStore();
const rtaStore = useRtaStore();
const localiteStore = useLocaliteStore();
const groupeStore = useGroupeStore();
const fonctionStore = useFonctionStore();

localiteStore.fetchLocalites();
fonctionStore.fetchFonctions();
groupeStore.fetchGroupes();
rtaStore.fetchReferenceGestSis();
rtaStore.fetchReferenceRta();

const maxNbNumero = 3;
const unselected = ref({});
const errors = ref({});

const reference = computed(() =>
  rtaStore.reference.map((f) => ({
    ...f,
    numeros: f.numeros.map((n) => ({ ...n, numero: formatNumero(n.numero) })),
    fonction: f?.fonction || '',
  })),
);
const activeSisData = computed(() =>
  authStore.sis.liste.find((s) => s.id == authStore.sis.activeId),
);

const formatNumero = (numero) => {
  const num = numero.replaceAll(' ', '');
  if (num.length === 10) {
    return `+41 ${num.slice(1, 3)} ${num.slice(3, 6)} ${num.slice(6, 8)} ${num.slice(8)}`;
  }
  if (num.length === 12) {
    return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6, 8)} ${num.slice(8)}`;
  }
  return numero;
};
const actuel = computed(() =>
  rtaStore.actuel
    .map((s) => ({
      ...s,
      localite: localiteStore.liste.find((l) => l.id == s.localite_id)
        ?.designation,
      fonction:
        fonctionStore.liste.find((f) => f.id == s.fonction_id)?.nom ?? '',
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
      groupes: s.groupes
        .map((id) => groupeStore.liste.find((g) => g.id == id))
        .filter((g) => g?.type == 1)
        .map((g) => ({ no: g.no.toString(), designation: g.designation })),
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
  const actuelIds = new Set(actuel.value.map((s) => s.sapeur_id));
  const potentielModifieIds = new Set(
    [...referenceIds].filter((id) => actuelIds.has(id)),
  );

  const sapeurCompare = (a, b) => a.nom_prenom.localeCompare(b.nom_prenom);

  const ajoutes = actuel.value
    .filter((s) => !referenceIds.has(s.sapeur_id))
    .map((s) => ({
      ...s,
      statut: 'ajoute',
      changements: {},
    }))
    .sort(sapeurCompare);
  const supprimes = reference.value
    .filter((s) => !actuelIds.has(s.sapeur_id))
    .map((s) => ({
      ...s,
      statut: 'supprime',
      changements: {},
    }))
    .sort(sapeurCompare);
  const modifies = actuel.value
    .filter((s) => potentielModifieIds.has(s.sapeur_id))
    .map((s) => {
      let modifie = false;

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
          modifie = true;
        }
      });

      // Groupes
      const referenceGroupes = new Set(
        referenceModifie.groupes.map((g) => g.no),
      );
      const actuelGroupes = new Set(s.groupes.map((g) => g.no));

      const groupesAjoute = s.groupes
        .map((g) => g.no)
        .filter((g) => !referenceGroupes.has(g));
      const groupesSupprime = referenceModifie.groupes
        .map((g) => g.no)
        .filter((g) => !actuelGroupes.has(g));

      const groupesReference = new Map(
        referenceModifie.groupes.map((g) => [g.no, g.description]),
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
        ...referenceModifie.groupes.filter((g) =>
          groupesSupprime.includes(g.no),
        ),
      ];

      // RTA Numéros
      const oldNumeros = new Set(referenceModifie.numeros.map((n) => n.numero));
      const currentNumeros = new Set(s.numeros.map((n) => n.numero));

      const numeros = [
        ...s.numeros.map((n) =>
          oldNumeros.has(n.numero) ? n : { ...n, added: true },
        ),
        ...referenceModifie.numeros
          .filter((n) => !currentNumeros.has(n.numero))
          .map((n) => ({ ...n, removed: true })),
      ];

      if (numeros.some((n) => n.added || n.removed)) {
        modifie = true;
      }

      changements = {
        ...changements,
        modifie,
        numeros,
      };

      return { ...s, groupes, statut: 'modifie', changements };
    })
    .filter((m) => m.changements.modifie)
    .sort(sapeurCompare);

  return [...ajoutes, ...modifies, ...supprimes];
});

const nbNumero = computed(() => {
  const numCount = mutations.value.map(
    (s) => s.changements?.numeros?.length ?? s.numeros.length,
  );
  return numCount.length > 0 ? Math.max(...numCount) : 0;
});
const nbGroupes = computed(() => {
  const numCount = mutations.value.map((s) => s.groupes.length);
  return numCount.length > 0 ? Math.max(...numCount) : 0;
});

watchEffect(() => {
  unselected.value = {
    ...mutations.value
      .map((m) => ({ [m.sapeur_id]: false }))
      .reduce((a, b) => ({ ...a, ...b }), {}),
    ...unselected.value,
  };
});

const awn = useNotification();

const switchAll = (valeur) => {
  mutations.value.forEach(
    (m) => (unselected.value[m.sapeur_id] = !valeur.target.checked),
  );
};

const mutate = () => {
  const sis = activeSisData.value.nom;

  if (mutations.value.length === 0) {
    awn.alert(
      'Aucune mutation détectée entre la base RTA et les données actuelles',
    );
    return;
  }
  if (!Object.values(unselected.value).some((v) => v === false)) {
    awn.alert('Aucun sapeur sélectionné pour la mutation RTA');
    return;
  }

  const data = {
    sis,
    sapeurs: [
      ...reference.value.filter(
        (s) => (unselected.value[s.sapeur_id] ?? false) === true,
      ),
      ...actuel.value.filter(
        (s) => (unselected.value[s.sapeur_id] ?? false) === false,
      ),
    ],
  };

  rtaStore
    .updateReferenceRta(data)
    .then(() => {
      awn.success('Mutation transmise avec succès');
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(err.message ?? "Une erreur s'est produite lors du transfert");
    });
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mutations</h3>
    </div>
    <div class="card-body pb-0">
      <div class="row g-3 align-items-center mb-3">
        <div class="alert alert-primary" role="alert">
          La nouvelle intégration avec GestionRTA-Jura ne nécessite plus
          d'identifiants. Vous pouvez désormais choisir qui est autorisé à
          effectuer des mutations RTA dans
          <em>configurations > droits et rôles</em>. Vous verrez ainsi un
          nouveau groupe de permissions spécifique pour le RTA.
        </div>
        <button type="button" class="col-auto btn btn-primary" @click="mutate">
          Transfert RTA
        </button>
        <a
          href="https://gestionrta-jura.ch"
          target="_blank"
          class="col-auto btn btn-link"
          @click="mutate"
        >
          gestionrta-jura.ch
        </a>
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
              v-for="(n, i) in (e.changements?.numeros ?? e.numeros).slice(
                0,
                maxNbNumero,
              )"
              :key="'n-' + n + '-' + i"
              :class="{
                'text-success': e.statut == 'modifie' && n.added,
                'text-danger': e.statut == 'modifie' && n.removed,
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
