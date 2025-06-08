<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useModalStore } from '../../stores/common/Modal';
import { useTuyauDiametreStore } from '../../stores/materiel/TuyauDiametre';
import { useBatterieTypeStore } from '../../stores/materiel/BatterieType';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielTypeStore = useMaterielTypeStore();
const diametreStore = useTuyauDiametreStore();
const batterieStore = useBatterieTypeStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  diametreStore.fetchTuyauDiametres(),
  batterieStore.fetchBatterieTypes(),
]);

const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id)),
);

const formatEmptyString = (str) => (str === '' ? '-' : str);

const { showModal } = useModalStore();
const editMateriel = () =>
  showModal({
    component: 'ModalMaterielType',
    data: { ...materielType.value },
  });
</script>

<template>
  <div class="row">
    <div class="col">
      <base-card>
        <template #title>Description du matériel</template>
        <template #header>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="editMateriel"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </template>
        <template #body>
          <table class="table mb-0">
            <tr>
              <th>Nom</th>
              <td>{{ materielType.designation }}</td>
            </tr>
            <tr>
              <th>Fournisseur</th>
              <td>{{ formatEmptyString(materielType.fournisseur) }}</td>
            </tr>
            <tr>
              <th>Réparateur</th>
              <td>{{ formatEmptyString(materielType.reparateur) }}</td>
            </tr>
            <tr>
              <th>Prix</th>
              <td>{{ materielType.prix || 'Inconnu' }}</td>
            </tr>
            <tr>
              <th>Remarque</th>
              <td>{{ formatEmptyString(materielType.remarque) }}</td>
            </tr>
            <tr>
              <th>
                Numérotation préfixe
                <font-awesome-icon
                  v-tooltip.bottom="{
                    content: 'Préfixe pour l\'étiquettage individuel',
                  }"
                  class="ms-1 p-0"
                  :icon="['far', 'question-circle']"
                />
              </th>
              <td>
                <span v-if="materielType.est_numerote" class="p-0">{{
                  materielType.prefix === ''
                    ? 'Aucun préfixe'
                    : materielType.prefix
                }}</span>
                <span v-else class="p-0">(Pas d'étiquettage individuel)</span>
              </td>
            </tr>
          </table>
        </template>
      </base-card>
    </div>
    <div v-if="materielType.type === 1" class="col">
      <base-card>
        <template #title>Informations sur le tuyau</template>
        <template #body>
          <table class="table mb-0">
            <tr>
              <th class="col-3 pe-3">Longeure</th>
              <td>{{ materielType.tuyau.longeur }} m</td>
            </tr>
            <tr>
              <th class="col-3 pe-3">Diamètre</th>
              <td>
                {{
                  diametreStore.liste.find(
                    (d) => d.id === materielType.tuyau.tuyau_diametre_id,
                  )?.diametre
                }}
                mm
              </td>
            </tr>
            <tr>
              <th class="col-3 pe-3">Roulé</th>
              <td>
                {{ materielType.tuyau.separement ? 'Separément' : 'Dévidoir' }}
              </td>
            </tr>
          </table>
        </template>
      </base-card>
    </div>
    <div v-if="materielType.type === 2" class="col">
      <base-card>
        <template #title>Informations sur les batteries</template>
        <template #body>
          <table class="table mb-0">
            <tr>
              <th class="col-3 pe-3">Nombre</th>
              <td>{{ materielType.batterie.nombre }}</td>
            </tr>
            <tr>
              <th class="col-3 pe-3">Modèle</th>
              <td>
                {{
                  batterieStore.liste.find(
                    (b) => b.id === materielType.batterie.batterie_type_id,
                  )?.nom
                }}
              </td>
            </tr>
          </table>
        </template>
      </base-card>
    </div>
  </div>
</template>

<style scoped>
.form-check-input ~ .form-check-label {
  opacity: 1;
}
</style>
