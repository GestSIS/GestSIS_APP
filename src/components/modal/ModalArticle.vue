<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Fiche matériel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body row">
      <div :class="activeItem.events ? 'col-6' : 'col-12'">
        <base-select
          :model-value="activeItem.materiel_type_id"
          :options="types"
          class="mb-3"
          label="Matériel type"
          disabled
        />
        <div class="mb-3">
          <base-select
            :model-value="activeItem.retour == null ? activeItem.sapeur_id : 0"
            :options="sapeurs"
            base-option="<Non-attribué>"
            display-key="nom_prenom"
            label="Sapeur"
            disabled
          />
        </div>
        <div class="mb-3">
          <label for="attribution">Attribution</label>
          <input
            id="attribution"
            v-model="activeItem.attribution"
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attribution'] }"
          />
        </div>
        <div v-if="activeItem?.materiel?.uuid" class="mb-3">
          <label for="numero">Numéro</label>
          <input
            id="numero"
            v-model="activeItem.materiel.numero"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['numero'] }"
          />
        </div>
        <div
          v-if="activeItem?.materiel && !activeItem?.materiel?.uuid"
          class="mb-3"
        >
          <label for="numero">Quantité</label>
          <input
            id="numero"
            v-model="activeItem.materiel.quantite"
            type="number"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['quantite'] }"
          />
        </div>
        <div class="mb-3">
          <label for="taille">Taille</label>
          <input
            id="taille"
            v-model="activeItem.taille"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['taille'] }"
          />
        </div>
        <div class="mb-3">
          <label for="remarque">Remarque</label>
          <input
            id="remarque"
            v-model="activeItem.remarque"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['remarque'] }"
          />
        </div>
      </div>
      <div v-if="activeItem.events" class="col-6">
        <base-table
          :data="activeItem.events"
          :fields="fields"
          :selectable="true"
          no-data="Aucun événement"
        >
          <template #actions="{ rowData, actions, status }">
            <button
              v-if="rowData.statut === 4"
              class="btn btn-link border-0"
              @click="actions.toggleDetailRow(rowData.id)"
            >
              <font-awesome-icon
                v-if="status.detailRowVisible || false"
                :icon="['fas', 'angle-down']"
              />
              <font-awesome-icon
                v-if="!status.detailRowVisible || false"
                :icon="['fas', 'angle-right']"
              />
            </button>
          </template>
        </base-table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalMatPersoMateriel',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Événements', key: 'eventType' },
        { title: 'Remarque', key: 'remarque' },
        { title: 'Succès', key: 'succes', type: Boolean },
      ],
      errors: {},
      activeItem: {},
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      types: (state) => state.matPersoType.liste,
      eventTypes: (state) => state.matPersoEventType.liste,
    }),
  },
  mounted() {
    this.activeItem = {
      ...this.activeItem,
      ...this.data,
      events: this.data?.materiel?.events
        ?.map((e) => ({
          ...e,
          eventType: this.eventTypes.find(
            (t) => t.id == e.materiel_event_type_id,
          )?.nom,
        }))
        ?.sort((e1, e2) => e2?.date?.localeCompare(e1?.date)),
    };
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    async save() {
      this.$store
        .dispatch(
          (this.activeItem.id || 0) === 0 ? 'addMatPerso' : 'updateMatPerso',
          [this.activeItem],
        )
        .then(() => {
          this.errors = {};
          this.$awn.success('Modifications enregistrées');
        })
        .catch((errors) => {
          this.errors = {
            ...errors,
          };
          this.$awn.warning(
            errors?.message ?? 'Erreur lors de la modification',
          );
        });
    },
  },
};
</script>

<style scoped></style>
